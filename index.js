const express = require('express');
const port = 5000;
// const admin = require('firebase-admin');
require('dotenv').config()
console.log( process.env.DB_USER,process.env.DB_PASS);
const bodyParser = require('body-parser')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4czm1.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// burjAlArab

const app = express();
app.use(cors())
app.use(bodyParser.json())


const admin = require("firebase-admin");

const serviceAccount = require("./Configs/burj-al-arab-ac8c5-firebase-adminsdk-9mxky-cfeb514928.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

client.connect(err => {
  const collection = client.db("burjAlArab").collection("shihab");
    app.post('/addBooking', (req,res)=>{
        const newBooking = req.body;
        // console.log(newBooking)
        collection.insertOne(newBooking)
        .then(result=>{
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/bookings', (req, res)=> {
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            // console.log({idToken});
            admin
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
            const uidEmail = decodedToken.email;
            if(uidEmail == req.query.email){
                collection.find({email: req.query.email})
                .toArray((err,documents)=>{
                    res.send(documents)
     })
            }
            else(            res.status(401).send('Access Denied')            )
            })
            .catch((error) => {
                res.status(401).send('Access Denied')
            });
        }
        else{
            res.status(401).send('Access Denied')
        }
    })
    
});


app.get('/', (req, res) => {
    res.send('Welcome')
})

app.listen(port)