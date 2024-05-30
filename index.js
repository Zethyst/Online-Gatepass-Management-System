const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const db = require("./connection");

app.use(bodyParser.json());

const con = db;

con.connect((error) => {
  if (error) {
    throw error;
  }
  con.query("CREATE DATABASE IF NOT EXISTS gatepass", (err) => {
      if (err) {
          throw err;
      }
      console.log("[+] Database created or already exists");
  });
  // console.log("[+] Connected");
});

app.use("/api",require("./Routes/index"));

app.listen(8081, () => {
  console.log("[+] Listening on port 8081");
});
