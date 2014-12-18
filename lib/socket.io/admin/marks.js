var Marks = {};

var nodebb = require('../../nodebb'),
	async = nodebb.async;

var config = require('../../config'),
	models = require('../../models');

Marks.create = function (socket, data, callback) {
	if (!data) return callback(new Error('data was null.'));
	if (!data.tag) return callback(new Error('please set mark tag.'));

	var set = {};
	set.name = !data.name ? data.tag : data.name;
	set.tag = data.tag;
	if (data.parent) set[config.db.marks.parent] = data.parent;

	models.marks.createMarkTag(set.tag, set, callback)
};
Marks.update = function (socket, data, callback) {
	if (!data) return callback(new Error('data was null.'));
	if (!data.tag) return callback(new Error('please set mark tag.'));
	var set = {};
	set.name = !data.name ? data.tag : data.name;
	set.tag = data.tag;
	set.parent = data.parent == "" ? undefined : data.parent;

	models.marks.updateMarkTag(set.tag, set, callback);
};
Marks.remove = function (socket, data, callback) {
	if (!data) return callback(new Error('data was null.'));
	if (!data.marks) return callback(new Error('please set mark tag.'));
	async.each(data.marks, function (markTag, next) {
		models.marks.deleteMarkTag(markTag, next);
	}, callback);
};

module.exports = Marks;