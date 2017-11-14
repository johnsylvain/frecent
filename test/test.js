import Frecent from '../src/main'

describe('Frecent', function() {

	beforeEach(() => {
		this.frecent = new Frecent()
	})

	it('should be an instance', () => {
		expect(this.frecent).toBeInstanceOf(Frecent)
	})

})