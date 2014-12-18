"use strict";
var nodebb = require('../nodebb'),
	async = nodebb.async;

var config = require('../config'),
	models = require('../models'),
	adminController = {};

adminController.renderAdmin = function (req, res, next) {
	async.parallel({
		marks: function (next) {
			models.marks.getMarks(next);
		},
		settings: function (next) {
			config.getSettings(next);
		}
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		res.render('admin/plugins/portalmark', results);
	});
};

module.exports = adminController;