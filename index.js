require("dotenv").config();
const express = require("express");
const app = express();
// app.use(express());
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.port;
const userroutes = require('./routes/users')
const adminroutes = require('./routes/admin')
const eventroutes = require('./routes/events');
const aiChatroute = require('./routes/aiChat');


app.use(express.static('public'));


//cors  
app.use(cors({
  origin: "http://localhost:5173", // Your React app's URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true // If using cookies or auth headers
}));



app.get('/',(req,res)=>{
    res.send("Hello world");
})

app.use('/api/users',userroutes);
app.use('/api/admin',adminroutes);
app.use('/api/events',eventroutes);
app.use('/api/chat',aiChatroute);







app.listen(port,()=>{
    console.log('server connected to port ',port);
})
// module.exports = {con};