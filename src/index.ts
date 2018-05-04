import resolve from 'object-path-resolve';
import { Item, Settings } from './interfaces';

export default class Frecent {
  items: Array<Item>;

  constructor(private settings?: Settings, items?: Array<object | Item>) {
    if (items) this.load(items);
  }

  private frecency(visits: number, timestamp: Date): number {
    const ms = {
      hour: 3.6e6,
      day: 8.64e7,
      week: 6.048e8,
      month: 2.628e9
    };
    const decay =
      (new Date().getTime() - timestamp.getTime()) /
      Math.round(Math.abs(ms[this.settings.decay] || ms['day']));

    return visits * (this.settings.weight || 100) / (decay === 0 ? 1 : decay);
  }

  get(): Array<object> {
    this.items = this.items
      .map((item: Item) => ({
        datum: item,
        meta: {
          ...item.meta,
          weight: this.frecency(item.meta.visits, item.meta.lastVisit)
        }
      }))
      .sort((a: Item, b: Item) => b.meta.weight - a.meta.weight);

    return this.items.map((item: Item) => item.datum);
  }

  load(items: Array<Item | object>): object {
    this.items = this.items.map(item => ({
      meta: {
        visits: 0,
        lastVisit: null,
        weight: null
      },
      datum: item
    }));

    return this;
  }

  visit(key: string, item: any): object {
    const ref = this.items.find(i => resolve(i, key) === item);
    const idx = this.items.indexOf(ref);

    Object.assign(this.items[idx].meta, {
      visits: this.items[idx].meta.visits + 1,
      lastVisit: new Date()
    });

    return this;
  }
}
