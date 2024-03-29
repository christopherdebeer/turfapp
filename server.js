// Node knockout 
// require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */


var express   = require('express'),
    mongoose  = require('mongoose'),
    everyauth = require ('everyauth'),
    //connect   = require('connect'),
    util      = require('util');
    //TwBot     = require('twbot').TwBot;



//twitter bot -turfappbot

// var bot = new TwBot({
// "consumerKey":"AXZutButmsl4Q40cLTcJmg",
// "consumerSecret":"S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik",
// "accessKey":"352298455-QYFJa3jmZ1Pnexk5koZyoQqZzGfEYVSXJC0sWHwL",
// "accessSecret":"sQH3cLz6zgSrFbfxpxTzniCFMEBXEh78VQzI700"});

var sys = require('sys')
  , tweasy = require("tweasy")
  , OAuth = require("oauth").OAuth;

var oauthConsumer = new OAuth(
    "http://twitter.com/oauth/request_token",
    "http://twitter.com/oauth/access_token", 
    "AXZutButmsl4Q40cLTcJmg",  "S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik", 
    "1.0", null, "HMAC-SHA1");
var twitterClient = tweasy.init(oauthConsumer, {
  access_token : "352298455-hb5nspG2pFqCD7OQO8fLRgdcQSMB1U97PbPhkEg6",
  access_token_secret : "1Gu3M0MXdjRPpDvdVHFb3Yuu5ACu6J8vvyYyuV8I"
});


twitterClient.updateStatus("@TurfApp , this is @TurfappBot checking in.", 
  function(er, resp){
    if (!er) {
      sys.puts("Tweeted checking in, with @TurfApp");
    } else {
      console.log("TwitBot error:", er);
    }
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
  , members     : [Person]
});

var Person = new Schema({
    id          : { type: String, unique: true }
  , faction     : String
  , twitter     : {
      id          : String
    , name        : String
    , avatarUrl   : String
    , screenName  : String
  }  
  , xp          : { type: Number, default: 0}
  , created     : { type: Date, default: Date.now}
  , tags        : [Point]
});

var Point = new Schema({
    userId    : String
  , user      : String
  , faction   : { type: String, default: ""}
  , loc       : [{type: Number},{type: Number}]
  , created   : { type: Date, default: Date.now}
});


Point.methods.findPointsNear = function findPointsNear (cb) {
  return this.find({tags : {userId: this.id}}, cb);
}

Person.methods.getPoints = function getPoints(cb) {
  return this.find
}

var Tag = mongoose.model('Tag', Point);
var User = mongoose.model('User', Person);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Everyauth /// ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

everyauth.debug = true;
var usersById = [];


everyauth.everymodule
  .findUserById( function (userId, callback) {
    // tryign to find a fucking user
    // console.log("Everyauth findUser by id... : ", util.inspect(userId));
    // console.log("Everyauth findUser callback... : ",callback, util.inspect(callback))
    // User.find({id: userId}, function(err, user){
    //   if (err) console.log("error",err);
    //   if (user) console.log("user", user);
    // });
    User.findOne({id: userId}, callback);
});

function addUser (source, sourceUser) {

  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based

    console.log("adding user - ", sourceUser)
    user  = {id: sourceUser.id};
    user[source] = sourceUser;
    var newUser = new User();
    newUser.id = sourceUser.id;
    newUser.twitter.id = sourceUser.id;
    newUser.twitter.name = sourceUser.name;
    newUser.twitter.screenName = sourceUser.screen_name;
    newUser.twitter.avatarUrl = sourceUser.profile_image_url;

    newUser.save(function(err){
      if (err) {console.log("didnt add user due to error, most likely it existed");}
      else {
        usersById.push(newUser); 
      }
    });
  }
  return user;
}

everyauth.twitter 
  .consumerKey('AXZutButmsl4Q40cLTcJmg')
  .consumerSecret('S3U0mPVPID8sYem46pa7VtkIMOwat5akNJn62gGik')
  .callbackPath('/auth/twitter/callback')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitUser) {
    return usersById[twitUser.id] || (usersById[twitUser.id] = addUser('twitter', twitUser));
  })
  .redirectPath('/');

everyauth.everymodule.logoutPath('/bye');





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
    tags: "undefined"
  }

  if (req.user) {

    console.log("User viewing: ", req.user.twitter.screenName);

    options.user = req.user;
    options.userObj = JSON.stringify(req.user);


    Tag.find({}, function (err, docs) {

      if (!err) {
        options.tags = JSON.stringify(docs);
      } else {
        throw err;
      }
      res.render('index', options);
      
    });


  } else {

    console.log("Non-User Viewing.");
    options.user = undefined;
    options.userObj = "undefined";
    Tag.find({}, function (err, docs) {

      if (!err) {
        options.tags = JSON.stringify(docs);
      } else {
        throw err;
      }
      res.render('index', options);
      
    });
  }


  
    
 
});

// contact page
app.get('/contact', function(req, res){
  res.render('contact', {title: "Turf Contact"});
});

// about page
app.get('/about', function(req, res){
  res.render('about', {title: "About Turf"});
});
// users

app.get('/users', function(req, res){
  User.find({}, function(err,allUsers) {
    
    if (err) {
      console.log("error on /users page", err);
      res.render('users', {
        title: "No users? :(",
        users: allUsers
      });
    }
    else {
      res.render('users', {
        title: "Turf :: Users",
        users: allUsers
      });
    }


  });
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
  if (tagAttempt.userId && tagAttempt.loc && tagAttempt.secret) {
    

    var newTag      = new Tag();
    newTag.user     = tagAttempt.userId;
    newTag.loc      = tagAttempt.loc;
    
    // need to add faction checker

    // check for tags near & remove them is so (but not mine)
    removeTagsNear(newTag);

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

// FUNCTIONS

function removeTagsNear(newTag) {
  Tag.find({loc: {$near : newTag.loc, $maxDistance: 0.002}}, (function(newTag,err, tags) {
      
    if (err) {console.log("there was an error looking for neaby tags.", err);}
    else {
      console.log("there were tags near that tagAttempt, removing them", tags);


      //var newTag2 = newTag;



      // find newTag user

      User.findOne({id: newTag.user}, (function(tags, err, userA) {
        if (err) {console.log("User not found: ", newTag.user)}
        else {
          console.log("User @", userA.twitter.screenName, " is on the offensive, removing surrounding tags.");
          if (tags.length > 0) {
            // For each tag
          tags.map((function(userA, tag){
            // if not belonging to same user
            if (userA.id != tag.id) {
              console.log("Removing tag ",tag.id, " belonging to ", tag.user);
              Tag.remove({_id: tag._id}, (function(userA, err){
                // if error
                if (err) {console.log("Error removing tag: ", tag, " with error: ", err)}
                else {
                  User.findOne({id: tag.user}, (function(userA, err, userB){
                    if (err) {console.log("Error finding user, ", err)}
                    else {

                      // Tweet the results
                      var action = "@"+ userA.twitter.screenName + " just claimed some of @" + userB.twitter.screenName + " 's turf as their own.";
                      twitterClient.updateStatus(action, function(er, resp){
                        if (!er) {
                          console.log("Tweeted: ", action );
                        } else {
                          console.log("TwitBot error:", er);
                        }
                      });
                    }
                  }).bind(null,userA))
                }
              }).bind(null,userA))
            }

          }).bind(null, userA));
          } else {
            console.log("No surrounding tags.");
          }
        }

      }).bind(null,tags));





      // tags.map(function(tag){

      //   // only remove tags belonging to other people
      //     if (newTag2.user != tag.user) {


      //       Tag.remove({_id: tag._id}, (function (newTag2, err) {              
      //         if (err) {console.log("Error removing tag: ", tag)}
      //         else {

      //           var dUser = tag.user;
      //           var oUser = newTag2.user; 
                
      //           console.log("TAG USERS: D: ", dUser," O: ", oUser);
                             


      //           User.find({id: oUser}, (function(oUser, err, userA){
                  
      //             console.log("USER A: ", userA);
      //             User.find({id: dUser}, (function(userA, err, userB){

      //               console.log("USER B: ", userB);
      //               var action = "@"+ userA.twitter.screenName + " just claimed some of @" + userB.twitter.screenName + " 's turf as their own.";

      //               twitterClient.updateStatus(action, function(er, resp){
      //                 if (!er) {
      //                   console.log("Tweeted: ", action );
      //                 } else {
      //                   console.log("TwitBot error:", er);
      //                 }
      //               });

      //             }).bind(null, userA));
      //           }).bind(null, oUser));
      //         }
      //       }).bind(null, newTag2));
      //     }
      // });

    }

  }).bind(null, newTag));
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// GOGOGO //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
