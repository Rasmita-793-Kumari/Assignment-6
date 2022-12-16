const userSchema = require("../models/User");
const bcrypt=require('bcrypt');// to hash the data
const { activateAccountMail } = require("../services/mailService");
const { json } = require("express");
const SALT_ROUNDS=10;
const PizzaDetail = require("../models/PizzaDetail");
const User = require("../models/User");

const { orderSuccess } = require("../services/mailService");
const mongoose = require('mongoose');
const express = require('express');
const pizzaSchema = require('../models/PizzaDetail');
const router = require('../routes/route');

const getAllPizza = async (req, res) => {
    try {
        if (req.session.username) {
            let data = await pizzaSchema.find({})
            res.render('menu', { data: data.map(data => data.toJSON()) })
        }
        else {
            res.redirect('/');
        }

    } catch (error) {
        console.log(error);
    }
}

const checkOut=(req,res)=>{
    // const amount=req.query.amount;
    const amount=req.session.totalPrice;
    return res.render('checkout',{amount:amount})
}

const orderHandler=async(req,res)=>{
    try {
        let email=req.session.email;
        console.log(email);
        let data = await User.findOne({email:email});
        console.log(data);
        if(data.status==1){
            let amount=req.session.totalPrice;
            orderSuccess(amount,data);
            delete req.session.cart;
            return res.render('order',{succs:'You will recieve notification by email with order details'})
        }
        else{
            return res.render('order',{error:'Please Verify Your Email First'})
        }

    } catch (error) {
        console.log(error);
    }
}

const cartView=(req,res)=>{
    let data=req.session.cart;
    if(!data){
        return res.redirect('/menu')
    }
    let totalSum=0;
    data.forEach(element => {
        let sub=parseFloat(element.quantity * element.price).toFixed(2);
        totalSum += +sub;
        });
        req.session.totalPrice=totalSum;
    return res.render('cartpage',{data: data,total:totalSum})
}


const cartHandler=async(req,res)=>{
    const {id}=req.params;
    const action=req.query.action;
        try {
            let pizza=await PizzaDetail.findById(id);
            
            if(typeof req.session.cart == 'undefined'){
                req.session.cart=[];
                req.session.cart.push({
                    id:pizza._id,
                    name:pizza.name,
                    price:pizza.price,
                    quantity:1,
                    image:pizza.image
                });          
            }
            else{
                let cart=req.session.cart;
                let newItem=true;

                for(let i=0;i<cart.length;i++){
                    if(cart[i].name==pizza.name){
                        cart[i].quantity++;
                        newItem=false;
                        break;
                    }
                }
                if(newItem){
                    cart.push({
                        id:pizza._id,
                        name:pizza.name,
                        price:pizza.price,
                        quantity:1,
                        image:pizza.image
                    }); 
                    if(action=='remove'){
                        for(let i=cart.length;i>0;i--){
                            if(cart[i].name==pizza.name){
                                cart[i].quantity--;
                                console.log(cart[i].quantity);
                                newItem=false;
                                break;
                            }
                    }         

                }
            }           
            }

            let totalSum=0;
            let data=req.session.cart;
            data.forEach(element => {
                let sub=parseFloat(element.quantity * element.price).toFixed(2);
                totalSum += +sub;
            });
            req.session.totalPrice=totalSum;
            console.log(totalSum);
            return res.render('cartpage',{data: data,total:totalSum});            

        
        } 
        catch (error) {
            console.log(error);
        }
    }

    const cartUpdateHandler=(req,res)=>{
        const {name}=req.params;
        const action=req.query.action;
        try {
            console.log(name);
            console.log(action);
            let cart=req.session.cart;
            console.log('cartlength',cart.length);
            for(let i=0;i<cart.length;i++){
                if(cart[i].name===name){
                    switch (action) {
                        case "add":
                            cart[i].quantity++;
                            break;
                        case "remove":
                            cart[i].quantity--;
                            if (cart[i].quantity < 1)
                                cart.splice(i, 1);
                            break;
                        case "clear":
                            cart.splice(i, 1);
                            if (cart.length == 0)
                                delete req.session.cart;
                            break;
                        default:
                            console.log('unable to update');
                            break;
                    }
    
                }
                
            }
            res.redirect('/cart');
            
        } catch (error) {
            console.log(error);
        }
    }


const registerUser=async(req,res)=>{

    try {

        if(req.session.username){
            return res.redirect('/menu')
        }
        else{
            const {name,email,password,mobile,address}=req.body;
            let userData=await userSchema.findOne({email:email});
            if(!userData){
                let hashedPassword=await bcrypt.hash(password,SALT_ROUNDS);
                user=new userSchema({name,email,password:hashedPassword,mobile,address});
                user.save();
                activateAccountMail(user);
                return res.render("signup", { succs: "Activation Email Sended to your mail" });
            }
            else{
                return res.render("signup", { error: "User Already Registered" });
            }

        }
        
    } catch (error) {
        console.log(error);
    }

}

const login=async(req,res)=>{
    const {email,password}=req.body;
    // console.log({email,password});
    if(req.session.username){
        return res.redirect('/menu')
    }
    try {
        let data=await userSchema.findOne({email:email});
        console.log(data);
        if(data){
            if(bcrypt.compareSync(password,data.password)){
                req.session.username=data.name;
                req.session.email=data.email;
                return res.redirect('/menu')
            }
            else{
                return res.render("login", { error: "Incorrect Password" });
            }
        }
        else{
            return res.render("login", { error: "Incorrect Email Id" });
        }
        
    } catch (error) {
        console.log(error);
    }

}

const signupView=(req,res)=>{

    if(req.session.username){
        return res.redirect('/menu')
    }
    return res.render('signup')
}

const loginView=(req,res)=>{

    if(req.session.username){
        return res.redirect('/menu')
    }
    return res.render('login')
}

const activateAccount=async(req,res)=>{
    const {id}=req.params;
    try {
        await userSchema.findOneAndUpdate({_id:id},{$set:{status:1}});
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
}

const logout=(req,res)=>{
    req.session.destroy((err) => {
        res.redirect('/') 
    })
}

const defaultPage=(req,res)=>{
    if(req.session.username){
        return res.redirect('/menu')
    }
    return res.render('index')
}

const profileHandler=async(req,res)=>{
    try {
        if(!req.session.username){
            return res.redirect('/')
        }
        const email=req.session.email;
        console.log(email);
        let data=await userSchema.findOne({email:email});
        if(data){
            console.log(data);
            return res.render('profile',{data:data.toJSON()});
        }

        
    } catch (error) {
       console.log(error); 
    }
}

module.exports={
    defaultPage,
    registerUser,
    activateAccount,
    login,
    signupView,
    loginView,
    logout,
    profileHandler,
    cartHandler,
    cartView,
    cartUpdateHandler,
    checkOut,
    orderHandler,
    getAllPizza
}