// Node knockout 
require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */


var express = require('express')
    ,mongoose = require('mongoose')
    ,everyauth = require ('everyauth');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Everyauth ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


var usersById = {};
var usersByTwitterId = {};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
});

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

everyauth.twitter
  .consumerKey('AXZutButmsl4Q40cLTcJmg')
  .consumerSecret('S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    // find or create user logic goes here
  })
  .redirectPath('/');


// Configuration
var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'turfappsecret'}));
  app.use(everyauth.middleware());
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// DB Mongo stuff ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// mongoose.connect('mongodb://user:changeme@staff.mongohq.com:10079/turf', function(err) {
//     if (err) throw err;
// });

// var Schema = mongoose.Schema
//   , ObjectId = Schema.ObjectId;

// var Point = new Schema({
//     user      : String
//   , faction   : String
//   , lat       : Number
//   , lon       : Number
//   , created   : Date
// });

// var Tag = mongoose.model('test', Point);

// var userTag = new Tag();
// userTag.user = "christopherdbNew";
// userTag.save(function(err){if (err) throw err;})




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
