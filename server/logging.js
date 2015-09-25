
var chalk = require('chalk');
var sprintf = require('sprintf-js').sprintf;
var debuggers = {};

//var verbose = false;
//
var summarize = function (object) {
  if(object) {
    var summary = '';
    switch(typeof(object)) {
      case 'string':
      if(object.length > 25) {
        summary += object.slice(0, 25) + '... ';
      } else {
        summary += '\'' + object +'\'';
      }
      break;
      case 'number':
        summary += object;
      break;
      case 'boolean':
        summary += object;
      break;
      default:
        summary += typeof(object);
      break;
    }
    return summary;
  } else {
    return JSON.stringify(object);
  }
};

var debug = function(debugString) {
  var verbose = process.env.VERBOSE === 'true' ? true: false;

  debugString = 'insta:' + debugString;
  if(!debuggers.hasOwnProperty(debugString)) { 
    var dbg = require('debug')(debugString);
    debuggers[debugString] = function() {
      var args = Array.prototype.slice.call(arguments);
      var funcName = args[0];
      var obj = args.slice(1);

      if(verbose) {
        return dbg(chalk.bold(funcName) + '\n' + JSON.stringify(obj, 'utf8', '  '));
      } else {
        var name = chalk.bold(funcName);
        if(obj) {
          name += '\t';
          if(Array.isArray(obj)) {
            name += '[';
            for(var i= 0; i < obj.length; i++) {
              name += summarize(obj[i]);
              if(i !== obj.length -1) {
                name += ', ';
              } 
            }
            name += ']';
          } else {
            name += summarize(obj);
          }
        }

        return dbg(name);
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