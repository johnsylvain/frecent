import Frecent from '../src/main'

describe('Frecent', function() {

  beforeEach(() => {
    this.frecent = new Frecent()
  })

  it('should be an instance', () => {
    expect(this.frecent).toBeInstanceOf(Frecent)
  })

  it('should load items', () => {
    this.frecent.load([
      { url: 'https://exmaple.com' },
      { url: 'https://exmaple.org' }
    ])

    expect(this.frecent.items.length).toBe(2)
  })

  it('should compute frecency', () => {
    const items = [
      { url: 'https://exmaple.com' },
      { url: 'https://exmaple.org' }
    ]
    
    this.frecent.load(items)

    this.frecent.visit(items[0])
    this.frecent.visit(items[0])
    this.frecent.visit(items[1])

    console.log(this.frecent.get())

    
  })

})