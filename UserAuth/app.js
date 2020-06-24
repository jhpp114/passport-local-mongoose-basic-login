const express = require('express');
const PORT_NUMBER = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy  = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
let User = require('./models/user');

// connect database
mongoose.connect("mongodb://localhost/auth_practice1", {
    useUnifiedTopology: true
,   useNewUrlParser: true
})
.then(()=> console.log("DB Connected"))
.catch(err => {
    console.log("DB connect Error");
});

const app = express();
// express session
app.use(require('express-session')({
    secret: 'hello world'
,   resave: false
,   saveUninitialized: false 
}));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

// app config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===============
// ROUTES
// ===============
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req, res) {
    res.render('secret');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/register', function(req, res) {
    // they use hash function to create password
    User.register(new User({username: req.body.username}),
    req.body.password, function(error, user) {
        if (error) {
            console.log("Oops Error on reigstering user");
            console.log(error);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
    });
});

app.get('/login', function(req, res) {
    res.render("login");
});

// login check
// middleware idea: code run before final code; it can be stacked up
app.post('/login', passport.authenticate("local",{
    successRedirect: "/secret"
,   failureRedirect: "/login"
}) ,function(req, res){
});

// logout
app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/");
});

// add middleware to prevent user getting into secret route
// without login
// next : execute next
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(PORT_NUMBER, function(req, res) {
    console.log(`User Auth App Running: ${PORT_NUMBER}`);
});
