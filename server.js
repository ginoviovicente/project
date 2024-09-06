if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Required modules
const mongoose = require('mongoose');
const path = require('path');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const Post = require('./models/Post'); // Import the Post model
const User = require('./models/User'); // Import the User model

// Passport configuration
const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => User.findOne({ email }), // Find user by email
  id => User.findById(id) // Find user by ID
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Route handlers
app.get('/', checkAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find(); // Fetch all posts
    res.render('index', { name: req.user.name, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.redirect('/login');
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/register'); // Redirect to register if email is taken
    }

    // Validate password length
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.redirect('/register'); // Redirect to register if password is too short
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    // Log the registration
    console.log(`New user registered: ${user.name} (${user.email})`);

    // Redirect to login
    res.redirect('/login');
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error code
      req.flash('error', 'Email is already registered.');
    } else {
      console.error('Registration error:', error);
      req.flash('error', 'An unexpected error occurred. Please try again.');
    }
    res.redirect('/register'); // Redirect to register if there is an error
  }
});

app.delete('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});

// Authentication middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
