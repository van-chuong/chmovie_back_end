const express = require('express');
const dotenv = require('dotenv');

const { database } = require('./service/firebase_config');
const ratingRef = database.ref("rating");

const FirebaseService = require('./service/firebase_service');

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/rating', (req, res) => FirebaseService.sendRatingMessage(req, res));

const port = 8888
const listening = app.listen(port, () => {
    console.log(`Server is running on port ${listening.address().port}`)
})