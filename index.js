/**
 * Serve files in the build directory.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var http   = require('http'),
    path   = require('path'),
    util   = require('util'),
    //glr    = require('gulp-livereload'),
    Plugin = require('spa-gulp/lib/plugin'),
    plugin = new Plugin({name: 'static', entry: 'serve', context: module}),
    ip     = require('ip').address();


// rework profile
plugin.prepare = function ( name ) {
    var profile = this.config[name];

    profile.target = profile.target.replace(/\$\{host}/g, ip);
    profile.target = profile.target.replace(/\$\{port}/g, profile.port);
};


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    var srcDir = path.resolve(profile.data.source),
        server;

    // correct target
    plugin.prepare(profile.name);

    // main entry task
    profile.task(plugin.entry, function ( done ) {
        // rfc 2616 compliant HTTP static file server
        var files = new (require('node-static').Server)(profile.data.source, {cache: profile.data.cache});

        server = http.createServer(function ( request, response ) {
            request.addListener('end', function () {
                // static files
                files.serve(request, response, function serve ( error ) {
                    var address = request.connection.remoteAddress || '[0.0.0.0]'.red,
                        status  = response.statusCode === 200 ? response.statusCode.toString().green : response.statusCode.toString().yellow;

                    if ( error ) {
                        response.end();
                    }

                    // single file serving report
                    profile.notify({
                        type: error ? 'fail' : 'info',
                        info: [
                            address.replace('::ffff:', '').replace(/\./g, '.'.grey),
                            (+new Date()).toString().substr(-3).grey,
                            error ? error.status.toString().red : status,
                            request.method.grey,
                            request.url.replace(/\//g, '/'.grey)
                        ].join('\t'),
                        title: plugin.entry,
                        message: error ? [request.url, '', error.message] : request.url
                    });
                });
            }).resume();
        });

        server.on('listening', function () {
            profile.notify({
                info: [
                    'serve '.green + srcDir.bold + ' at '.green + profile.data.port,
                    'entry '.green + profile.data.target.blue
                ],
                title: plugin.entry,
                message: util.format('serve %s\nat %s', srcDir, ip + ':' + profile.data.port)
            });
        });

        server.on('close', done);

        server.on('error', function ( error ) {
            profile.notify({
                type: 'fail',
                info: error.message,
                title: plugin.entry,
                message: error.message
            });

            done();
        });

        server.listen(profile.data.port);

        // remove the generated file
        profile.task('open', function () {
            open(profile.data.target);
        });

        /*if ( profile.data.livereload ) {
            glr.listen({quiet: true, port: profile.data.livereload === true ? 35729 : profile.data.livereload});

            // reload
            gulp.watch([path.join(process.env.PATH_APP, '**', '*.{html,js,json,css}')]).on('change', function ( file ) {
                // report
                log('watch   '.bgCyan.black, 'reload ' + ('./' + path.relative(process.env.PATH_APP, file.path)).bold);
                // reload
                glr.changed(file);
            });
        }*/
    });

    profile.task('stop', function () {
        if ( server ) {
            profile.notify({
                info: 'stop '.green + srcDir.bold,
                title: 'stop',
                message: 'stop ' + srcDir
            });

            server.close();
        }
    });
});


// public
module.exports = plugin;
