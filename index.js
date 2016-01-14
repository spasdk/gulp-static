/**
 * Serve files in the build directory.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path  = require('path'),
    http  = require('http'),
    gulp  = require('gulp'),
    log   = require('gulp-util').log,
    glr   = require('gulp-livereload'),
    load  = require('require-nocache')(module),
    cfg   = path.join(process.env.PATH_ROOT, process.env.PATH_CFG, 'static'),
    title = 'static  '.inverse;


// start serving files
gulp.task('static', function ( done ) {
    var config = load(cfg),
        files, msInit;

    if ( !config.active ) {
        // just exit
        log(title, 'task is disabled'.grey);

        return done();
    }

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
                }

                if ( config.logging ) {
                    msDiff = (msCurr - msInit).toString();
                    msDiff = msDiff.slice(0, -3) + '\t' + msDiff.substr(-3).toString().grey;

                    log(title, [
                        '',
                        msDiff,
                        address,
                        e ? e.status.red : status,
                        request.method.grey,
                        request.url.replace(/\//g, '/'.grey)
                    ].join('\t'));
                }
            });
        }).resume();
    }).listen(config.port).on('listening', function eventListenerListening () {
        var ip   = require('ip').address(),
            msg  = 'Serve application static files ' + path.join(process.env.PATH_ROOT, process.env.PATH_APP),
            hash = new Array(msg.length + 1).join('-');

        log(title, hash);
        log(title, msg.bold);
        log(title, '\trelease: ' + ('http://' + ip + ':' + config.port + '/index.html').green);
        log(title, '\tdevelop: ' + ('http://' + ip + ':' + config.port + '/develop.html').green);
        log(title, hash);
    });

    if ( config.livereload ) {
        glr.listen({quiet: true, port: config.livereload === true ? 35729 : config.livereload});

        // reload
        gulp.watch([path.join(process.env.PATH_APP, '**', '*.{html,js,json,css}')]).on('change', function ( file ) {
            // report
            log('watch   '.bgCyan.black, 'reload ' + ('./' + path.relative(process.env.PATH_APP, file.path)).bold);
            // reload
            glr.changed(file);
        });
    }
});
