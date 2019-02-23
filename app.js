var createError = require('http-errors');
var helmet = require('helmet');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var compression = require('compression');


var indexRouter = require(path.join(__dirname,'routes','index'));
var customRouter = require(path.join(__dirname,'routes','customRoutes'));

var app = express();

app.use(compression({filter: shouldCompress}));
app.use(helmet());

function shouldCompress (req, res) {
    // console.log("compared!");
  if (req.headers['x-no-compression']) {
    // Make some case when you don't need compression i.e via matching up some header and using compression middleware accordingly.
    return false;
  }
  else{
    return compression.filter(req, res);
  }
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/v1/rpc', customRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // serve some diff. 404 page or send this to error handler.
    // next(createError(404));
    res.status(404);
    return res.send();
});
  
  // error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    return res.json({ message: err.message });
});
    
module.exports = app;
