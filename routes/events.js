const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateAdmin = require("../middlewares/auth.js");
const UserAuthentication = require("../middlewares/userAuth.js");

const run = require("../db.js");
const e = require("express");

router.post("/create", authenticateAdmin, async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    venue,
    category,
    picture,
    last_date,
  } = req.body;
  try {
    const con = await run();

    const [result] = await con.execute(
      "insert into events (title,description,date,time,venue,category,picture,last_date) values(?,?,?,?,?,?,?,?)",
      [
        title,
        description,
        date,
        time,
        venue,
        category,
        picture || "http://localhost:3000/defaultimg.webp",
        last_date,
      ]
    );
    res.json({
      message: "Event registraion Succussful",
      eventId: result.insertId,
    });
  } catch (e) {
    res.status(500).json({
      error: "Event creation failed",
      detail: e.message,
    });
    console.log(e);
  }
});

router.get("/", async (req, res) => {
  try {
    const con = await run();
    const [result] = await con.query(
      "select * from events order by date asc , time asc"
    );
    res.status(200).json({ result });
  } catch (e) {
    res.json({ error: "Error occured", detail: e.message });
  }
});

router.post("/:id/register", UserAuthentication, async (req, res) => {
  const event_id = req.params.id;
  const { name, email, phone ,user_id } = req.body;
  try {
    const con = await run();
    const [result] = await con.execute("select * from events where id= ? ", [
      event_id,
    ]);

    const [result2] = await con.execute("select * from registrations where event_id = ? and user_id= ? ",[event_id,user_id])

    if (result.length === 0) {
      return res.json({ message: "No such event found" });
    }
    if(result2.length>0){
      return res.json({message:"You have already registered in this event"})
    }

    if (new Date() > new Date(result[0].last_date)) {
      return res
        .status(400)
        .json({ message: "Registration closed for this event" });
    }

    // const [exixts] = await con.execute(
    //   "select * from registrations where email=? and event_id=?",
    //   [email, event_id]
    // );
    // if (exixts.length > 0) {
    //   return res.json({ message: "User has already registered" });
    // }

    const [added] = await con.execute(
      "insert into registrations (event_id,user_id,name,email,phone) values(?,?,?,?,?)",
      [event_id,user_id, name, email, phone]
    );
    res.json({ message: "Registration Successful" });
  } catch (e) {
    res.json({
      error: "Registration Unsuccessful",
      detail: "Some Error Occured",
    });
  }
});

//Events by the user

router.get('/:id/myevents',UserAuthentication, async (req,res)=>{
  const id = req.params.id;
  try{
    const con = await run();
    const [enquire] = await con.query("select * from registrations where user_id = ?",[id])

    if(enquire.length==0){
      return res.json({error:"You have not registered in any event"})
    }

    const [result] = await con.query("select * from events e join registrations r on e.id = r.event_id where r.user_id = ? order by date asc , time asc",[id])
    res.json(result);
  }
  catch(e){
    res.status(500).json({error:e.message});

  }
})

router.get("/:id/participants", authenticateAdmin, async (req, res) => {
  const eventId = req.params.id;
  try {
    const con = await run();
    const [result] = await con.execute("select * from events where id=(?)", [
      eventId,
    ]);
    if (result.length === 0) {
      return res.json({ message: "No such event found" });
    }
    const [players] = await con.execute(
      "select name,email,phone,registered_at from registrations where event_id=(?) ",
      [eventId]
    );
    res.send({ event: result[0].title, players });
  } catch (e) {
    res.send({ error: e.message });
  }
});
router.delete("/:id/deleteEvent", authenticateAdmin, async (req, res) => {
  const eventId = req.params.id;
  try {
    const con = await run();
    const [events] = await con.execute("select * from events where id=(?)", [
      eventId,
    ]);
    if (events.length == 0) {
      return res.json({ message: "No such events present " });
    }
    await con.execute("delete from registrations where event_id=(?)", [
      eventId,
    ]);
    await con.execute("delete from events where id=(?)", [eventId]);
    res.status(400).json({ message: "Event deleated successfully" });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
router.post("/:id/feedback", UserAuthentication, async (req, res) => {
  const eventId = req.params.id;
  const { rating, comment } = req.body;
  try {
    const con = await run();
    const [event] = await con.execute("select * from events where id=(?)", [
      eventId,
    ]);
    if (event.length === 0) {
      return res.json({ message: "No such event present" });
    }
    if (!rating || rating < 0 || rating > 5) {
      return res.json({ message: "Invalid rating" });
    }
    const [results] = await con.execute(
      "insert into feedback (event_id,rating,comment) values (?,?,?)",
      [eventId, rating, comment]
    );
    res.json({ message: "FeedBack Taken Successfully" });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Failed to submit feedback", detail: e.message });
  }
});
router.get("/:id/getFeedback", async (req, res) => {
  const eventId = req.params.id;
  try {
    const con = await run();
    const [event] = await con.execute("select * from events where id=(?)", [
      eventId,
    ]);
    if (event.length === 0) {
      return res.json({ message: "No such Event exists" });
    }

    const [results] = await con.execute(
      "select event_id,rating,comment,submitted_at from feedback where event_id=(?)",
      [eventId]
    );
    res.json({ event: event[0].title, results });
  } catch (e) {
    res.json({ error: "Some error occured", message: e.message });
  }
});



module.exports = router;
