const express = require("express");

const redis = require('redis');

const app = express();

const process = require('process');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

client.set('counter', 0);

app.get("/:value", (req, resp) => {

    const n = parseInt(req.param('value'));

    if (n > 15){
        process.exit(0);
    }
    else if (n < 1) {
        resp.send('zla wartośc');
    }

    client.get(n, (err, res) => {
        if (!res){
            const resultFact = Fact(n);
            client.set(n, resultFact);
            resp.send('Wynik nie istnial: ' + n + '! = ' + resultFact + ' ');
        }
        else {
            resp.send('Wynik istnial: ' + n + '! = ' + res + ' ')
        };
    });

    console.log("New req");
});

const Fact = (value) => {
    let result = 1
    for (i = 1; i <= value; i++) {
        result = result * i;
      }
      return result;
}

app.listen(8080, () => {
    console.log("Hellow i'am server");
});