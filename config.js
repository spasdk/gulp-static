/**
 * HTTP static server configuration for static gulp task.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var extend = require('extend'),
    config = require('spa-gulp/config'),
    path   = config.default.target.replace(/\\/g, '/');


// base config
// each profile inherits all options from the "default" profile
module.exports = extend(true, {}, config, {
    default: {
        // directory to serve
        source: '.',

        // main entry point to load web page
        target: 'http://${host}:${port}/' + path + '/index.html',

        // listening HTTP port to serve project files
        port: 'auto',

        // static file server cache activation
        // false to disable or amount of seconds to cache
        cache: false,

        // enable automatic reload on file changes mode
        // set boolean value "true" to work on the default port 35729
        // or specify some custom port value
        livereload: true
    },

    develop: {
        target: 'http://${host}:${port}/' + path + '/develop.html'
    }
});
