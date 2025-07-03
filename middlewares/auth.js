const jwt = require('jsonwebtoken');

function authenticateAdmin(req,res,next){
    let token = req.headers.authorization?.split(" ")[1];
    if(!token){
       return  res.json({error:"Token doesnt exist"});
    }

    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err || decoded.role !=='admin'){
          return  res.json({error:"Some error occured",detail:err})
        }
        req.admin = decoded;
        next();

    })
}

module.exports = authenticateAdmin;