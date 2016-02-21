/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path     = require('path'),
    extend   = require('extend'),
    config   = require('spasdk/config'),
    profiles = {};


// main
profiles.default = extend(true, {}, config, {
    // directory to serve
    source: config.target,

    // main entry point to load web page
    target: 'index.html',

    // listening port (0 - random)
    port: 0,

    // static file server cache activation
    // false to disable or amount of seconds to cache
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


profiles.develop = extend(true, {}, profiles.default, {
    // directory to serve
    source: '.',

    // main entry point to load web page
    target: config.target.replace(/\\/g, '/') + '/develop.html',

    port: 8080,

    // static file server cache activation
    // false to disable or amount of seconds to cache
    cache: false
});


// public
module.exports = profiles;
