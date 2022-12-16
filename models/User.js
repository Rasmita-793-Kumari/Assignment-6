const mongoose = require('mongoose');
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true,
        default:0
    }
},{timestamps:true});

module.exports=mongoose.model("user",userSchema);