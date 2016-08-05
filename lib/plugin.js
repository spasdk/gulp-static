/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var http = require('http'),
    path = require('path'),
    util = require('util'),
    open = require('open'),
    PluginTemplate = require('spa-plugin');


/**
 * @constructor
 * @extends PluginTemplate
 *
 * @param {Object} config init parameters (all inherited from the parent)
 */
function Plugin ( config ) {
    var self = this;

    // parent constructor call
    PluginTemplate.call(this, config);

    // create tasks for profiles
    this.profiles.forEach(function ( profile ) {
        var srcDir = path.resolve(profile.data.source),
            server;

        // main entry task
        profile.task(self.entry, function ( done ) {
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
                            info: 'serve ' + request.url,
                            //title: self.entry,
                            /*info: [
                                '',
                                address.replace('::ffff:', ''),
                                (Date.now()).toString().substr(-3),
                                error ? error.status : status,
                                request.method,
                                request.url
                            ].join('\t'),*/
                            data: {
                                method: request.method,
                                address: address.replace('::ffff:', ''),
                                error: error ? error.message : undefined,
                                status: status
                            }
                        });
                    });
                }).resume();
            });

            server.on('listening', function () {
                // port can be 0 from the start
                profile.data.port = server.address().port;

                // report
                profile.notify({
                    info: 'serve ' + srcDir,
                    data: {
                        host: self.app.host,
                        port: profile.data.port,
                        path: profile.data.target,
                        link: util.format('http://%s:%s/%s', self.app.host, profile.data.port, profile.data.target)
                    }
                });
            });

            server.on('close', done);

            server.on('error', function ( error ) {
                profile.notify({
                    type: 'fail',
                    title: self.entry,
                    info: 'static error',
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
                    info: 'stop serving ' + srcDir
                });

                server.close();
                server = null;
            }
        });
    });

    this.debug('tasks: ' + Object.keys(this.tasks).sort().join(', '));
}


// inheritance
Plugin.prototype = Object.create(PluginTemplate.prototype);
Plugin.prototype.constructor = Plugin;


// public
module.exports = Plugin;
