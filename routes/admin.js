const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const run = require('../db.js')

router.post('/register',async (req,res)=>{
    const {username,email,password} = req.body;
    try{
        const con = await run();
        const[result] = await con.execute('select * from admins where username=(?)',[username])
        if(result.length>0){
            res.status(409).json({message:"User already exists"})
        }
        let hashed = await bcrypt.hash(password,10);
        const [ ans] = await con.execute('insert into admins (username,email,password) values(?,?,?)',[username,email,hashed])
        res.status(201).json({ message: "Admin registered successfully" });

    }
    catch(e){
        res.status(500).json({ error: "Admin registration failed", detail: e.message });

    }
});

router.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    try{
        const con = await run();
        const [ result1 ] = await con.execute('select * from admins where username=(?)',[username]);
        if(!result1.length){
            res.json({message:"No Such User found"});
        }
        const admin = result1[0];
        const check = await bcrypt.compare(password,admin.password);
        if(!check){
            res.json({message:"Invalid password"});
        }
        const token = jwt.sign( { id: admin.id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" });

      res.json({message:"Login Successful",token})

    }
    catch(e){
        res.json({message:"Error occured ",detail:e.message})

    }
})
module.exports = router;