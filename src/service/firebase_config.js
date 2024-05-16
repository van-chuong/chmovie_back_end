
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chmovie-9187d-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const database = admin.database()

module.exports = {
    database
};