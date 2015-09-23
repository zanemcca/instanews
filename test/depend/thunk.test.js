
/*jshint expr: true*/

var chai = require('chai');
var thunk = require('./thunk');

var expect = chai.expect;

describe('thunkify' , function () {
  var input, output, hello, error;
  beforeEach( function () {
    input = 'hello';
    output = 'goodbye';
    function Hello(arg, cb) {
      expect(arg).to.equal(input);
      setTimeout(function () {
        cb(error, output);
      }, 10);
    }

    hello = thunk.thunkify(Hello);
  });

  it('should pass in the arguments and return the callback arguments', function (done) {
    hello(input)(function (err, arg) {
      expect(err).not.to.exist;
      expect(arg).to.equal(output);
      done();
    });
  });

  it('should work with an async function that calls another async function', function (done) {
    function Hello2(arg, cb) {
      setTimeout(function () {
        cb(error, output);
      }, 10);
    }

    function Hello(arg, cb) {
      Hello2(arg, cb);
    }
    
    hello = thunk.thunkify(Hello);

    hello(input)(function (err, arg) {
      expect(err).not.to.exist;
      expect(arg).to.equal(output);
      done();
    });
  });

  describe('execute', function () {
    var genFn;
    beforeEach(function () {
      genFn = function*() {
        try {
          var res = yield hello(input);
          expect(res).to.equal(output);
        } catch(e) {
          return e;
        }
      };
    });

    it('should execute the generator function', function (done) {
      thunk.execute(genFn, function (err, res) {
        expect(err).to.not.exist;
        expect(Array.isArray(res)).to.be.true;
        expect(res.length).to.equal(1);
        expect(res[0]).to.equal(output);
        done();
      });
    }); 

    it('should return a list of responses from the generator function return values', function (done) {
      genFn = function*() {
        for(var i=0;i<10;i++) {
          output = i;
          try {
            var res = yield hello(input);
            expect(res).to.equal(output);
          } catch(e) {
            return e;
          }
        }
      };

      thunk.execute(genFn, function (err, res) {
        expect(err).to.not.exist;
        expect(res.length).to.equal(10);
        for(i=0;i<10;i++) {
          expect(res[i]).to.equal(i);
        }
        done();
      });
    });

    it('should work with an async function that calls another async function', function (done) {
      function Hello2(arg, cb) {
        setTimeout(function () {
          cb(error, output);
        }, 10);
      }

      function Hello(arg, cb) {
        Hello2(arg, cb);
      }
      
      hello = thunk.thunkify(Hello);

      thunk.execute(genFn, function (err, res) {
        expect(err).to.not.exist;
        expect(res.length).to.equal(1);
        expect(res[0]).to.equal(output);
        done();
      });
    });
  });

  describe('run', function () {
    var nodeFn, args;
    beforeEach( function () {
      nodeFn = function (arg, cb) {
        cb(error, arg);
      };

      args = ['a','b','c','d','e'];
    });

    it('should run the the nodeFn args.length times and return the cb args of nodeFn', function (done) {
      thunk.run(nodeFn, args, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.deep.equal(args);
        done();
      });
    });

    it('should accept multiple arguments per call', function (done) {
      nodeFn = function (arg1, arg2, cb) {
        cb(error, [arg1, arg2]);
      };

      args =[
        [ 'a', 'a1'],
        [ 'b', 'b1']
      ];

      thunk.run(nodeFn, args, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.deep.equal(args);
        done();
      });
    });

    it('should work with an async function that calls another async function', function (done) {
      function Hello2(arg, cb) {
        setTimeout(function () {
          cb(error, output);
        }, 10);
      }

      function Hello(arg, cb) {
        Hello2(arg, cb);
      }
      
      thunk.run(Hello, input, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.eql([output]);
        done();
      });
    });
  });
});
