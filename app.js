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

var IMG_UPLOAD_DIR = __dirname + '/public/images/uploaded/original';
var IMG_UPLOAD_SMALL_DIR = __dirname + '/public/images/uploaded/small';
var IMG_UPLOAD_MEDIUM_DIR = __dirname + '/public/images/uploaded/medium';
var IMG_UPLOAD_LARGE_DIR = __dirname + '/public/images/uploaded/large';
/************************** Configuration *****************************/
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', { layout: false });
  app.use(express.bodyParser({ uploadDir: IMG_UPLOAD_DIR,keepExtensions: true}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  //app.use('/uploaded',express.static(__dirname + '../static/images'));
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

function getImgUrlSmall(imageName){
  return '/images/uploaded/small/'+imageName;
}

function getImgUrlMed(imageName){
  return '/images/uploaded/medium/'+imageName;
}

function getImgUrlOrig(imageName){
  return '/images/uploaded/original/'+imageName;
}

function resizeImage(src, dest, imageWidth, imageHeight, callback){
  im.resize({
    srcPath: src,
    dstPath: dest,
    width:   imageWidth
  }, function(err, stdout, stderr){
    if (err) throw err
    if (typeof callback === 'function')
      callback();
    console.log('resized');
  });
}

app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});

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
    if (err) {
      console.log('Error could not find '+ req.params.uid);
      return;
    }
    else {
      if (doc == null){
        console.log("could not find "+ req.params.uid);
        res.statusCode = 400;
        res.send("error");
        return;
      }
      // retrieve and show doc
      req.session.loggedin = true;
      //console.log(doc);
      req.session.uid = doc._id;
      req.session.name = doc.name;
      res.redirect('/user/'+doc.name);
    }
  });
});

app.get('/logout', function(req, res){
  req.session.destroy();
  res.send("logged out");
});

app.get('/photos/:name?', function(req, res){
  // for now returns 10 relavant photos to populate sidebar
  User.findOne({name: req.params.name}, function (err, doc){
    if (err || doc == null){
      console.log("err: "+ err);
      res.statusCode = 400;
      res.send("error could not find user");
      return;
    }
    //console.log(doc.photos.slice(-10));
    res.send({imgs: doc.photos.slice(-10) });
  });
});

// uploads photos
app.post('/photos', function(req, res){
  console.log('reached photos');
  console.log(req.session);
  if (!req.session.loggedin){
    res.statusCode = 400;
    res.send("Must be logged in");
    return;
  }
  // find current user
  console.log('finding user');
  User.findById( req.session.uid, function (err, foundUser) {
    if (err){
      console.log("FATAL ERROR: could not find user "+req.session.uid);
      res.statusCode = 400;
      res.send("error");
      return;
    }
    console.log('trying to upload photos');
    console.log(req.files);
    
    for (photo in req.files){
     console.log('photo');
      //console.log(req.files[photo]);
      var path = req.files[photo].path;
      var name = getImageName(path);
      resizeImage(path, IMG_UPLOAD_SMALL_DIR+name, '100', '100', function(){
        res.send({img_url:getImgUrlSmall(name)});
      });
      resizeImage(path, IMG_UPLOAD_MEDIUM_DIR+name, '200', '200');
      // push file name
      foundUser.photos.push({image:name});
      foundUser.save(function(err){
        if (err){ 
          console.log("could not update user");
          console.log(err);
        }
      }); 
    }
  });
});

// create new user
app.post('/user/new', function(req, res){
  var user = new app.User(); 
  var userInfo = req.body.user;
  user.name = userInfo.name;
  user.email = userInfo.email;
  user.pw = userInfo.pw;
  user.save(function (err) {
    if (err){
      console.log(err);
      res.statusCode = 400;
      res.send("error could not create user");
      return;
    }
    console.log('Success!');
    res.send("Successfully created user");
  });
});

// MAIN PAGES
app.get('/user/:name?', function(req, res){
  // try and find user
  User.findOne({ name: req.params.name}, function (err, doc){
    if (err || doc == null){
      console.log("err: "+ err);
      res.statusCode = 400;
      res.send("error could not find user");
      return;
    }
    //console.log(doc);
    res.render('user', { title: 'User page', viewing: req.params.uid });
  });
});

/************************** Start ************************************/
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
