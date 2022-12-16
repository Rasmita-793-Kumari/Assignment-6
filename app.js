const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
// const session = require('./middlewares/sessionMiddleware');
const router = require('./routes/route');
require('dotenv').config();//.env to hide the confedential data
const pizzaSchema =  require('./models/PizzaDetail');

// const multer = require("multer");
const PORT = process.env.PORT;
const MONGODB_URI = process.env.DB_URI;//Mongo DB Connection
const app = express();
//static data connection

app.use(express.static('static'));
app.use("/static",express.static("static"));


const sessions=require('express-session');
const oneDay = 1000 * 60 * 60 * 24;
require('dotenv').config();

const session=sessions({
    secret: process.env.SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
});


app.engine('handlebars', exphbs.engine({
    helpers: {
        // Function to do basic mathematical operation in handlebar
        math: function (lvalue, operator, rvalue) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        },
    },
}));//setting up handlebars engine
app.set('view engine', 'handlebars');
app.set('views', './views');//setting up views 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session);

//creat connection
mongoose.connect(MONGODB_URI)
    .then(res => { console.log(`Database connected!`); })
    .catch(err => { console.log(err.message); });

app.use('/', router)

//page not found
app.use("*", (req, res) => {
    res.status(404).render("NotFound")
});

//running server 
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`work on Port :${PORT}`);
});