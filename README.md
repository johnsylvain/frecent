# Frecent

[![Travis](https://img.shields.io/travis/johnsylvain/frecent.svg)](https://travis-ci.org/johnsylvain/frecent)
[![npm](https://img.shields.io/npm/v/frecent.svg)](https://npmjs.org/package/frecent)

> Manage the "frencency" of objects

### What is frecency?

Frecency is a heuristic that combines frequency and recency into a single measure. It is useful for predicting the likelihood of users revisiting certain links, websites, etc.

More information can be found [here](https://en.wikipedia.org/wiki/Frecency)

## Features

- Simple API
- Lightweight

## Methods

### `frecent.load(items: Array<object>)`

> Load an array of `items` that you wish to be tracked. Ideally, this should be an array of Objects.

### `frecent.visit(prop: string, attr: string [, cb])`

> Visit an item by passing the property path you wish to target (`prop`) and the value of that target property (`attr`). Optional callback (`cb`).

> Example: `frecent.visit('data.name.first', 'John')`. The first argument tells frecent the path to the target path. The second argument should be the expected value to the path specified. See [Usage](#usage) for more details.

### `frecent.get(inclusive: boolean)`

> Retrieve the ranked objects. See [Usage](#usage) to see the returned data structure.

> Set the `inclusive` flag to `true` to get all items with their metadata.

## Usage

```js
import frecent from 'frecent';

const tracker = frecent();

// initialize with custom decay time
// Options: hour, day, week, month
// default: day
const tracker = frecent({
  decay: 'hour',
  weight: 200
});

// Items to be tracked can be loaded from localStorage, a DB, etc
const itemsToTrack = [
  { url: 'https://example.com' },
  { url: 'https://example.org' }
];

// Alternatively, you can load previously parsed data
const itemsToTrack = [
  {
    data: { url: 'https://example.com' },
    meta: {
      visits: 2,
      lastVisited: [Date],
      weight: 140
    }
  },
  {
    data: { url: 'https://example.org' },
    meta: {
      visits: 1,
      lastVisited: [Date],
      weight: 90
    }
  }
];

tracker.load(itemsToTrack);

// 'Visit' a item (will increase the weight of the item.
// Therefore increasing the likelihood of revisiting)
tracker.visit('url', 'https://example.com');

// Example: if object has nested properties
// use dot or bracket syntax to notate nested properties
tracker.visit('data.url', 'https://example.com');

// Retrieve items ranked by 'Frecency'
const ranked = tracker.get();
// [
//   { url: 'https://example.com' }
// ]

// Retrieve items with metadata
const ranked = tracker.get(true);
// [
//   {
//     data: { url: 'https://example.org' },
//     meta: {
//       visits: 1,
//       lastVisited: [Date],
//       weight: 90
//     }
//   }
// ]
```

## Releases

**1.0.4:** Specify a custom decay time

**1.0.3:** Use dot or bracket notation in `visit` method via [object-path-resolve](https://github.com/johnsylvain/object-path-resolve)

## Contributing

You can request a new feature by submitting an issue. If you would like to implement a new feature feel free to issue a Pull Request.

## License

Frecent is protected under the [MIT License](https://github.com/johnsylvain/frecent/blob/master/LICENSE)
