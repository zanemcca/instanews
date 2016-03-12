function Timer(app, message) {
  var start = Date.now();
  var time = start;

  if(process.env.NODE_ENV !== 'production') {
    console.log(message);
  }

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
      if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        app.dd.timing(message, val);
      } else {
        console.log(val + ': ' + msg);
      }
    } else {
      if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        app.dd.timing('unknown_timer', val);
      } else {
        console.log(val);
      }
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
