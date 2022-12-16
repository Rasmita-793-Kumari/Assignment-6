const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();

let transporter=nodemailer.createTransport({
    service:"gmail",
    port:587,
    secure:false,
    auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
    }
});
//Nodemailer Tunneling

transporter.use('compile', hbs(
    {
        viewEngine:"nodemailer-express-handlebars",
        viewPath:"emailViews/emailTemplates/",
        
    }
));//Setting up Email Template 

// Reset Password Mail Handler
const activateAccountMail=(data)=>{

    const {_id,email,name}=data;
    let mailOptions={
        from:process.env.EMAIL,
        to:email,
        subject:"Activate your account",
        template:'activation',
        context:{
            username:name,
            id:_id }
    };

    //Email Sending
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){ console.log(err)}
        else{
            res.redirect("/login")
        }
    });
};

const orderSuccess=(amount,data)=>{

    const {_id,email,name,mobile,address}=data;
    let mailOptions={
        from:process.env.EMAIL,
        to:email,
        subject:"Successfully Order Placed",
        template:'order',
        context:{
            name:name,
            id:_id,
            mobile:mobile,
            address:address,
            amount:amount
        }
    };

    //Email Sending
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){ console.log(err)}
        else{
            res.redirect("/login")
        }
    });
};



module.exports={
    activateAccountMail,
    orderSuccess
};