const express = require("express");
const app = express();
const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { set } = require("express/lib/application");

// configure environment variables
require("dotenv").config();

// store all the emails (database can be used)
const data_path = "data/data.json"

app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded());
app.use(express.json());


// send mails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD
  }
});

// function to create a watch for an individual form
async function createwatch(formid, token) {

  var data = JSON.stringify({
    "watch": {
      "target": {
        "topic": {
          "topicName": process.env.TOPIC_NAME
        }
      },
      "event_type": "RESPONSES",
      "state": "ACTIVE"
    },
  });

  var config = {
    method: 'post',
    url: `https://forms.googleapis.com/v1/forms/${formid}/watches`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios(config)
    console.log(JSON.stringify(response.data));
    return 200
  }
  catch (error) {
    console.log("create watch error: ", error);
    return 400
  }
}

// send email
async function sendmail(toemail, message) {
  try {
    await transporter.sendMail({
      from: 'testmailprojectpython@gmail.com',
      to: toemail,
      subject: 'Test Email Subject',
      html: `<h1>${message}</h1>`
    });
    return 200

  }
  catch (error) {
    console.log(`send email error: ${error}`)
    return 400
  }
}

// get the email associated with a form
function get_email(formid) {
  try {
    let buffer_data = fs.readFileSync(data_path)
    let data = JSON.parse(buffer_data)
    return data[formid]
  }
  catch (error) {
    console.log(`get email error: ${error}`)
    return null
  }
}

// associate a email with a form
function set_email(formid, email) {
  try {

    let buffer_data = fs.readFileSync(data_path)
    let data = JSON.parse(buffer_data)
    data[formid] = email
    fs.writeFileSync(data_path, JSON.stringify(data))
    return true
  }
  catch (error) {
    console.log(`set email error: ${error}`)
    return false
  }

}

// home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html")
})

// success page
app.get("/success", (req, res) => {
  res.sendFile(__dirname + "/public/pages/success.html")
})

// error page
app.get("/error", (req, res) => {
  res.sendFile(__dirname + "/public/pages/error.html")
})

// testing purpose
app.get("/createwatch", async (req, res) => {
  const token = req.query.token
  const formid = req.query.formid
  const response = await createwatch(formid, token)
  res.sendStatus(response)
})

//testing purpose
app.get("/sendmail", async (req, res) => {
  const response = await sendmail("testmailprojectpython@gmail.com", "New response in your form ")
  res.send(response)
})

// webhook from pubsub to notify user
app.post("/webhook", async (req, res) => {
  try {
    console.log("body: ", req.body);
    const formid = req.body.message.attributes.formId
    console.log("FormId: '", formid,"'")

    const email = get_email(formid)
    if (email) {
      const response = await sendmail(email, `New response in your <a href="https://docs.google.com/forms/d/${formid}">form</a>`);
    }
    else{
      console.log(`No email associated with formid: ${formid}`)
    }
    res.sendStatus(200)
  }
  catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
})

// oauth authorization and create watch
app.get("/redirect", async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/redirect"
  );

  const state = req.query.state.split("/")
  const email = state[0]
  const formid = state[1]

  let temp = set_email(formid, email)

  if (!temp) {
    console.log("Unable to record email")
  }

  try {
    let token = await oauth2Client.getToken(req.query.code)

    oauth2Client.setCredentials(token)

    if (token["res"] && token["res"]["status"] == 200) {
      console.log(`formid: ${formid} email: ${email} token: ${token["tokens"]["access_token"]}`)
      const response = await createwatch(formid, token["tokens"]["access_token"])

      if (response == 400) {
        res.redirect("/error")
        // res.send("Enter edit link in your google drive and check if you have access to the form. And maybe you already created a watch.")
      }
      else {

        console.log("Created Watch")
        try {
          await sendmail(email, "You will get notified if someone submits a response.")
        }
        catch (error) {
          console.log(`send email error: ${error}`)
        }

        res.redirect("/success")
        // res.send(`Created Watch: ${response}`)
      }
    }
    else {
      res.redirect("/error")
      // res.send(JSON.stringify(token))
    }

  }
  catch (err) {
    console.log(`Error: ${err}`);
    res.redirect("/error")
    // res.send("Unable to authenticate");
  }

})

// start server
var server = app.listen(process.env.PORT || 3000, () => {
  var host = server.address().address
  var port = server.address().port

  console.log(`Host: ${host} port:${port}`)
})