
const keys = require('./keys');
const { v4: uuidv4 } = require('uuid');

const express = require('express');

const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.json());

const redis = require('redis');

const redisClient = redis.createClient({
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

const multipliers = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];

const appId = uuidv4();
console.log(keys);
pgClient.query('CREATE TABLE IF NOT EXISTS peselchecksums(partPesel VARCHAR(100), checkSum INT)', ).catch(err => console.log( "Create\n" + err));

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

app.get('/getP', (req, resp) => {
    pgClient.query('SELECT * FROM peselchecksums', (error, results) => {
        if (error) {
            throw error
        }
        resp.status(200).json(results.rows);
    });

});
app.listen(appPort, err => {
    console.log(`Hello  ${appPort}`)
});

app.get('/pesel/:value1', (req, resp) => {

    const pesel = req.param('value1');
    const isInt = isNaN(pesel);
    console.log(`Client [ ${appId} ]`);
    if(!isInt){
        if(pesel.length != 11)
            resp.send("Niepoprawna liczba znaków " + pesel.length);
        else{
            const checkNumber = pesel[pesel.length-1];
            const numbersToCalculate = pesel.substring(0, pesel.length-1);

            redisClient.get(numbersToCalculate, (err, res) => {
                
                if(!res){
                    console.log("Nie ma w redis\n");

                    pgClient.query('SELECT checksum FROM peselchecksums WHERE partPesel = ($1)', [numbersToCalculate], (error, result) => {
                        if (error){
                            console.log("Problem z bazą: " + error);

                            check = true;
                        }
                        else if (result.rows.length > 0){
                            const pgResult = result.rows[0].checksum;

                            console.log('Pobrano z PG database.' + pesel + " " + checkNumber + " " + pgResult);
                            
                            redisClient.set(numbersToCalculate, pgResult);
                            resp.send(compareCheckSum(checkNumber, pgResult));
                        }else{
                            console.log("Pesel " + pesel + " nie był sprawdzany.");

                            const calculatedNumber = calculate_pesel(numbersToCalculate);

                            pgClient.query('INSERT INTO peselchecksums (partPesel, checkSum) VALUES ($1,$2)', [numbersToCalculate, calculatedNumber], (error, result) =>{
                                redisClient.set(numbersToCalculate, calculatedNumber);
                                resp.send(compareCheckSum(checkNumber, calculatedNumber));
                            });
                        }
                    });
                }
                else{
                    console.log("Pobrano z redisa " + res + " .. " + pesel);

                    resp.send(compareCheckSum(checkNumber, res));
                }
            });
        }
    }else{
        resp.send("Dozwolne tylko liczby" + pesel);
    }
});

app.get('/pesel/', (req, resp) => {
    resp.send("Pesel nie może być pusty");
});

app.get("/pg", (req, resp) => {
    console.log("Pobieram z bazy...\n");
    pgClient.query('SELECT * FROM peselchecksums', (error, results) => {
        if (error) {
            throw error
        }
        resp.status(200).json(results.rows)
    })
});

app.get("/flushRedisKeys", (req, resp) =>{
    redisClient.flushall((err, success) => {
        if (err) {
          console.log(err);
          resp.send("Nie udało się usunąć kluczy.");
        }else{
            console.log("Klucze usunięte.");
            resp.send("Klucze usunięte.");
        }
    });
});

const compareCheckSum = (result, expected) => {
    if(result == expected){
        return "Pesel poprawny";
    }
    else{
       return "Pesel niepoprawny";
    }
};

const calculate_pesel = (pesel) => {
   
    let sum = 0;
    let i = 0;

    pesel.split('').forEach(element => {
        
        sum += parseInt(element) * multipliers[i];
        i++;
        
    });

    const rest = (10 - (sum % 10)) % 10;

    return rest;
};