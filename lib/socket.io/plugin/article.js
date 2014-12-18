var Article = {};

var nodebb = require('../../nodebb'),
async = nodebb.async;

var config = require('../../config'),
utils = require('../../utils'),
models = require('../../models');


Article.get = function (socket, data, callback) {
  models.article.getTopicMark(data.tid, callback);
};
Article.mark = function (socket, data, callback) {
  if (!data || !Array.isArray(data.tids) || !data.markTag) {
    return callback(new Error('[[error:invalid-data]]'));
  }
  models.article.markTopics(socket.uid, data.tids, data.markTag, callback);
};
Article.unmark = function (socket, data, callback) {
  if (!data || !Array.isArray(data.tids)) {
    return callback(new Error('[[error:invalid-data]]'));
  }
  models.article.unmarkTopics(socket.uid, data.tids, callback);
};
module.exports = Article;
