export default (function () {

  const Frecent = function Frecent(items) {
    this.items = []

    if (items) {
      this.load(items)
    }
  }

  Frecent.prototype.frecency = function frecency(visits, timestamp) {
    function getDays(a, b) {
      const oneDay = 24 * 60 * 60 * 1000;

      return Math.round(Math.abs((a.getTime() - b.getTime()) / (oneDay)));
    }

    const days = getDays(new Date(), timestamp)

    return (visits * 100) / ((days === 0) ? 1 : days)
  }

  Frecent.prototype.get = function get() {
    return this.items
      .map(item => Object.assign(
        item,
        item._weight = this.frecency(item._visits, item._lastVisit)
      ))
      .sort((a, b) => a._weight <= b._weight)
  }

  Frecent.prototype.load = function load(items) {
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

  Frecent.prototype.visit = function visit(key, item, cb) {
    function prop(obj,path) {
      path=path.split('.');
      var res=obj;
      for (var i=0;i<path.length;i++) res=res[path[i]];
      return res;
    }

    let ref = this.items.find(i => prop(i.body, key) === item)
    let idx = this.items.indexOf(ref);

    Object.assign(this.items[idx], {
      _visits: this.items[idx]._visits + 1,
      _lastVisit: new Date()
    })

    if (typeof cb !== 'undefined') cb()
  }

  return Frecent

})()