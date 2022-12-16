const express=require('express');
// const { cartHandler, cartView, cartUpdateHandler } = require('../controllers/cartController');
// const { checkOut, orderHandler } = require('../controllers/checkoutController');
// const { getAllPizza} = require('../controllers/productDetailsController');
const { signupView, loginView, registerUser, login, logout, defaultPage, activateAccount, cartHandler, cartView, cartUpdateHandler, profileHandler ,getAllPizza, checkOut, orderHandler} = require('../controllers/userController');

const router=express.Router();

// GET ROUTES HERE
router.get('/',defaultPage)
router.get('/signup',signupView);
router.get("/activateaccount/:id",activateAccount);
router.get('/login',loginView);
router.get('/menu',getAllPizza);
router.get('/logout',logout);
router.get('/cart',cartView);
router.get('/cart/:id',cartHandler);
router.get('/updatecart/:name',cartUpdateHandler);
router.get('/checkout',checkOut);
router.get('/profile',profileHandler);

// POST Routes Here
router.post('/signup',registerUser);
router.post('/login',login);
router.post('/cart/:id',cartHandler)
router.post('/chekouthandle',orderHandler)

module.exports=router;