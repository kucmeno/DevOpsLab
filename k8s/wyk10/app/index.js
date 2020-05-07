const express = require("express");

const app = express();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

const randNumber = getRandomInt(1,100);
app.get("/", (req, resp) => {
    resp.send("Hello my random mnumber is " + randNumber + " :)\n");
});
app.listen(80, () => {
    console.log("Ser listening on port 4000");
});
