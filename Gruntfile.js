module.exports = function( grunt ) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: [
                    'app/app.js',
                    'app/controllers/*.js',
                    'app/services/*.js',
                    'content/css/bubblesu-site.css',
                    'theme/TleBs3/css/*.css',
                    'theme/TleBs3/js/*.js'
                ],
                tasks: ['cacheBust'],
                options: {
                    spawn: false,
                }
            },
            sass: {
                files: ['content/sass/**/*.{scss,sass}','content/sass/_partials/**/*.{scss,sass}'],
                tasks: ['sass:dist']
            },
            livereload: {
                files: ['*.html', 'content/js/**/*.{js,json}', 'content/css/*.css','content/img/**/*.{png,jpg,jpeg,gif,webp,svg}', 'app/**/*.{js,html}'],
                options: {
                    livereload: true
                }
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                rename: false,
                ignorePatterns: ['/bower_components/']
            },
            assets: {
                files: {
                    src: ['index.html']
                }
            }
        },
        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'compressed'
            },
            dist: {
                files: {
                    'content/css/bubblesu-site.css': 'content/sass/bubblesu-site.scss'
                }
            }
        },
        connect: {
            server: {
                options: {
                    middleware: function(connect, options, middleware) {
                        middleware.unshift(history())
                        return middleware
                    },
                    hostname : 'localhost',
                    port: 8080,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');

    var history = require('connect-history-api-fallback')

    // Default task(s).
    grunt.registerTask('default', ['sass:dist', 'connect', 'watch']);
};