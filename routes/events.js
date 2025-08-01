const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateAdmin = require('../middlewares/auth.js');
const UserAuthentication = require('../middlewares/userAuth.js');

const run = require('../db.js');
const e = require('express');

router.post('/create',authenticateAdmin, async(req,res)=>{
    const {title,description,date,time,venue,category,picture} = req.body;
    try{

        const con = await run();
    
        const [result] = await con.execute('insert into events (title,description,date,time,venue,category,picture) values(?,?,?,?,?,?,?)',[title,description,date,time,venue,category,picture||null]);
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

router.post('/:id/register',UserAuthentication,async(req,res)=>{
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
 
router.get('/:id/participants',authenticateAdmin,async(req,res)=>{
    const eventId= req.params.id;
    try{
        const con = await run();
        const[result] = await con.execute('select * from events where id=(?)',[eventId]);
        if(result.length===0){
            return res.json({message:"No such event found"})
        }
        const[players] = await con.execute('select name,email,phone,registered_at from registrations where event_id=(?) ',[eventId]);
        res.send({event:result[0].title,players})



    }
    catch(e){
        res.send({error:e.message})

    }
})
router.delete('/:id/deleteEvent',authenticateAdmin,async(req,res)=>{
    const eventId = req.params.id;
    try{
        const con = await run();
        const [events] = await con.execute('select * from events where id=(?)',[eventId]);
        if(events.length==0){
            return res.json({message:"No such events present "})
        }
        await con.execute('delete from registrations where event_id=(?)',[eventId]);
        await con.execute('delete from events where id=(?)',[eventId]);
        res.status(400).json({message:"Event deleated successfully"});

    }
    catch(e){
        res.status(404).json({error:e.message});

    }
})
router.post('/:id/feedback',UserAuthentication,async (req,res)=>{
    const eventId = req.params.id;
    const {rating,comment} = req.body;
    try{
        const con = await run();
        const [event] = await con.execute('select * from events where id=(?)',[eventId]);
        if(event.length===0){
            return res.json({message:"No such event present"});
        }
        if(!rating || rating<0 || rating>5){
            return res.json({message:"Invalid rating"})
        }
        const [results] = await con.execute('insert into feedback (event_id,rating,comment) values (?,?,?)',[eventId,rating,comment]);
        res.json({message:"FeedBack Taken Successfully"});

    }
    catch(e){
         res.status(500).json({ error: "Failed to submit feedback", detail: e.message });

    }
});
router.get('/:id/getFeedback',async(req,res)=>{
    const eventId = req.params.id;
    try{
        const con = await run();
        const [event] = await con.execute('select * from events where id=(?)',[eventId]);
        if(event.length===0){
            return res.json({message:"No such Event exists"})

        }
        
        const[results] = await con.execute('select event_id,rating,comment,submitted_at from feedback where event_id=(?)',[eventId]);
        res.json({event:event[0].title,results});


    }
    catch(e){
        res.json({error:"Some error occured",message:e.message})

    }

})

module.exports = router;