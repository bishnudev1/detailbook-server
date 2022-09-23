const User = require('../models/users');
const jwt = require('jsonwebtoken');

module.exports = async function Auth (req,res,next){
    try {
        const token = req.cookies.jwt;
        
           if(!token){
                res.status(404).json({
                    message:'User not logged in');
                });
               next();
           }
            else{
                const verifyToken = jwt.verify(token,'Iambishnudevkhutia');
                const user = await User.findOne({_id:verifyToken._id});
                req.token = token;
                req.user = user;
                next();
            }
    } catch (error) {
        console.log(error);
    }
}
