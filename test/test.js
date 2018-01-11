import Frecent from '../src'

describe('Frecent', function() {

  beforeEach(() => {
    this.frecent = new Frecent()
  })

  it('should be an instance', () => {
    expect(this.frecent).toBeInstanceOf(Frecent)
  })

  it('should load items', () => {
    this.frecent.load([
      { url: 'https://example.com' },
      { url: 'https://example.org' }
    ])

    expect(this.frecent.items.length).toBe(2)
  });

  it('should load formatted items', () => {
    const items = [
      { 
        body: {url:'https://example.com'}, 
        _visits: 2, 
        _lastVisit: new Date(2017,11,10), 
        _weight: 100 
      }
    ]

    this.frecent.load(items)

    expect(this.frecent.items).toEqual(items)
  })

  it('should compute frecency', () => {
    const items = [
      { url: 'https://example.com' },
      { url: 'https://example.org' }
    ];
    
    this.frecent.load(items)

    this.frecent.visit('url', 'https://example.com')
    this.frecent.visit('url', 'https://example.com')
    this.frecent.visit('url', 'https://example.org')
    this.frecent.visit('url', 'https://example.org')
    this.frecent.visit('url', 'https://example.org')

    expect(this.frecent.get()[0].body).toEqual(items[1])

    
  })

  it('should compute frecency with nested parameters using dot notation', () => {
    const items = [
      { 
        data: {
          url: 'https://example.com' 
        } 
      },
      { 
        data: {
          url: 'https://example.org' 
        } 
      }
    ];
    
    this.frecent.load(items)

    this.frecent.visit('data.url', 'https://example.com')
    this.frecent.visit('data.url', 'https://example.com')
    this.frecent.visit('data.url', 'https://example.org')
    this.frecent.visit('data.url', 'https://example.org')
    this.frecent.visit('data.url', 'https://example.org')

    expect(this.frecent.get()[0].body).toEqual(items[1])

    
  })

  it('should compute frecency with nested parameters using bracket notation', () => {
    const items = [
      { 
        data: {
          url: 'https://example.com' 
        } 
      },
      { 
        data: {
          url: 'https://example.org' 
        } 
      }
    ];
    
    this.frecent.load(items)

    this.frecent.visit('data["url"]', 'https://example.com')
    this.frecent.visit('data["url"]', 'https://example.com')
    this.frecent.visit('data["url"]', 'https://example.org')
    this.frecent.visit('data["url"]', 'https://example.org')
    this.frecent.visit('data["url"]', 'https://example.org')

    expect(this.frecent.get()[0].body).toEqual(items[1])

    
  })

})