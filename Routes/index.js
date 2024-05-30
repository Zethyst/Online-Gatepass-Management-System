const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const db = require("../connection");
const con = db;

//! Route 1 for creating any table to store respective data
router.post("/createtable", (req, res) => {
    const tableName = req.body.tableName;
    const columns = req.body.columns;
    const foreignKeys = req.body.foreignKeys || [];
  
    if (!tableName || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    let columnsSql = columns.map(column => `${mysql.escapeId(column.name)} ${column.type}`).join(", ");
    
    // Add foreign key constraints if given in array format
    if (foreignKeys.length > 0) {
      const foreignKeysSql = foreignKeys.map(fk => 
        `FOREIGN KEY (${mysql.escapeId(fk.column)}) REFERENCES ${mysql.escapeId(fk.referencesTable)}(${mysql.escapeId(fk.referencesColumn)})`
      ).join(", ");
      columnsSql += `, ${foreignKeysSql}`;
    }
  
    const sql = `CREATE TABLE IF NOT EXISTS ${mysql.escapeId(tableName)} (${columnsSql});`;
  
    con.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.sqlMessage });
      }
      console.log(`[+] Table ${tableName} created or already exists`);
      return res.json({ message: `Table ${tableName} created` });
    });
  });
  

//! Route 2 for adding the data to selected table
router.post("/insert", (req, res) => {
  const tableName = req.body.tableName;
  const data = req.body.data; // Data should be an object like {column1: 'value1', column2: 'value2'}
  console.log(data);
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data)
    .map((value) => mysql.escape(value))
    .join(", ");
  const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
  1;
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ message: err.sqlMessage });
    }
    console.log(`[+] Data inserted into table ${tableName}`);
    return res.json({ message: `Data inserted into table ${tableName}` });
  });
});

//! Route 3 to get all the data from a particular table
router.get("/fetchall", (req, res) => {
  const tableName = req.body.tableName;
  const sql = `SELECT * FROM ${tableName}`;
  con.query(sql, (err, data) => {
    if (err) {
      return res.json({ message: err.sqlMessage });
    }
    return res.json(data);
  });
});

//! Route 4 to drop a table
router.post("/droptable", (req, res) => {
  const tableName = req.body.tableName;
  const sql = `DROP TABLE ${tableName}`;
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ message: err.sqlMessage });
    }
    console.log(`[+] Table ${tableName} successfully dropped`);
    return res.json({ message: `Table [${tableName}] dropped` });
  });
});

//! Route 5 for delete-row?id=646
router.delete("/delete-row", (req, res) => {
    const tableName = req.body.tableName;
    const queryParams = req.query;
  
    if (!tableName || !queryParams) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    const key = Object.keys(queryParams)[0];
    const value = queryParams[key];
  
    if (!key || !value) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    const sql = `DELETE FROM ${mysql.escapeId(tableName)} WHERE ${mysql.escapeId(key)} = ${mysql.escape(value)}`;
  
    con.query(sql, (error, result) => {
      if (error) {
        return res.status(500).json({ message: error.sqlMessage });
      }
      return res.json({ message: `Row with ${key} = ${value} deleted from ${tableName}` });
    });
  });
  
  

//! Route 6 will hit when the user has entered the update form details and will submit it and this API will update the table
router.put("/update-row", (req, res) => {
    const tableName = req.body.tableName;
    const data = req.body.data; // Data should be an object like {column1: 'value1', column2: 'value2'}
    const queryParams = req.query;
  
    if (!tableName || !queryParams || !data) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    const key = Object.keys(queryParams)[0];
    const value = queryParams[key];
  
    if (!key || !value) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    const updates = Object.keys(data)
      .map((key) => `${key} = ${mysql.escape(data[key])}`)
      .join(", ");
    const sql = `UPDATE ${mysql.escapeId(tableName)} SET ${updates} WHERE ${mysql.escapeId(key)} = ${mysql.escape(value)}`;
  
    con.query(sql, (error, result) => {
      if (error) {
        return res.status(500).json({ message: error.sqlMessage });
      }
      return res.json({ message: `Row in table ${tableName} updated` });
    });
  });
  

//! Route 7 for searching filtered data from tables
router.get("/search", (req, res) => {
    const tableName = req.body.tableName;
    const data = req.body.data; // Data should be an object like {column1: 'value1', column2: 'value2'}
  
    if (!tableName || !data) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    const conditions = Object.keys(data)
      .map((key) => `${mysql.escapeId(key)} LIKE ${mysql.escape('%' + data[key] + '%')}`)
      .join(" AND ");
    const sql = `SELECT * FROM ${mysql.escapeId(tableName)} WHERE ${conditions}`;
  
    con.query(sql, (error, result) => {
      if (error) {
        return res.status(500).json({ message: error.sqlMessage });
      }
      return res.json({ result });
    });
  });
  

module.exports = router;
