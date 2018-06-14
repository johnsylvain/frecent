import resolve from 'object-path-resolve';
import { Item, Settings } from './interfaces';

class Frecent {
  items: Item[];

  constructor(private settings?: Settings) {}

  private frecency(visits: number, timestamp: Date): number {
    function ms(key: string = 'day') {
      const mappings: { [key: string]: number } = {
        hour: 3.6e6,
        day: 8.64e7,
        week: 6.048e8,
        month: 2.628e9
      };

      return mappings[key];
    }
    const decay = Math.round(
      Math.abs(
        (new Date().getTime() - timestamp.getTime()) / ms(this.settings.decay)
      )
    );

    return (visits * (this.settings.weight || 100)) / (decay || 1);
  }

  get(): object[] {
    this.items = this.items
      .map((item: Item) => ({
        data: item,
        meta: {
          weight: this.frecency(item.meta.visits, item.meta.lastVisit),
          ...item.meta
        }
      }))
      .sort((a: Item, b: Item) => b.meta.weight - a.meta.weight);

    return this.items.map((item: Item) => item.data);
  }

  load(items: Array<Item | object>): object {
    this.items = items.map(
      (item: any) =>
        !item.data || !item.meta
          ? {
              meta: {
                visits: 0,
                lastVisit: null,
                weight: null
              },
              data: item
            }
          : item
    );

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

export default (s?: Settings) => new Frecent(s);
