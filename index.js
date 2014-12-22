var hooks = require('./lib/hooks');
var configjosn = require('./plugin.json');
(function (plugin) {

	hooks(plugin, configjosn.hooks);

}(module.exports));
