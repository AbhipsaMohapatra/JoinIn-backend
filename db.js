const mysql = require("mysql2/promise");
// const pass = process.env.password
let con;
async function run() {
  try {
     con = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: process.env.password,
      database: "event_app",
    });
    console.log("Connected to database")
    return con
  } catch (err) {
    console.log(err);
  }
}
run();
module.exports = run
