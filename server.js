// Node knockout 
require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */


var express = require('express'),
    mongoose = require('mongoose'),
    everyauth = require ('everyauth'),
    connect = require('connect');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Everyauth /// ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

everyauth.debug = true;
var usersById = {};
var usersByTwitId = {};
var nextUserId = 0;

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
});

function addUser (source, sourceUser) {

  console.log("adding user source: ", source, "sourceUser: ", sourceUser);
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersByTwitId[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

everyauth.twitter
  .consumerKey('AXZutButmsl4Q40cLTcJmg')
  .consumerSecret('S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
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


mongoose.connect('mongodb://user:changeme@staff.mongohq.com:10079/turf', function(err) {
    if (err) throw err;
});

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


var Faction = new Schema({
    name        : String
  , sponsor     : {
        name      : String
      , url       : String 
    }
  , members     : [User]
});

var User = new Schema({
    name        : { type: String, unique: true }
  , xp          : Number
  , faction     : String
  , created     : Date
  , tags        : [Point]
});

var Point = new Schema({
    user      : String
  , faction   : { type: String, default: ""}
  , loc       : [{type: Number},{type: Number}]
  , created   : { type: Date, default: Date.now}
});


Point.methods.findPointsNear = function findPointsNear (cb) {
  return this.find({}, cb);
}

var Tag = mongoose.model('testNew', Point);

var userTag = new Tag();
userTag.user = "new mongoose tests";
userTag.save(function(err){if (err) throw err;})




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// Routes //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Homepage //  main app
app.get('/', function(req, res){


  Tag.find({loc: {$near: [55,-3]}}, {limit: 10}, function (err, docs) {

    if (err) {
      res.render('index', {
        title: 'Turf',
        tags: "couldnt find any"
      });
    } else {
      res.render('index', {
        title: 'Turf',
        tags: JSON.stringify(docs)
      });
    }
    
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
app.post('/tag', function(req, res) {
  
  var tagAttempt = req.body;
  if (tagAttempt.username && tagAttempt.loc && tagAttempt.secret) {
    

    var newTag = new Tag();
    newTag.user = tagAttempt.username;
    newTag.loc      = tagAttempt.loc;
    
    // need to add faction checker

    newTag.save(function(err){
      if (err) {
        res.send({ result : {
          msg: "Error saving tag",
          req: tagAttempt,
          error: err
        }});
      } else {
        res.send({result: "ok"});
      }
    });


  } else {
    res.send({ result : {
      msg: "Not good tag",
      req: tagAttempt
    }});
    console.log("Failed tagAttempt", tagAttempt );
  }
  
});

// get now() // an authentication path
app.get('/now', function(req, res){
  res.send("1233422");
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// GOGOGO //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
