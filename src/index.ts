import resolve from 'object-path-resolve'

interface Item {
    body: object;
    _visits: number;
    _lastVisit: Date;
    _weight: object;
}

interface Settings {
  decay: string;
}

export default class Frecent {
  items: Item[];
  settings: Settings;

  constructor (settings: Settings, items: Array<object|Item>) {
    this.settings = settings;

    if (items) this.load(items)
  }

  private _frecency (visits: number, timestamp: Date): number {
    const ms = { hour: 3.6e+6, day: 8.64e+7, week: 6.048e+8, month: 2.628e+9 };
    const decay = ((new Date()).getTime() - timestamp.getTime()) / Math.round(Math.abs(ms[this.settings.decay] || ms['day']))

    return (visits * 100) / ((decay === 0) ? 1 : decay)
  }

  get (): Item[] {
    return this.items
      .map(item => Object.assign(
        item,
        { _weight: this._frecency(item._visits, item._lastVisit) }
      ))
      .sort((a, b) => b._weight - a._weight)
  }

  load (items: Array<Item|any>): object {
    this.items = items.map(item => (!item.body)
      ? {
        body: item,
        _visits: 0,
        _lastVisit: null,
        _weight: null
      }
      : item
    )

    return this
  }

  visit (key: string, item: any, cb: Function): object {
    const ref = this.items.find(i => resolve(i.body, key) === item)
    const idx = this.items.indexOf(ref)

    Object.assign(this.items[idx], {
      _visits: this.items[idx]._visits + 1,
      _lastVisit: new Date()
    })

    if (typeof cb !== 'undefined') cb()

    return this
  }
}
