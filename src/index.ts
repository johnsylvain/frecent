import resolve from 'object-path-resolve';
import { Item, Settings } from './interfaces';

export default class Frecent {
  items: Item[];

  constructor(private settings?: Settings, items?: Array<object | Item>) {
    if (items) this.load(items);
  }

  private _frecency(visits: number, timestamp: Date): number {
    const ms = { hour: 3.6e6, day: 8.64e7, week: 6.048e8, month: 2.628e9 };
    const decay =
      (new Date().getTime() - timestamp.getTime()) /
      Math.round(Math.abs(ms[this.settings.decay] || ms['day']));

    return visits * 100 / (decay === 0 ? 1 : decay);
  }

  get(): Item[] {
    return this.items
      .map(item =>
        Object.assign(item, {
          _weight: this._frecency(item._visits, item._lastVisit)
        })
      )
      .sort((a, b) => b._weight - a._weight);
  }

  load(items: Array<Item | object>): object {
    this.items = this.items.map(item => ({
      _visits: 0,
      _lastVisit: null,
      _weight: null,
      ...item
    }));

    return this;
  }

  visit(key: string, item: any): object {
    const ref = this.items.find(i => resolve(i, key) === item);
    const idx = this.items.indexOf(ref);

    Object.assign(this.items[idx], {
      _visits: this.items[idx]._visits + 1,
      _lastVisit: new Date()
    });

    return this;
  }
}
