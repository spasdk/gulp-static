/**
 * Serve files in the build directory.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var http   = require('http'),
    glr    = require('gulp-livereload'),
    Plugin = require('spa-gulp/lib/plugin'),
    plugin = new Plugin({name: 'static', entry: 'serve', context: module});


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    // main entry task
    profile.task(plugin.entry, function ( done ) {
        var files, msInit;

        // rfc 2616 compliant HTTP static file server
        files  = new (require('node-static').Server)(process.env.PATH_APP, {cache: false});
        msInit = +new Date();

        http.createServer(function createServer ( request, response ) {
            request.addListener('end', function eventListenerEnd () {
                // static files
                files.serve(request, response, function serve ( e ) {
                    var msCurr  = +new Date(),
                        address = request.connection.remoteAddress || '[0.0.0.0]'.red,
                        status  = response.statusCode === 200 ? response.statusCode.toString().green : response.statusCode.toString().yellow,
                        msDiff;

                    if ( e ) {
                        response.end();

                        profile.notify({
                            type: 'fail',
                            title: plugin.entry,
                            message: request.url
                        });
                    }

                    if ( profile.data.logging ) {
                        msDiff = (msCurr - msInit).toString();
                        msDiff = msDiff.slice(0, -3) + '\t' + msDiff.substr(-3).toString().grey;

                        profile.notify({
                            info: [
                                '',
                                msDiff,
                                address,
                                e ? e.status.red : status,
                                request.method.grey,
                                request.url.replace(/\//g, '/'.grey)
                            ].join('\t'),
                            title: plugin.entry
                            //message: request.url
                        });
                        //log(title, );
                    }
                });
            }).resume();
        }).listen(profile.data.port).on('listening', function eventListenerListening () {
            var ip   = require('ip').address(),
                msg  = 'Serve application static files ' + profile.data.target,
                hash = new Array(msg.length + 1).join('-');

            profile.notify({
                info: [
                    hash,
                    msg.bold,
                    '\trelease: ' + ('http://' + ip + ':' + profile.data.port + '/index.html').green,
                    '\tdevelop: ' + ('http://' + ip + ':' + profile.data.port + '/develop.html').green,
                    hash
                ],
                title: plugin.entry,
                message: msg
            });

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
});


// public
module.exports = plugin;
