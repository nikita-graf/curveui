// Обязательная обёртка
module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'js/kinetic.js',
                    'js/global.js',
                    'js/tween.js',
                    'js/menu.js',
                    'js/slideshow.js',
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
                    wrap: true,
                    beautify: false,
                    mangle: true
                },
                files: {
                    'build.min.js': [
                        'js/kinetic.js',
                        'js/global.js',
                        'js/tween.js',
                        'js/slider.js',
                        'js/plugin.js'
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

    // Загрузка плагинов, установленных с помощью npm install

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Задача по умолчанию
    grunt.registerTask('default', ['concat', 'watch']);
};