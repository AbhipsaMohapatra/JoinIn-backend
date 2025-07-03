const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateAdmin = require('../middlewares/auth.js');

const run = require('../db.js');
const e = require('express');

router.post('/create',authenticateAdmin, async(req,res)=>{
    const {title,description,date,time,venue,category} = req.body;
    try{

        const con = await run();
    
        const [result] = await con.execute('insert into events (title,description,date,time,venue,category) values(?,?,?,?,?,?)',[title,description,date,time,venue,category]);
        res.json({message:"Event registraion Succussful",eventId:result.insertId})
    }
    catch (e){
        res.status(500).json({
       error: "Event creation failed",
       detail: e.message
    });
     console.log(e);

    }



})

router.get('/',async(req,res)=>{
    try{
        const con = await run();
        const [result] = await con.query('select * from events order by date asc , time asc')
        res.status(200).json({result});

    }
    catch(e){
        res.json({error:"Error occured",detail:e.message})

    }
})

router.post('/:id/register',async(req,res)=>{
    const event_id = req.params.id;
    const {name,email,phone} = req.body;
    try{
        const con = await run();
       const [result] = await con.execute('select * from events where id= ? ',[event_id]);
       if(result.length===0){
        return res.json({message:"No such event found"});

       }
       const [exixts] = await con.execute('select * from registrations where email=? and event_id=?',[email,event_id]);
       if(exixts.length>0){
        return res.json({message:"User has already registered"})
       }

       const [added] = await con.execute('insert into registrations (event_id,name,email,phone) values(?,?,?,?)',[event_id,name,email,phone])
       res.json({message:"Registration Successful"})


    }
    catch(e){
        res.json({error:"Registration Unsuccessful",detail:"Some Error Occured"});

    }
})

module.exports = router;