// Node knockout 
require('nko')('4mmjIcGPANGpqTsG');
// Team Nodule

/**
 * Module dependencies.
 */





var express = require('express');
var mongoose = require('mongoose');


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

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


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
