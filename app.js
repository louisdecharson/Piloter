var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");
var session = require('express-session');
var ObjectID = mongodb.ObjectID;

// DOTENV
require('dotenv').config({path:path.join(__dirname,'/.env')});

var app = express();

const myUser = process.env.USER_PILOTER;
const myPass = process.env.PASSW_PILOTER;

// CONFIG
// ======
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public',express.static(path.join(__dirname, 'public')));

// use session
app.use(session({secret:'blog-pilotermacarriere', cookie:{}}));

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
// =============

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
// MONGODB_URI = mongodb://localhost:27017/Piloter
const url = process.env.MONGODB_URI;
mongodb.MongoClient.connect(url, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// HELPER

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

function authenticate(name,pass,callback) {
    if (name != myUser) {
        return callback(new Error('cannot find user'));
    } else  {
        if (pass != myPass) {
            return callback(new Error('invalid password'));
        } else {
            return callback(null,name);
        }
    }
}
function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error =' Access denied !';
        res.redirect('/login');
    }
}

    

// ROUTES BELOW
// ============ //

// ======================= //
app.get('/apropos',function(req,res){res.render('apropos');});
app.get('/livres',function(req,res){res.render('mes_livres');});


// POSTS 
app.get('/posts', function(req,res) {
    db.collection('posts').find({},{'date':1, 'title':1, 'abstract':1, 'time':1, 'slug': 1}).toArray(function(err,docs) {
        if(err) {
            handleError(res, err.message,"Failed to get Posts");
        } else {
            res.render('posts',{posts:docs});
        }
    });
});
app.get('/posts/:slug',function(req,res) {
    var slug = req.params.slug;
    db.collection('posts').findOne({'slug': slug},{'date':1, 'title':1, 'abstract':1, 'time':1, 'content': 1}, function(err,doc) {
        if (err) {
            handleError(res,err.message,"Failed to get post");
        } else {
            res.render('post',{post:doc});
        }
    }); 
});




// ADMIN
// =====

// LOGIN
app.get('/login',function(req,res) {res.render("login");});
app.post('/login',function(req,res) {
    authenticate(req.body.username, req.body.password, function(err,user) {
        if (user) {
            req.session.regenerate(function() {
                req.session.user = user;
                req.session.success = "Authenticated as " + user;
                res.redirect('/admin');
            });
        } else {
            req.session.error = 'Authentication failed';
            console.log('error');
            res.redirect('/login');
        }       
    });
});

// VIEW POSTS
app.get('/admin',requiredAuthentication, function(req,res) {
        db.collection('posts').find({},{'date':1, 'title':1, 'abstract':1, 'createDate':1, 'slug': 1}).toArray(function(err,docs) {
            if(err) {
                handleError(res, err.message,"Failed to get Posts");
            } else {
                res.render('admin',{posts:docs});
            }
        });
});

// VIEW ONE POST
app.get('/admin/posts/:slug', requiredAuthentication, function(req,res) {
    var slug = req.params.slug;
    db.collection('posts').findOne({'slug': slug},{'date':1, 'title':1, 'abstract':1, 'createDate':1, 'content': 1, 'slug':1}, function(err,doc) {
        if (err) {
            handleError(res,err.message,"Failed to get post");
        } else {
            res.render('admin_view_post',{post:doc});
        }
    }); 
});

// UPDATE ONE POST
app.post('/admin/posts/:slug',requiredAuthentication, function(req,res) {
    var slug = req.params.slug;
    var updateDoc = req.body;
    updateDoc.lastEditDate = new Date();
    db.collection('posts').updateOne({'slug': slug}, updateDoc, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            res.redirect('/admin');
        }
    });
});

// CREATE ONE POST
app.get('/admin/new_post',requiredAuthentication,function(req,res){res.render('new_post');});

// NEW POST
app.post('/admin/new_post',requiredAuthentication,function(req,res){

    var newPost = req.body;
    newPost.createDate = new Date();
    newPost.lastEditDate = newPost.createDate;

    if (!req.body.slug) {
        handleError(res,'Invalid input','Must provide a slug', 400);
    }
    db.collection('posts').insertOne(newPost, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            res.redirect('/admin');
        }
    });
    
});

// =====================

app.get('/', function(req,res){
    db.collection('posts').find({},{'date':1, 'title':1, 'abstract':1, 'time':1, 'slug': 1}).sort({$natural:-1}).limit(5).toArray(function(err,docs) {
        if(err) {
            handleError(res, err.message,"Failed to get Posts");
        } else {
            res.render('index',{posts:docs});
        }
    });
});
