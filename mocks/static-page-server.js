const express = require("express");
const path = "../app/admin/dist/admin";
const app = express();
const port = 4000;

app.use(express.static(path));

app.listen(port, () => {
  console.log(
    `Static Page Server listening on port ${port}, serving from path ${path}.`
  );
});
