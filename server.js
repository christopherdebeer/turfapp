// Node knockout 
require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */


var express = require('express')
    ,mongoose = require('mongoose')
    ,everyauth = require('everyauth')
    ,Schema = mongoose.Schema;
    //,mongooseAuth = require('mongoose-auth')



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Config ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Configuration
var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'turfappsecret'}));
  app.use(everyauth.middleware());
  //app.use(mongooseAuth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


everyauth.helpExpress(app);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// every auth setup


everyauth.twitter
  .consumerKey('AXZutButmsl4Q40cLTcJmg')
  .consumerSecret('S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    // find or create user logic goes here
  })
  .redirectPath('/');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// DB Mongo stuff ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var UserSchema = new Schema({})
//       , User;

// // STEP 1: Schema Decoration and Configuration for the Routing
// UserSchema.plugin(mongooseAuth, {
//     // Here, we attach your User model to every module
//     everymodule: {
//       everyauth: {
//           User: function () {
//             return User;
//           }
//       }
//     }

//   , twitter: {
//       everyauth: {
//           myHostname: 'http://turf.no.de'
//         , appId: 'AXZutButmsl4Q40cLTcJmg'
//         , appSecret: 'S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik'
//         , redirectPath: '/'
//       }
//     }
// });

// mongoose.model('User', UserSchema);

// mongoose.connect('mongodb://user:changeme@staff.mongohq.com:10079/turf');

// User = mongoose.model('User');




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// Routes //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Homepage //  main app
app.get('/', function(req, res){
    res.render('index', {
      title: 'Turf'
    });
});


// contact page
app.get('/contact', function(req, res){
  res.render('contact', {});
});


// users

app.get('/users', function(req, res){
  res.render('users', {});
});


app.get('/user/:id', function(req, res){
    res.render('user', {
    id: req.params.id
  });
});


// factions

app.get('/factions', function(req, res){
  res.render('factions', {
    title: 'Express'
  });
});


app.get('/faction/:id', function(req, res){
    res.render('faction', {
    id: req.params.id
  });
});

//  utility paths

// post tags
app.post('/tag', function(req, res){
  res.send(req.body);
});

// get now() // an authentication path
app.get('/now', function(req, res){
  res.send("1233422");
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// GOGOGO //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.listen(80);
console.log("Turfapp server listening on port %d in %s mode", app.address().port, app.settings.env);
