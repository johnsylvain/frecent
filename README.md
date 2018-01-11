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
### `frecent.load(items)`
> Load an array of `items` that you wish to be tracked. Ideally, this should be an array of Objects.

### `frecent.visit(prop, attr, [cb])`
> Visit an item by passing the property path you wish to target (`prop`) and the value of that target property (`attr`). Optional callback (`cb`).

> Example: `frecent.visit('data.name.first', 'John')`. The first argument tells frecent the path to the target path. The second argument should be the expected value to the path specified. See [Usage](#usage) for more details.

### `frecent.get()`
> Retrieve the ranked objects. See [Usage](#usage) to see the returned data structure.

## Usage
```js
import Frecent from 'frecent'

const frecent = new Frecent()

// Items to be tracked can be loaded from localStorage, a DB, etc
const itemsToTrack = [
    { url: 'https://example.com' },
    { url: 'https://example.org' }
]

// Alternatively, you can load previously parsed data
const itemsToTrack = [
  { 
    body: {url: 'https://example.com' },
    _visits: 2,
    _lastVisited: [Date|Timestamp],
    _weight: 140
  },
  { 
    body: {url: 'https://example.org' }, 
    _visits: 1,
    _lastVisited: [Date|Timestamp],
    _weight: 90
  }
]

frecent.load(itemsToTrack)

// 'Visit' a item (will increase the weight of the item.
// Therefore increasing the likelihood of revisiting)
frecent.visit('url', 'https://example.com')

// Example: if object has nested properties
// use dot or bracket syntax to notate nested properties
frecent.visit('data.url', 'https://example.com')

// Retrieve items ranked by 'Frecency'
const ranked = frecent.get()
// [
//   {
//     body: { url: 'https://example.com' },
//     _visits: 1, 
//     _lastVisited: [Date], 
//     _weight: 100, 
//   }
// ]

```
## Releases
__1.0.2:__ Use dot or bracket notation in `visit` method via [object-path-resolve](https://github.com/johnsylvain/object-path-resolve)

## Contributing
You can request a new feature by submitting an issue. If you would like to implement a new feature feel free to issue a Pull Request.

## License
Frecent is protected under the [MIT License](https://github.com/johnsylvain/frecent/blob/master/LICENSE)
