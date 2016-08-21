/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path     = require('path'),
    extend   = require('extend'),
    config   = require('spa-plugin/config'),
    profiles = {};


// app develop + release
profiles.default = extend(true, {}, config, {
    // directory to serve
    source: '.',

    // main entry point to load web page
    target: path.join(config.target, 'develop.html?wampPort=9000'),

    // listening port (0 - random)
    port: 8080,

    // amount of seconds to cache static files
    cache: false,

    // info channels
    notifications: {
        popup: {
            info: {icon: path.join(__dirname, 'media', 'info.png')},
            warn: {icon: path.join(__dirname, 'media', 'warn.png')},
            fail: {icon: path.join(__dirname, 'media', 'fail.png')}
        }
    }
});


// management
profiles.webui = extend(true, {}, profiles.default, {
    // directory to serve
    source: path.join(path.dirname(require.resolve('spa-webui')), 'app'),

    // main entry point to load web page
    target: 'release.html?wampPort=9000',

    port: 8000,

    // info channels
    notifications: {
        webui: {
            info: false
        }
    }
});


/*profiles.release = extend(true, {}, config, {
    // directory to serve
    source: config.target,

    // main entry point to load web page
    target: 'release.html',

    // listening port (0 - random)
    port: 8090,

    // amount of seconds to cache static files
    cache: 3600,

    // info channels
    notifications: {
        popup: {
            info: {icon: path.join(__dirname, 'media', 'info.png')},
            warn: {icon: path.join(__dirname, 'media', 'warn.png')},
            fail: {icon: path.join(__dirname, 'media', 'fail.png')}
        }
    }
});


profiles.develop = extend(true, {}, profiles.release, {
    // directory to serve
    source: '.',

    // main entry point to load web page
    target: config.target.replace(/\\/g, '/') + '/develop.html',

    port: 8080,

    // disable static files caching
    cache: false
});/**/


// public
module.exports = profiles;
