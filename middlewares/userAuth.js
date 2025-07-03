const jwt = require('jsonwebtoken');

function UserAuthentication (req,res,next){
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.json({error:"Token does'nt exists"})
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err || decoded.role!=='user'){
            return res.json({message:"Unthorized Token",detail:err})
        }
        req.user = decoded;
        next();
        
    })

}
module.exports = UserAuthentication;