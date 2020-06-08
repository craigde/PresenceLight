'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Bring in environment secrets through dotenv
require('dotenv/config')

//Array to keep track of user status returns by email
var UserTable = [];

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


app.get('/status', (req, res) => {

    //This acts as an API to supply presence information
    // expected url - "site/status?user=email" where site = uri or web site and email = valid email address of a user of the Zoom Presence app
    // return - { "Email":"$Email", "Status":"$CurrentZoomPresence" } where $email = provided email and $CurrentZoomPresence = Latest status received from Zoom WebHook or Unknown if we have no status from Zoom

    //display query string for debug if running interactively
    console.log(`Received query: ${req}`);

    if (req.query.user) {
        //if user= is supplied search user table for value which is expected to be a valid email address 
        var tmpReturn = search(req.query.user, UserTable);
        if (tmpReturn == -1) {
            //we don't know this person
            res.send("{\"Email\":\"" + req.query.user + "\",\"Status\":\"Unknown\"}");
        }
        else {
            //we do know this person send them current status
            res.send(UserTable[tmpReturn]);
        }
    }
})

app.post("/hook", (req, res) => {
    //This listens for the WebHook event from Zoom. This is sent each time a the presence of a user of the ZoomPresence event changes
    

    var notfound = false
    var email = "";
    var status = "";
    var tmpResult = -1

    console.log("Received event from Zoom\n" + req.body) 
    
    //make sure POST contains email
    if (req.body.payload.object.hasOwnProperty('email')) {
        email = req.body.payload.object.email;
        //console.log(email);
    }
    else {
        notfound = true;
        console.log("ERR finding email");
    }

    //make sure POST contains Presence
    if (req.body.payload.object.hasOwnProperty('presence_status')) {
        status = req.body.payload.object.presence_status;
        //console.log(status);

    }
    else {
        console.log("ERR finding presence_status");
        notfound = true;
    }

    if (notfound) { }
    else {
        //see if we already have a record for this user
        tmpResult = search(email, UserTable);
        var temp = new OnAirUser(email, status);

        if (tmpResult == -1) {
            //no user - add them to user look up table
            UserTable.push(temp);
        }
            else
        {
            //user already exists in look up table - update current status
            UserTable[tmpResult] = temp;
        }
    }

    res.status(200).end() // Send ack to Zoom
})

function OnAirUser(email, status) {

    //Object for user
    this.Email = email;
    this.Status = status;

       this.changeStatus = changeStatus;
       function changeStatus(otherStatus) {
           this.Status = otherStatus;
       }
}  

function search(nameKey, myArray) {
    //search user look up table for a specific Email address and provide index key back if found. If not found return -1
    for (var i = 0; i < myArray.length; i++)
    {
        if (myArray[i].Email === nameKey) {
            return i;
        }
    }
    //loop finished - did not find it
    return -1
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 4000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
    console.log('ZoomHook listening on port ' + server.address().port)
});



