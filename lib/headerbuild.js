var config = require('./config');
(function (headers) {
	headers.admin = function (header, callback) {
		header.plugins.push(config.header.admin);
		callback(null, header);
	};
	headers.header = function (header, callback) {
		header.navigation.push(config.header.portal);
		callback(null, header);
	}

}(module.exports))
