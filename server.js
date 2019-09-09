const express = require("express");
const app = express();
const port = 3000;

app.get("/admin", require("./index.js"));

app.listen(port, () => console.log(`Serving on port ${port}!`));
