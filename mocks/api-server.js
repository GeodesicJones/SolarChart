const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
const port = 3000;
const secret = "fdlskjfdslkfjdsl";
const fs = require("fs");
const dataFolder = "./data";

app.use(cors());
app.use(bodyParser.json());

app.get("/", function(req, res) {
  const fileName = `${dataFolder}/${req.query.key}`;
  var data = fs.readFileSync(fileName, "utf8");
  res.send(data);
});

app.post("/", function(req, res) {
  var token = req.headers["authorization"];
  if (token && jwt.verify(token, secret)) {
    const fileName = `${dataFolder}/${req.body["key"]}`;
    fs.writeFileSync(fileName, req.body["content"], "utf8");
    res.send({ message: "ok" });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/authenticate", function(req, res) {
  var userid = req.body["userid"];
  var password = req.body["password"];
  if (userid === "admin" && password === "password") {
    var token = jwt.sign("admin", secret);
    res.send('"' + token + '"');
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.listen(port, () => {
  console.log(
    `API Server listening on port ${port}, accessing data folder ${dataFolder}.`
  );
});
