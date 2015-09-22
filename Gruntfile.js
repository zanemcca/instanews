module.exports = function(grunt) {
  grunt.initConfig({
    //Loopback angular sdk generator
    loopback_sdk_angular: {
      services: {
        options: {
          input: 'server/server.js',
          output: 'client/app/scripts/lb-services.js'
        }
      }
    },
    //Docular generator for API docs
    docular: {
      useHtml5Mode: true,
      docular_webapp_target: './docs',
      groups: [
        {
          groupTitle: 'Instanews',
          groupId: 'loopback',
          sections: [
            {
              id: 'lbServices',
              title: 'LoopBack Services',
              scripts: [ 'client/app/scripts/lb-services.js' ]
            }
          ]
        }
      ]
    },
    // Static file server for docs
    nodestatic: {
      docs: {
        options: {
          port: 4000,
          base: 'docs'
        }
      },
      coverage: {
        options: {
          port: 5000,
          base: 'coverage/lcov-report'
        }
      }
    },
    //Solo mocha testing
    mochaTest: {
      all: {
        src: ['test/unit/test.js', 'test/integration/test.js'],
        options: {
          reporter: 'spec',
          bail: true
        }
      },
      unit: {
        src: ['test/unit/test.js'],
        options: {
          reporter: 'spec'
        }
      },
      integration: {
        src: ['test/integration/test.js'],
        options: {
          reporter: 'spec',
          bail: true
        }
      }
    },
    //Mocha-istanbul testing
    mocha_istanbul: {
      unit: {
        src: 'test/unit',
        root: './server',
        options: {
          excludes: ['./server/boot/**']
        }
      },
      integration: {
        src: 'test/integration',
        root: './server'
      },
      all: {
        src: ['test/unit', 'test/integration'],
        root: './server'
      }
    },
    //Istanbul check coverage
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
          check: {
            lines: 60 ,
            statements: 60,
            branches: 60,
            functions: 60
          }
        }
      }
    },
    //File and URL opener
    open: {
      coverage: {
        path: 'coverage/lcov-report/index.html'
      },
      server: {
        path: 'http://localhost:3000'
      },
      explorer: {
        path: 'http://localhost:3000/explorer'
      },
      docs: {
        path: 'http://localhost:4000'
      }
    },
    //Shell commands
    shell: {
      debug: {
        command: function (file) { 
          //return 'node-debug --no-preload ' + file;
          return 'node-debug --ignore "**/node_modules/**" ' + file;
        }
      },
      debugTest: {
        command: function (file) { 
          return 'node-debug --ignore "**/node_modules/**" _mocha --no-timeouts ' + file;
        }
      }
    },
    //Express server
    express: {
      options: {
        livereload: true
      },
      dev: {
        options: {
          script: 'server/server.js'
        }
      },
      prod: {
        options: {
          node_env: 'production',
          script: 'server/server.js'
        }
      }
    },
    //Watch tasks
    watch: {
      server: {
        files: ['server/**/*'],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      },
      docs: {
        files: ['docs/*'],
        tasks: ['nodestatic:docs']
      }
    },
    //Jshint
    jshint: {
      server: {
        options: {
          esnext: true
        },
        files: {
          src: ['Gruntfile.js', 'server/**/*.js', 'test/**/**/*.js'],
        }
      },
      client: ['client/app/scripts/**/*.js' , 'client/test/**/**/*.js']
    }
  });

  // Load the plugin that provides the "loopback-sdk-angular" and "grunt-docular" tasks.
  grunt.loadNpmTasks('grunt-loopback-sdk-angular');
  grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-nodestatic');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');


  /**
   * Grunt Task definitions
   */
  //Serve the webpage
  // Start the web server
  grunt.registerTask('start', ['jshint:server', 'express:dev', 'watch:server']);

  // Debug the server
  // Ex. 'grunt debug:server/serverj.js' --> 'node-debug --no-preload server/server.js'
  grunt.registerTask('debug', function (option) {
    var command = 'shell:debug:';
    var file = '';
    if(!option) {
      file = 'server/server.js';
    } else {
      switch(option) {
        case 'server':
          file = 'server/server.js';
        break;
        case 'integration':
          command = 'shell:debugTest:';
          file = 'test/integration/test.js';
        break;
        case 'unit':
          command = 'shell:debugTest:';
          file = 'test/unit/test.js';
        break;
        default:
          file = option;
        break;
      }
    }
    if(file.slice(file.length - 3) !== '.js') {
      file += '.js';
    }

    grunt.task.run(command + file);
  });

  // Start and open the web server
  grunt.registerTask('serve', ['jshint:server', 'express:dev', 'open:server', 'watch:server']);

  // Start and open the web server explorer
  grunt.registerTask('explorer', ['jshint:server', 'express:dev', 'open:explorer', 'watch:server']);


  // Generate the angular sdk and update the docs
  grunt.registerTask('sdk', ['loopback_sdk_angular', 'docs:gen']);

  // Docs generation and serving 
  grunt.registerTask('docs', ['docular', 'nodestatic:docs', 'open:docs', 'watch:docs']);

  //generate the docs
  grunt.registerTask('docs:gen', ['docular']);

  // serve the docs
  grunt.registerTask('docs:serve', ['nodestatic:docs', 'open:docs', 'watch:docs']);


  //TODO Front end testing and coverage 
  //Coverage reporting and testing
  grunt.registerTask('coverage', ['jshint:server', 'mocha_istanbul:all', 'istanbul_check_coverage']);
  grunt.registerTask('coverage:unit', ['jshint:server', 'mocha_istanbul:unit', 'istanbul_check_coverage']);
  grunt.registerTask('coverage:integration', ['jshint:server', 'mocha_istanbul:integration', 'istanbul_check_coverage']);
  grunt.registerTask('coverage:open', ['open:coverage']);

  // Check the coverage report
  grunt.registerTask('check', ['jshint:server', 'istanbul_check_coverage']);

  // Just run the tests
  grunt.registerTask('test', ['jshint:server', 'mochaTest:all']);
  grunt.registerTask('test:unit', ['jshint:server', 'mochaTest:unit']);
  grunt.registerTask('test:integration', ['jshint:server', 'mochaTest:integration']);

  // Shortcuts
  grunt.registerTask('ci', 'coverage:integration');
  grunt.registerTask('cu', 'coverage:unit');
  grunt.registerTask('ca', 'coverage');

  grunt.registerTask('ti', 'test:integration');
  grunt.registerTask('tu', 'test:unit');
  grunt.registerTask('ta', 'test');
};
