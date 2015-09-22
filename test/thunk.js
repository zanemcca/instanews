// Thunks split the arguments and callback
// of an asynchrounous node function
/*
 * Ex. 
 * function Hello(arg, cb) {
 *  console.log(arg);
 *  cb('goodbye');
 * }
 * 
 * var hello = thunkify(Hello);
 * var helloAsync = hello('hello');
 *
 * helloAsync( function (bye) {
 *  console.log(bye);
 * }
 */
function thunkify(nodefn) {
  //Return a wrapper that accepts any arguments and passes them to the
  //execution call
  return function () {
    // Grab arguments
    var args = Array.prototype.slice.call(arguments);
    return function (cb) {
      //Add the cb to the argument list and call the original nodeFn
      args.push(cb);
      nodefn.apply(this, args);
    };
  };
}

// Execute takes a generator function as an input and it will
// execute all thunkified functions that are yeilded to
function execute(genFn, cb) {
  var res = []; //Place to store the results of each call
  var gen = genFn();  // Initialize the generator

  // Execute the next thunk on the generator
  // and save the 
  var first = true;
  var finished = false;
  var count = 0;
  function next (er, value) {
    count++;

    if(er){
      return cb(er); //Throw any received errors to the generator
    }

    if(first) {
      first = false;
    } else {
      res.push(value);
    }

    var continuable = gen.next(value);  //Trigger the next call of the generator

    if (continuable.done) {
      return cb(null, res); //Quit if the generator is done
    }

    var cbFn = continuable.value; // The value should be a thunk
    cbFn(next); //Execute the thunk with next as its callback
  }

  next(); // Start the generator
}

// Run takes an asynchronous node function and an array of arguments
// that are to be passed into the nodeFn at each iteration.
// It chains these calls together and runs them
function run(nodeFn, args, cb) {
  var thunk = thunkify(nodeFn);

  execute(function* () {
    var length = 1;
    if(Array.isArray(args)) {
      length = args.length;
    }

    for(var i = 0; i < length; i++) {
      try {
        if(Array.isArray(args[i])) {
          options = yield thunk.apply(this, args[i]);
        } else {
          options = yield thunk(args[i]);
        }
      } catch (err) {
        console.log(err.stack);
        return err;
      }
    }
  }, cb);
}

exports.run  = run;
exports.thunkify = thunkify;
exports.execute = execute;
