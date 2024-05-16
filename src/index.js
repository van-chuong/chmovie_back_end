const express = require("express");
const bodyparser = require("body-parser");
var admin = require("firebase-admin");

var serviceAccount = require("./tad_service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyparser.json());

const port = 3000;

app.post("/", (req, res) => {
  const { registrationTokens, notification } = req.body;

  if (!registrationTokens || registrationTokens.length === 0) {
    return res.status(400).send('No registration tokens provided');
  }

  const message = {
    notification: {
      title: notification?.title || 'Default Title',
      body: notification?.body || 'Default Body',
    },
    data: {
      Nick: "Mario",
      Room: "PortugalVSDenmark",
    },
    tokens: registrationTokens,
  };

  // Send a multicast message to the provided tokens.
  admin.messaging().sendMulticast(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      res.status(200).send('Notification sent successfully');
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      res.status(500).send('Error sending notification');
    });
});

app.listen(port, () => {
  console.log("listening to PORT = " + port);
});