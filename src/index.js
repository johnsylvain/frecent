import resolve from 'object-path-resolve'
import { compose } from './utils'

export default (function () {
  const Frecent = function Frecent (settings, items) {
    if (!(this instanceof Frecent)) return new Frecent(settings, items)

    this.items = []
    this.settings = Object.assign({}, this.settings, settings)

    if (items) this.load(items)

    return this
  }

  Frecent.prototype._frecency = function _frecency (visits, timestamp) {
    const ms = {
      hour: 3.6e+6,
      day: 8.64e+7,
      week: 6.048e+8,
      month: 2.628e+9
    }

    const decay = compose(
      (ms) => ((new Date()).getTime() - timestamp.getTime()) / (ms),
      Math.abs,
      Math.round
    )(ms[this.settings.decay] || ms['day'])

    return (visits * 100) / ((decay === 0) ? 1 : decay)
  }

  Frecent.prototype.get = function get () {
    return this.items
      .map(item => Object.assign(
        item,
        { _weight: this._frecency(item._visits, item._lastVisit) }
      ))
      .sort((a, b) => b._weight - a._weight)
  }

  Frecent.prototype.load = function load (items) {
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

  Frecent.prototype.visit = function visit (key, item, cb) {
    const ref = this.items.find(i => resolve(i.body, key) === item)
    const idx = this.items.indexOf(ref)

    Object.assign(this.items[idx], {
      _visits: this.items[idx]._visits + 1,
      _lastVisit: new Date()
    })

    if (typeof cb !== 'undefined') cb()

    return this
  }

  return Frecent
})()
