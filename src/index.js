const express = require("express");
const bodyparser = require("body-parser");
var admin = require("firebase-admin");

var serviceAccount = require("./tad_service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chmovie-9187d-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();
app.use(bodyparser.json());

const port = 3000;

var db = admin.database();
var refDevices = db.ref("devices");
var refRating = db.ref("rating");


app.post("/review-notification/:id", async (req, res) => {
  const username = req.query.username;
  const type = req.query.type;
  const { id } = req.params;

  console.log('id:', id);
  console.log('username:', username);

  try {
    // Lấy dữ liệu từ refRating và lọc các key
    const refRatingSnapshot = await refRating.child(id).once("value");
    const ratingData = refRatingSnapshot.val();
    console.log('Original data:', ratingData);

    const filteredKeys = Object.keys(ratingData).filter(key => key !== username);
    console.log('Filtered keys:', filteredKeys);

    // Lấy dữ liệu từ refDevices
    const refDevicesSnapshot = await refDevices.once("value");
    const devicesData = refDevicesSnapshot.val();

    // Lấy token từ các key đã lọc
    let allTokens = [];
    filteredKeys.forEach(key => {
      if (devicesData[key]) {
        let tokens = Object.keys(devicesData[key]);
        allTokens.push(...tokens);
      }
    });
    console.log('Token data:', allTokens);

    if (!allTokens || allTokens.length === 0) {
      return res.status(200).send('No registration tokens provided');
    }

    const message = {
      notification: {
        title: 'Rating Notification',
        body: 'There is a new rating for the movie you rated',
      },
      data: {
        id: id.toString(),
        type: type
      },
      tokens: allTokens,
    };

    // Gửi thông báo
    const response = await admin.messaging().sendMulticast(message);

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send message to ${allTokens[idx]}: ${resp.error.message}`);
        }
      });
      return res.status(500).send('Error sending some notifications');
    } else {
      console.log('Successfully sent message:', response);
      return res.status(200).send('Notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending message:', error.message);
    return res.status(500).send('Error sending notification');
  }
});



app.listen(port, () => {
  console.log("listening to PORT = " + port);
});