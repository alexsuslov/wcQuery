module.exports = (grunt)->
  require('load-grunt-tasks')(grunt)
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    coffeelint:
      app: ['Gruntfile.coffee','coffee/*.coffee']
    coffee:
      compile:
        options:
          bare: true
          # sourceMap: true
        files:
          'index.js':[
            'coffee/*.coffee'
            '!coffee/99*.coffee'
          ]
    mochaTest:
      test:
        options:
          reporter: 'spec'
          require: 'coffee-script/register'
        src:['test/**/*.coffee']
    watch:
      config:
        files: ['Gruntfile.coffee']
        tasks: ['coffeelint']
      tests:
        files: ['test/*.coffee']
        tasks: ['coffeelint', 'mochaTest']
      app:
        files: ['coffee/*.coffee']
        tasks: [
          'coffeelint'
          'mochaTest'
          'coffee'
        ]
  grunt.registerTask('default', [
    'coffeelint'
    'mochaTest'
    'coffee'
    ])
  grunt.registerTask('develop', [
    'coffeelint'
    'mochaTest'
    'coffee'
    'watch'
    ])