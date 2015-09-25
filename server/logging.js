
var chalk = require('chalk');
var sprintf = require('sprintf-js').sprintf;
var debuggers = {};

//var verbose = false;
var verbose = true;

var debug = function(debugString) {
  if(!debuggers.hasOwnProperty(debugString)) { 
    var dbg = require('debug')(debugString);
    debuggers[debugString] = function(funcName, obj) {
      if(verbose) {
        return dbg(chalk.bold(funcName) + '\n' + JSON.stringify(obj, 'utf8', '  '));
      } else {
        return dbg(chalk.bold(funcName));
      }
    };
  }
  return debuggers[debugString];
};

function colorConsole() {
  [
    [ 'warn',  'yellow', 'yellow' ],
    [ 'error', 'red', 'bold'],
    //  [ 'log',   'cyan'  ]
  ].forEach(function(pair) {
    var method = pair[0], color = pair[1], color2 = pair[2];
    var oldCall = console[method];
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      if(args.length > 0) {
        var input = method.toUpperCase() + ': '; 
        input = chalk[color](input);
        if(args.length === 1) {
          input += chalk[color2](args[0]);
        } else {
          input += chalk[color2](sprintf.apply(sprintf,args));
        }
        oldCall(input);
      } else  {
        oldCall();
      }
    };
  });
}

colorConsole();

exports.debug = debug;
