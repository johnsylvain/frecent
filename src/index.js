import resolve from "object-path-resolve";

class Frecent {
  constructor(settings) {
    this.clean = true;
    this.items = [];
    this.settings = settings;

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
        (new Date().getTime() - timestamp.getTime()) /
          ms(this.settings && this.settings.decay)
      )
    );

    return (
      (visits * ((this.settings && this.settings.weight) || 100)) / (decay || 1)
    );
  }

  get(includeMeta) {
    const formatItems = (items, includeMeta) =>
      includeMeta ? items : items.map(item => item.data);

    if (this.clean) return formatItems(this.items, includeMeta);

    this.items = this.items
      .map(item => ({
        data: item,
        meta: {
          ...item.meta,
          weight: this.frecency(item.meta.visits, item.meta.lastVisit)
        }
      }))
      .sort((a, b) => b.meta.weight - a.meta.weight);

    this.clean = true;

    return formatItems(this.items, includeMeta);
  }

  load(items) {
    this.clean = false;
    this.items = items.map(
      item =>
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

  visit(key, item) {
    const ref = this.items.find(i => resolve(i.data, key) === item);
    const idx = this.items.indexOf(ref);
    this.clean = false;

    Object.assign(this.items[idx].meta, {
      visits: this.items[idx].meta.visits + 1,
      lastVisit: new Date()
    });

    return this;
  }
}

export default settings => new Frecent(settings);
