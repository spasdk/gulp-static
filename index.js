/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var http   = require('http'),
    path   = require('path'),
    util   = require('util'),
    open   = require('open'),
    Plugin = require('spasdk/lib/plugin'),
    plugin = new Plugin({name: 'static', entry: 'serve', config: require('./config')}),
    ip     = require('ip').address();


// rework profile
//plugin.prepare = function ( name ) {
//    var profile = this.config[name];
//
//    profile.target = profile.target.replace(/\$\{host}/g, ip);
//    profile.target = profile.target.replace(/\$\{port}/g, profile.port);
//};


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    var srcDir = path.resolve(profile.data.source),
        server;

    // correct target
    //plugin.prepare(profile.name);

    // main entry task
    profile.task(plugin.entry, function ( done ) {
        // rfc 2616 compliant HTTP static file server
        var files = new (require('node-static').Server)(profile.data.source, {cache: profile.data.cache});

        server = http.createServer(function ( request, response ) {
            request.addListener('end', function () {
                // static files
                files.serve(request, response, function serve ( error ) {
                    var address = request.connection.remoteAddress || '[0.0.0.0]',
                        status  = response.statusCode === 200 ? response.statusCode : response.statusCode;

                    if ( error ) {
                        response.end();
                    }

                    // single file serving report
                    profile.notify({
                        type: error ? 'fail' : 'info',
                        title: plugin.entry,
                        message: [
                            address.replace('::ffff:', ''),
                            (+new Date()).toString().substr(-3),
                            error ? error.status : status,
                            request.method,
                            request.url
                        ].join('\t')
                    });
                });
            }).resume();
        });

        server.on('listening', function () {
            // port can be 0 from the start
            profile.data.port = server.address().port;

            // report
            profile.notify({
                title: plugin.entry,
                message: util.format('serve %s with entry http://%s:%s/%s', srcDir, ip, profile.data.port, profile.data.target)
            });
        });

        server.on('close', done);

        server.on('error', function ( error ) {
            profile.notify({
                type: 'fail',
                title: plugin.entry,
                message: error.message
            });

            done();
        });

        server.listen(profile.data.port);
    });

    // open page in browser
    profile.task('open', function () {
        open(profile.data.target);
    });

    profile.task('stop', function () {
        if ( server ) {
            profile.notify({
                title: 'stop',
                message: 'stop ' + srcDir
            });

            server.close();
            server = null;
        }
    });
});


// public
module.exports = plugin;
