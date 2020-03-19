const express = require("express");

const redis = require('redis');

const app = express();

const process = require('process');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

client.set('counter', 0);

app.get("/", (req, resp) => {
    console.log("New req");
    // process.exit(0);

    client.get('counter', (err, counter) => {
        resp.send('counter ' + counter);
        client.set('counter', parseInt(counter)+1)
    });
});

app.listen(8080, () => {
    console.log("Helowwww i am server 4000");
});