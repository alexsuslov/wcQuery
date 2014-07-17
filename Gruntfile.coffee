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
    watch:
      config:
        files: ['Gruntfile.coffee']
        tasks: ['coffeelint']
      tests:
        files: ['test/*.coffee']
        tasks: ['coffeelint']
      app:
        files: ['coffee/*.coffee']
        tasks: [
          'coffeelint'
          'coffee'
        ]
  grunt.registerTask('default', [
    'coffeelint'
    'coffee'
    ])
  grunt.registerTask('develop', [
    'coffeelint'
    'coffee'
    'watch'
    ])