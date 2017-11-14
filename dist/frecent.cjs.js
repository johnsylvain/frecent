'use strict';

var main = (function() {

	const Frecent = function Frecent(items) {
		this.items = [];

		if (items) {
			this.load(items);
		}
	};

	Frecent.prototype.frecency = function frecency(visits, timestamp) {
		function getDays(a, b) {
			const oneDay = 24*60*60*1000;

			return Math.round(Math.abs((a.getTime() - b.getTime())/(oneDay)));
		}

		return (visits * 100) / getDays(new Date(), timestamp)
	};
	
	Frecent.prototype.get = function get() {
		return this.items
			.map(item => Object.assign(
				item, 
				item._weight = this.frecency(item._visits, item._lastVisit)
			))
			.sort((a, b) => a._weight >= b._weight)
	};

	Frecent.prototype.load = function load(items) {
		this.items = items.map(item => ({
			item,
			_visits: 0,
			_lastVisit: null,
			_weight: null
		}));
	};

	Frecent.prototype.visit = function visit(item) {
		let ref = this.items.find(i => i.item === item);
		let idx = this.items.indexOf(ref);

		Object.assign(this.items[idx], {
			_visits: this.items[idx]._visits + 1,
			_lastVisit: new Date()
		});
		
	};

	return Frecent

})();

module.exports = main;
