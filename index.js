require("dotenv").config();
const express = require("express");
const app = express();
// app.use(express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.port;
const userroutes = require('./routes/users')
const adminroutes = require('./routes/admin')
const eventroutes = require('./routes/events');
const aiChatroute = require('./routes/aiChat');


app.use(express.static('public'));
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