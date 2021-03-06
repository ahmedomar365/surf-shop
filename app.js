require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cors = require("cors");

// const seedPost = require('./seeds');
// seedPost();
// const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://surf:surf@cluster0.hufxf.mongodb.net/surf-shop?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// require routes
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const reviewsRouter = require('./routes/reviews');
const app = express();
app.use(cors());

//connect to the database
// mongoose.connect('mongodb+srv://<username>:<password>@cluster0.hufxf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.connect(uri,  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('we are connected!');
}); 
// client.connect(err => {
//   const collection = client.db("surf-shop").collection("user");
//   // perform actions on the collection object
//   client.close();
// });

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public assets directory
app.use(express.static('public'));

app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));


//configure Passport and Sessions

app.use(session({
  secret: 'hang ten dude!',
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// set local variables middleware
app.use(function(req, res, next) {
  // set default page title
  res.locals.title = 'Surf Shop';
  // req.user = {
  //   '_id': '60838c171e900715648eb580',
  //   'username': 'ian3'
  // }
  res.locals.currentUser = req.user;
  // set success flash message
  res.locals.success = req.session.success || '';
  delete req.session.success;

  // set error flash message
  res.locals.error = req.session.error || '';
  delete req.session.error;
  // continue on to next function in middleware chains
  next();
});

//mountRoutes
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/posts/:id/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  // const err = new Error('Not Found');
  // err.status = 404;
  // next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err);
  req.session.error = err.message;
  res.redirect('back');

});


module.exports = app;
