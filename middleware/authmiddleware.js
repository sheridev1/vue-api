const jwt = require('jsonwebtoken');
require("dotenv").config()



const authmiddleware=async(req,res,next)=>{

    const token=req.header('Authorization');


    if(!token){
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const parseToken=token.split(' ')[1];
        
        const decoded = jwt.verify(parseToken, process.env.JWT_TOKEN );
        req.user = decoded.userId;
        next();
    } catch (err) {
       
        res.status(401).json({ msg: 'Token is not valid' });
    }


}



module.exports=authmiddleware