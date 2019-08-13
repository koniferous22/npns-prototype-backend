const port = process.env.PORT

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var app = express();
// helmmet module for security
var dbConfig = require('./db');
// Connect to DB
mongoose.connect(dbConfig.url, { useNewUrlParser: true, useCreateIndex: true });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


app.use('/', require('./routers/auth'));
app.use('/queue/', require('./routers/queue'));
app.use('/problem/', require('./routers/problem'));
/*var submission = require('./routes/submission');
app.use('/submission/', submission);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


app.listen(port);
