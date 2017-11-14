import store from 'store';

var main = (function() {

	const Frecent = function Frecent(items) {
		this.items = store.get('items') || this.mapItems(items) || [];

		this.save(this.items);
	};

	Frecent.prototype.add = function add(item, visits, timestamp) {
		this.items.push({
			item,
			visits, 
			timestamp,
			weight: this.frecency(visits, timestamp || new Date())
		});

		this.save(this.items);
	};
	
	Frecent.prototype.frecency = function frecency(visits, timestamp) {
		function getDays(a, b) {
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

			return Math.round(Math.abs((a.getTime() - b.getTime())/(oneDay)));
		}

		return (visits * 100) / getDays(new Date().now(), timestamp)
	};

	Frecent.prototype.get = function get() {
		return this.items.sort((a, b) => a.weight >= b.weight)
	};

	Frecent.prototype.mapItems = function mapItems(items) {
		return items.map(item => ({
			item,
			visits: 0,
			lastVisit: null,
			weight: null
		}))
	};

	Frecent.prototype.save = function save(items) {
		store.set('items', {
			items: this.items
		});	
	};

	return Frecent

})();

export default main;
