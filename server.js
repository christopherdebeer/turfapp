// Node knockout 
require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */


var express   = require('express'),
    mongoose  = require('mongoose'),
    everyauth = require ('everyauth'),
    connect   = require('connect')
    util      = require('util');

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
  , members     : [Person]
});

var Person = new Schema({
    id          : { type: String, unique: true }
  , faction     : String
  , twitter     : {
    , id          : String
    , name        : String
    , avatarUrl   : String
  }  
  , xp          : Number
  , faction     : String
  , created     : { type: Date, default: Date.now}
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

var Tag = mongoose.model('Tag', Point);
var User = mongoose.model('User', Person);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Everyauth /// ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ryauth.debug = true;
var usersById = {};
User.find({},function(err,docs){if(!err){usersById = docs;}})
console.log("usersById: ", util.inspect(usersById));


var nextUserId = usersById.length();

everyauth.everymodule
  .findUserById( function (userId, callback) {
    // tryign to find a fucking user
    console.log("Everyauth findUser by id... : ", util.inspect(userId))
    User.find({id: userId}, callback);
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
    var newUser = new User();
    newUser.id = nextUserId;
    newUser.twitter.id = sourceUser.id;
    newUser.twitter.name = sourceUser.name;
    newUser.twitter.avatarUrl = sourceUser.profile_image_url;

    newUser.save(function(err){
      if (err) {console.log("didnt add user due to error, most likely it existed");}
      else {
        usersById.push(newUser)
      });
  }
  return user;
}

everyauth.twitter 
  .consumerKey('AXZutButmsl4Q40cLTcJmg')
  .consumerSecret('S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik')
  .callbackPath('/auth/twitter/callback')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitUser) {
    console.log(util.inspect(usersById));
    return usersById[twitUser.id] || (usersById[twitUser.id] = addUser('twitter', twitUser));
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






///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// Routes //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Homepage //  main app
app.get('/', function(req, res){

  options = {
    title: "Turf",
    tags: {}
  }

  Tag.find({}, function (err, docs) {

    if (!err) {
      options.tags = JSON.stringify(docs);
    }
    //console.log("Template options: ", options);
    res.render('index', options);
    
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
