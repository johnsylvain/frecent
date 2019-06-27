class Frecent {
  constructor(settings) {
    this._isClean = true;
    this.items = [];
    this.settings = Object.assign(
      {
        weight: 100,
        decay: "day"
      },
      settings
    );

    return this;
  }

  frecency(visits, timestamp) {
    function ms(key = "day") {
      const mappings = {
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

    return (visits * this.settings.weight) / (decay || 1);
  }

  get(includeMeta) {
    const formatItems = (items, includeMeta) =>
      includeMeta ? items : items.map(item => item.data);

    if (this._isClean) {
      return formatItems(this.items, includeMeta);
    }

    this.items = this.items
      .map(item => ({
        data: item,
        meta: Object.assign(item.meta, {
          weight: this.frecency(
            item.meta.visits,
            item.meta.lastVisit || new Date()
          )
        })
      }))
      .sort((a, b) => b.meta.weight - a.meta.weight);

    this._isClean = true;

    return formatItems(this.items, includeMeta);
  }

  load(items) {
    this._isClean = false;
    this.items = items.map(item =>
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

  visit(predicate) {
    if (typeof predicate !== "function") {
      throw Error(
        "The first argument of visit needs to be a function that returns a boolean."
      );
    }

    const ref = this.items.find(item => predicate(item.data));
    const index = this.items.indexOf(ref);
    this._isClean = false;

    Object.assign(this.items[index].meta, {
      visits: this.items[index].meta.visits + 1,
      lastVisit: new Date()
    });

    return this;
  }
}

export default settings => new Frecent(settings);
