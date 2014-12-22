"use strict";

var Controllers = {
	portalmark: {
		admin: require('./admin'),
		portals: require('./portals'),
		article: require('./article')
	}
}

Controllers.extend = function (target) {
	for (var n in Controllers) {
		if (n != 'extend') {
			target[n] = Controllers[n];
		}
	}
	return target;
}

module.exports = Controllers;
