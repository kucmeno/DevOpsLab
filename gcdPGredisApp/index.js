const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const redis = require('redis');
const redisClient =  redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('No connection to PG DB'));;

pgClient.query('CREATE TABLE IF NOT EXISTS gcdresults(numbers VARCHAR(255), result INT)').catch(err => console.log(err));

console.log(keys);

app.get('/', (req, resp) => {
    resp.send("Hello world!");
});

app.listen(8080, err => {
    console.log('Server listening on port 8080');
})

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

app.get("/:value1/:value2", (req, resp) => {

    const n1 = parseInt(req.param('value1'));
    const n2 = parseInt(req.param('value2'));

    const keyGCD = [n1, n2].sort().toString();

    redisClient.get(keyGCD, (err, res) => {
        if (!res){
            pgClient.query('SELECT result FROM gcdresults WHERE numbers = ($1)', [keyGCD], (error, result) => {
                if (error) {
                    throw error
                }
                console.log(result.rows.length);
                if (result.rows.length > 0){
                    const pgResult = result.rows[0].result;

                    if (pgResult) {
                        redisClient.set(keyGCD, pgResult);
                        resp.send('Wynik nie istnial, pobrany z PG database.\nGCD: ' + n1 + ' ' + n2 + ' = ' + pgResult + ' \n');
                    }
                }else{
                    const resultGCD = gcd_own(n1, n2);
                    redisClient.set(keyGCD, resultGCD);
                    pgClient.query('INSERT INTO gcdresults (numbers, result) VALUES ($1,$2)', [keyGCD, resultGCD]).catch(err => console.log(err));
                    resp.send('Wynsik nie istniał.\nGCD: ' + n1 + ' ' + n2 + ' = ' + resultGCD + ' \n');
                }
            });
        }
        else {
            resp.send('Wynik istniał, pobrany z redisa.\nGCD: ' + n1 + ' ' + n2 + ' = ' + res + ' \n')
        };
    });
    console.log("New req");
});

app.get("/gcd_results", (req, resp) => {
    console.log("Pobieram z bazy...\n");
    pgClient.query('SELECT numbers,result FROM gcdresults', (error, results) => {
        if (error) {
            throw error
        }
        resp.status(200).json(results.rows)
    })
});