/*
 * jinkou
 * 2011
 */

/*** Module dependencies */
var express = require('express'),
  formidable = require('formidable'),
  im = require('imagemagick'),
  app = module.exports = express.createServer(
    //formidable({ keepExtensions: true })
    ),
  mongoose = require('mongoose'),
  models = require('./models'),
  indexRoute = require('./routes/index'),
  //userRoute = require('./routes/user'),
  //url = require('url'),
  db,
  User,
  Photo;

var IMG_UPLOAD_DIR = '../static/images/original';
var IMG_UPLOAD_SMALL_DIR = '../static/images/small';
var IMG_UPLOAD_MEDIUM_DIR = '../static/images/medium';
/************************** Configuration *****************************/
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', { layout: false });
  app.use(express.bodyParser({ uploadDir: IMG_UPLOAD_DIR}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  //app.use('/js',express.static('../js'));
    //app.use('/css',express.static('../css'));
    //app.use('/img',express.static('../img'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.set('db-uri', 'mongodb://localhost/jinkou-dev');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.set('view options', {
    pretty: true
  });

});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  app.set('db-uri', 'mongodb://localhost/jinkou-prod');
});

// db setup
models.defineModels(mongoose, function() {
  //app.Photo = Photo = mongoose.model('Photo');
  app.User = User = mongoose.model('User');
  db = mongoose.connect(app.set('db-uri'));
})

/********************** Helper Functions ******************************/
function getImageName(imagePath){
  // returns new image name
  return imagePath.substring(IMG_UPLOAD_DIR.length);
}

function resizeImage(src, dest, imageWidth, imageHeight){
  im.resize({
    srcPath: src,
    dstPath: dest,
    width:   imageWidth
  }, function(err, stdout, stderr){
    if (err) throw err
    console.log('resized')
  });
}

/************************** Routes ************************************/
// STATIC PAGES
app.get('/', indexRoute.index);

// AJAX
app.post('/login', function(req, res){
  // set session variables
  // check if user and pw matches
  var userInfo = req.body.user;
  // try and find something with the same info
  User.findOne({ email: userInfo.name, pw:userInfo.pw}, function (err, doc){
    if (err) 
      console.log('Error could not find '+ req.params.uid);
    else {
      if (doc != null){
        // retrieve and show doc
        res.send("logged in");
        req.session.loggedin = true;
        console.log(doc);
        req.session.uid = doc._id;
      }
      else{
        console.log("could not find "+ req.params.uid);
        res.statusCode = 400;
        res.send("error");
      }
    }
  });
});

app.get('/logout', function(req, res){
  req.session.destroy();
  res.send("logged out");
});

// uploads photos
app.post('/photos', function(req, res){
  if (req.session.loggedin){
    // find current user
    User.findById( req.session.uid, function (err, foundUser) {
      if (err){
        console.log("FATAL ERROR: could not find user "+req.session.uid);
        res.statusCode = 400;
        res.send("error");
      }
      for (photo in req.files.photos){
        console.log('photo');
        console.log(req.files.photos[photo]);
        var name = getImageName(req.files.photos[photo].path);
        resizeImage(req.files.photos[photo].path, IMG_UPLOAD_SMALL_DIR+name, '100', '100');
        resizeImage(req.files.photos[photo].path, IMG_UPLOAD_MEDIUM_DIR+name, '200', '200');
        // push file name
        foundUser.photos.push({image:name});
        foundUser.save(function(err){
          if (err){ 
            console.log("could not update user");
            console.log(err);
          }
        });
      }
      res.send("image successfully uploaded");
    });
    
  }
  else{
    res.statusCode = 400;
    res.send("Must be logged in");
  }
});

// create new user
app.post('/user/new', function(req, res){
  var user = new app.User(); 
  var userInfo = req.body.user;
  user.name = userInfo.name;
  user.email = userInfo.email;
  user.pw = userInfo.pw;
  user.save(function (err) {
    if (!err){ 
      console.log('Success!');
      res.send("Successfully created user");
    }
    else{
      console.log(err);
      res.statusCode = 400;
      res.send("error could not create user");
    }
  });
});

// MAIN PAGES
app.get('/user/:uid?', function(req, res){
  /*get*/
  // try and find user
  User.findOne({ name: req.params.uid}, function (err, doc){
    if (err) 
      console.log('Error could not find '+ req.params.uid);
    else {
      if (doc != null){
        // retrieve and show doc
        console.log(doc);
      }
      else{
        console.log("could not find "+ req.params.uid);
      }
    }
  });
  //console.log('query'+req.query['stuff']);
  //console.log('date'+req.query['date']);
  // if username is valid, then get user, else create fake user
  res.render('user', { title: 'User page', viewing: req.params.uid });
  /*post*/
});

/************************** Start ************************************/
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
