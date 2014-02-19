
module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'js/kinetic.js',
                    'js/global.js',
                    'js/tween.js',
                    'js/menu.js',
                    'js/plugin.js'
                ],
                dest: 'build.min.js',
                options: {
                    banner: "(function(window){\n ",
                    footer: "})(window);"
                }
            }
        },
        uglify: {
            main: {
                options: {
//                    wrap: true,
                    beautify: false,
                    mangle: true
                },
                files: {
                    'build.min.js': [
                        'build.min.js'
                    ]
                }
            }
        },

        watch: {
            files: ['js/*.js'],
            tasks: ['concat'],
            options: {
                interval: 1007
            }
        }
    });



    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('default', ['concat', 'watch']);
    grunt.registerTask('build', ['concat', 'uglify']);
};