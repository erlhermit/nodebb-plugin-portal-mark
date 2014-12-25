"use strict";

(function (module, nodebb) {
	//nodebb 3rd modules
	module.S = nodebb.require('string');
	module.async = nodebb.require('async');
	module.nconf = nodebb.require('nconf');
	module.winston = nodebb.require('winston');
	module.validator = nodebb.require('validator');
	//core modules
	module.db = nodebb.require('./database');
	module.settings = nodebb.require('./settings');
	module.meta = nodebb.require('./meta');
	module.privileges = nodebb.require('./privileges');
	module.templates = nodebb.require('templates.js');
	//community core
	module.User = nodebb.require('./user');
	module.Groups = nodebb.require('./groups');
	module.Posts = nodebb.require('./posts');
	module.Topics = nodebb.require('./topics');
	module.Categories = nodebb.require('./categories');
	//utils
	module.helpers = nodebb.require('./controllers/helpers');
	module.translator = nodebb.require('../public/src/translator');
	module.utils = nodebb.require('../public/src/utils');
	//extends
	module.Plugins = nodebb.require('./plugins');
	module.WebSockets = nodebb.require('./socket.io/index');
	module.SocketPlugins = nodebb.require('./socket.io/plugins');
	module.SocketAdmin = nodebb.require('./socket.io/admin').plugins;

	module.checkVersion = function (version) {
		var semver = nodebb.require('semver');
		var pkg = nodebb.require('../package.json');
		if (!semver.gtr(pkg.version.replace('-dev',''), version)) {
			return false;
		}
		return true;
	}
}(module.exports, module.parent.parent.parent));
