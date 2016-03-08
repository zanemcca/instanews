function Timer(message) {
  var start = Date.now();
  var time = start;

  console.log(message);

  var report = function(val, msg) {
    if(!msg) {
      if(val && typeof(val) === 'string') {
        msg = val;
        val = time;
      } else {
        msg = message;
      }
    }
    val = val || time;

    if(msg) {
      console.log(val + ': ' + msg);
    } else {
      console.log(val);
    }
  };

  return {
    lap: function (msg) {
      var temp = Date.now();
      var lap = temp - time;
      time = temp;
      report(lap, msg);
      return lap;
    },
    elapsed: function (msg) {
      var total = Date.now() - start;
      msg = msg ||  'elapsed: ' + message;
      report(total, msg); 
      return total;
    }
  };
}

module.exports = Timer;
