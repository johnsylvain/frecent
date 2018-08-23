import * as resolve from 'object-path-resolve';
import { Item, Settings } from './interfaces';

class Frecent {
  public items: Item[];
  private clean: boolean = true;

  constructor(private settings?: Settings) {}

  private frecency(visits: number, timestamp: Date): number {
    function ms(key: string = 'day'): number {
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
        (new Date().getTime() - timestamp.getTime()) / ms(this.settings && this.settings.decay)
      )
    );

    return (visits * ((this.settings && this.settings.weight) || 100)) / (decay || 1);
  }

  get(inclusive: boolean): object[] {
    const formatItems = (items: Item[], inclusive: boolean): object[] =>
      inclusive ? items : items.map((item: Item) => item.data);

    if (this.clean) return formatItems(this.items, inclusive);

    this.items = this.items
      .map((item: Item) => ({
        data: item,
        meta: {
          ...item.meta,
          weight: this.frecency(item.meta.visits, item.meta.lastVisit)
        }
      }))
      .sort((a: Item, b: Item) => b.meta.weight - a.meta.weight);

    this.clean = true;

    return formatItems(this.items, inclusive);
  }

  load(items: Array<Item | object>): object {
    this.clean = false;
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
    const ref = this.items.find((i: Item) => resolve(i.data, key) === item);
    const idx = this.items.indexOf(ref);
    this.clean = false;

    Object.assign(this.items[idx].meta, {
      visits: this.items[idx].meta.visits + 1,
      lastVisit: new Date()
    });

    return this;
  }
}

export default (s?: Settings) => new Frecent(s);
