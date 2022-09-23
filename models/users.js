const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        required:true,
        type: String
    },
    age: {
        required:true,
        type:String,
    },
    email: {
        required:true,
        type: String,
        unique:true
    },
    password: {
        required:true,
        type: String
    },
    cpassword: {
        required:true,
        type: String
    },
    work: {
        required:true,
        type: String
    },
    intro: {
        required: true,
        type:String
    },
    tokens: [{
        token: {
            type: String,
            required:true
        }
    }]
});

userSchema.methods.generateToken = async function (){
    try {
        const token = jwt.sign({_id:this._id},'Iambishnudevkhutia');
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

userSchema.pre('save',async function(next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = await bcrypt.hash(this.cpassword,10);
    }
    next();
});

const User = new mongoose.model('users',userSchema);

module.exports = User;