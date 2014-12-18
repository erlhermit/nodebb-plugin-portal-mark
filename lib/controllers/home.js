"use strict";

var homeController = {};

homeController.render = function (reg, res, next) {
	res.render('homepage', {
		page: 'hello'
	});
};

module.exports = homeController;