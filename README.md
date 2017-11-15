# Frecent
[![Travis](https://img.shields.io/travis/johnsylvain/frecent.svg)](https://travis-ci.org/johnsylvain/frecent)
> Manage the "frencency" of objects

### What is frecency?
Frecency is a heuristic that combines frequency and recency into a single measure. It is useful for predicting the likelihood of users revisiting certain links, websites, etc.

More information can be found [here](https://en.wikipedia.org/wiki/Frecency)

## Features
- Simple API
- Lightweight

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
    _lastVisited: [Date],
    _weight: 140
  },
  { 
    body: {url: 'https://example.org' }, 
    _visits: 1,
    _lastVisited: [Date],
    _weight: 90
  }
]

frecent.load(itemsToTrack)

// 'Visit' a item (will increase the weight of the item.
// Therefore increasing the likelihood of revisiting)
frecent.visit('url', 'https://example.com')

// Example: if object has nested properties
// use dot syntax to notate nesting
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

## Contributing
You can request a new feature by submitting an issue. If you would like to implement a new feature feel free to issue a Pull Request.

## License
Frecent is protected under the [MIT License](https://github.com/johnsylvain/frecent/blob/master/LICENSE)
