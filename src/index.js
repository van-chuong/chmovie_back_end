const express = require("express");
const bodyparser = require("body-parser");
const path = require('path')
var admin = require("firebase-admin");

var serviceAccount = require("./tad_service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chmovie-9187d-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public')))

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

app.get('/join-room', async (req, res) => {
    const userAgent = req.get('User-Agent');
    if (userAgent.includes('Android') || userAgent.includes('Windows')) {
        res.redirect(302, 'https://play.google.com/store/apps/details?id=com.pinterest&hl=vi');
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('Macintosh')) {
        res.redirect(302, 'https://apps.apple.com/us/app/pinterest/id429047995');
    } else {
        res.render("index.ejs")
    }
});

const sdk = require('node-appwrite');
const { channel } = require("diagnostics_channel");

// Init SDK
const client = new sdk.Client();

const messaging = new sdk.Messaging(client);

client
    .setEndpoint('https://cloud.appwrite.io/v1')    // Your API Endpoint
    .setProject('663b932300030cf0a819')                    // Your project ID
    .setKey('8303b36782ec09cf2bd02f44f41b04687567cc47d85cbfd26204248bfa381abc625246262793c7bcbb37891bab9aa6a146d2760d053b607b300b6da306f429b401ee2dad31b541e28794b3ac3d2a86e9a0b063843c9068b5c8c58de3065bb9efb025977926ce306d389b244d6794357dcb81878f8193b2f4c3183e3aab5bc5cc')    // Your secret API key
;



app.get('/push', async (req, res) => {
  //   const targets = [
  //     'eLgzSbgrS5qALtUAezu7cs:APA91bEy4FApIBqxFgybrrxtpBC2dRgkGIIIr032ke1HQgRQpaqTxRtghOZUg3ElWMqDTOchqIc9MX60PrtwcqO7CBdGSktOpCEqBQpLW1_VkW68EXlT4oHeMuhJ6LkZ5PV6XvZ7RiPW', // Thay thế bằng token của người dùng 1
  //     'token2', // Thay thế bằng token của người dùng 2
  //     // ... thêm các token của các người dùng khác
  // ];
    try{
    //   await messaging.createPush(
    //     sdk.ID.unique(), // messageId
    //     'OK',      // title
    //     'body',       // body
    //     [],             // topics (optional)
    //     ['663b9be10025fd74d015'],  
    //     [], // targets (optional)
    //     {
    //       "sound" :"sound",
    //       "channel_id": "2001"
    //     }, 
    //     undefined, // action
    //     undefined, // image
    //     undefined, // icon
    //     "noti_sound", 
    //     undefined, // color
    //     undefined, // tag
    //     undefined, // badge
    //     undefined, // draft
    //     undefined  // scheduledAt
    // );

    const message = {
      data: {
        title: "title",
        body: "body",
      },
      tokens: ['dGHE_ILSTKWcEOY5m_M69E:APA91bFDNADy9kqqOAKALrVm_0U7dVfk_KKZ36gfmqZz41nRjMnEsL3a4cz065o18qYOknt8YVkOQrsTu5rn67bSC9uWwc5pWV5ltf_Y81kDI1GdczYKzToXcdtppHozBY_9GB0SYcBP'],
    };

    // Gửi thông báo
    const response = await admin.messaging().sendMulticast(message);

    console.log("OKKKKKKKKKKKKK")
    }catch(e){
      console.log(e)
    }
});



app.listen(port, () => {
  console.log("listening to PORT = " + port);
});