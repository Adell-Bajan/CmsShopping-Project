const express = require('express');
const path = require('path');
const config = require('./config/database');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const fileUpload = require('express-fileupload');

// Conect to DataBase
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind('console', 'connection errpr'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});




// Iniy app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));



//Body parser midllewere
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));



// Connect flash
app.use(flash());



// Express fileUpload middleware
app.use(fileUpload());




// Global Vars 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// Passport middlwere
app.use(passport.initialize());
app.use(passport.session());



// Set Routes
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');



// Middlwere
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/', pages);


// Start the server
const port = 4000;
app.listen(port, function() {
    console.log('Server started on port' + port);
})