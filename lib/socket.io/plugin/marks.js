var Marks = {};

var nodebb = require('../../nodebb'),
async = nodebb.async;

var config = require('../../config'),
utils = require('../../utils'),
models = require('../../models');


Marks.get = function (socket, data, callback) {
  models.marks.getMarks(callback);
};
Marks.check = function (socket, data, callback) {
  //TODO maybe the topic is locked?
  async.parallel({
    pass: async.apply(utils.canMark, -1, socket.uid),
    marked: data ? async.apply(models.marks.isExistsTopic, data.tid) : false,
  }, callback);
};
Marks.views = function (socket, data, callback) {
  models.article.getAndUpdateArticlesVies(data.tids, callback);
};
module.exports = Marks;
