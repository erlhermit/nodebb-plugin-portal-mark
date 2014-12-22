"use strict";
var nodebb = require('./nodebb'),
Groups = nodebb.Groups,
translator = nodebb.translator;
var config = require('./config');
var controllers = require('./controllers'),
	middleware = require('./middleware'),
	routes = require('./routes'),
	socket = require('./socket.io');
module.exports = function (router_, middleware_, controllers_, callback) {
	controllers = controllers.extend(controllers_);
	middleware = middleware(router_, middleware_);
	routes(router_, middleware, controllers);
	socket.init(controllers);

	var settings = require('./settings-default.json');
	Groups.exists(settings.group, function (err, exists) {
		if (!exists) {
			translator.translate('[[portalmark:group.description]]', function (desc) {
				Groups.create(settings.group, desc, function (err) {
					console.log(config.plugin.id + ': create group [' + settings.group + ': ' + desc + ']');
					callback();
				});
			});
		} else {
			callback();
		}
	});
};
