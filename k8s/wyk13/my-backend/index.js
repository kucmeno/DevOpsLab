
const keys = require('./keys');
const { v4: uuidv4 } = require('uuid');

const express = require('express');

const app = express();

const redis = require('redis');

// const redisClient = redis.createClient({
//     host: "myredisservice",
//     port: 6379,
//     retry_strategy: () => 1000
// });

const redisClient = redis.createClient({
    //host: "myredisservice",
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

const appId = uuidv4();
console.log(keys);
pgClient.query('CREATE TABLE IF NOT EXISTS wyk12(id VARCHAR(100), val VARCHAR(100))', ).catch(err => console.log( "Create\n" + err));

const appPort = 5000;
app.get('/', (req, res) => {
    redisClient.get("counter", (err, response) => {
        if(!response){
            redisClient.set("counter",0);
            res.send(`[ ${appId} ] Hello word 0 \n`);
        }else{
            response = parseInt(response) + 1;
            redisClient.set("counter", response);
            res.send(`[ ${appId} ] Hello word ${response} ${keys.initMessage} \n`);
        }
    });
});

app.get('/new/:value1', (req, resp) => {

    const val = req.param('value1');
    pgClient.query('INSERT INTO wyk12 (id, val) VALUES ($1,$2)', [appId, val], (error, result) =>  
    {
        if(error){
            console.log("Problem z bazą: " + error);
            resp.send("Problem z dodanie");
        }
        resp.send("Dodano");
    });
});

app.get('/get', (req, resp) => {
    pgClient.query('SELECT * FROM wyk12', (error, results) => {
        if (error) {
            throw error
        }
        resp.status(200).json(results.rows);
    });

});
app.listen(appPort, err => {
    console.log(`Hello  ${appPort}`)
});