import resolve from 'object-path-resolve'

export default (function () {
  const Frecent = function Frecent (items) {
    if (!(this instanceof Frecent)) return new Frecent(items)

    this.items = []

    if (items) {
      this.load(items)
    }

    return this
  }

  Frecent.prototype._frecency = function _frecency (visits, timestamp) {
    const oneDay = 24 * 60 * 60 * 1000
    const days = Math.round(Math.abs(((new Date()).getTime() - timestamp.getTime()) / (oneDay)))

    return (visits * 100) / ((days === 0) ? 1 : days)
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
    const predicate = item => {
      if (!item.body) {
        return {
          body: item,
          _visits: 0,
          _lastVisit: null,
          _weight: null
        }
      }
      return item
    }

    this.items = items.map(predicate)
  }

  Frecent.prototype.visit = function visit (key, item, cb) {
    const ref = this.items.find(i => resolve(i.body, key) === item)
    const idx = this.items.indexOf(ref)

    Object.assign(this.items[idx], {
      _visits: this.items[idx]._visits + 1,
      _lastVisit: new Date()
    })

    if (typeof cb !== 'undefined') cb()
  }

  return Frecent
})()
