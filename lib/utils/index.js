var nodebb = require('../nodebb'),
Groups = nodebb.Groups;

var config = require('../config');

(function (utils) {
	//for visit control
	utils.canMark = function (tid, uid, callback) {
		config.getSettings(function(err,setting){
			Groups.isMember(uid, setting.group, callback);
		})
	};


}(module.exports));
