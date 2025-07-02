const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const run = require('../db.js')

router.post('/register', async (req,res)=>{
   const {name,email,password}= req.body;

   try{
    const con = await run();
    const hashed = await bcrypt.hash(password,10);
    const [result,field] = await con.execute('insert  into users (name,email,password) values(?,?,?)',[name,email,hashed]);
    console.log(result);
    res.status(202).json({message:"User registered successfully"});


   }
   catch(e){
     res.status(500).json({ error: "Registration failed", detail: e });

   }

})

router.post('/login', async (req,res)=>{
     const {email,password} = req.body;

     try{
        const con = await run();

         const[result] = await con.execute('select * from users where email=(?) ',[email]);
         if(!result.length){
            res.send(401).json({message:"Invalid email"});
    
         }
         user = result[0];
    
         const match = await bcrypt.compare(password,user.password);
         if(!match){
             res.send(401).json({message:"Invalid password"});
         }
         const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(201).json({message:"Login Successful",token});
     }
     catch(e){
        res.status(409).json({error:'error occured',detail:e})

     }



});
module.exports = router

