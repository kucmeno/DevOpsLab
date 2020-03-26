const express = require("express");

const redis = require('redis');

const app = express();

const process = require('process');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

app.get("/:value1/:value2", (req, resp) => {

    const n1 = parseInt(req.param('value1'));
    const n2 = parseInt(req.param('value2'));
    //const keyGCD = [n1, n2].sort(); // it did not work

    const keyGCD = [n1, n2].sort().toString();

    client.get(keyGCD, (err, res) => {
        if (!res){
            const resultGCD = gcd_own(n1, n2);
            client.set(keyGCD, resultGCD);
            resp.send('Wynik nie istnial GCD: ' + n1 + ' ' + n2 + '! = ' + resultGCD + ' ');
        }
        else {
            resp.send('Wynik istnial GCD: ' + n1 + ' ' + n2 + '! = ' + res + ' ')
        };
    });
    console.log("New req");
});

const gcd_own = (x, y) => {
    x = Math.abs(x);
    y = Math.abs(y);
    while(y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

app.listen(8080, () => {
    console.log("Hellow i'am server");
});