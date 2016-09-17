var express = require("express");
var app = express();

var methodOverride = require("method-override");
app.use(methodOverride('_method'))

app.set("view engine", "ejs");
var PORT = process.env.PORT || 3000; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

app.use(express.static('public'));

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

// < ------------------ GENERATE SHORT URL FUNCTION BELOW ------------------ >

function generateRandomString() {
  var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i = 0; i < 6; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
}

// < ----------------- DATABASE CONNECT FUNCTION  ---------------------- >

function connectAndThen(cb) {
  MongoClient.connect(MONGODB_URI, (err, db) => {
    cb(err, db);
  });
}

//< ----------


// console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);

// var dbInstance;

// MongoClient.connect(MONGODB_URI, (err, db) => {

//   if (err) {
//     console.log('Could not connect! Unexpected error. Details below.');
//     throw err;
//   }

//   dbInstance = db;

//   console.log('Connected to the database!');
//   var collection = db.collection("urls");

//   console.log('Retreiving documents for the "test" collection...');
//   collection.find().toArray((err, results) => {
//     console.log('results: ', results);


//   });
// });

// < ------------------------- END OF DATABaSE ------------------------- >


// < -----------------GET LONG URL FUNCTION -------------------->

function getLongURL(db, shortURL, cb) {
  var query = { "shortURL": shortURL };
  db.collection("urls").findOne(query, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result.longURL);
  });
}


// < ------------- END OF FUNCTION -------------------->


var urlDatabase = {
  "AAAAAA": "http://www.neopets.com",
  "BBBBBB": "http://www.IHATETHIS.com",
};


//first page : localhost:3000/urls | show me the urls_index view
app.get("/urls", (req, res) => {
  connectAndThen(function(err, db) {
    if (err) {
      console.log("With errors: "+err);
    }
    db.collection("urls").find().toArray((err, urls) => {
      res.render("urls_index", {urls: urls});
    });
  });
  // var templateVars = { urls: urlDatabase };

});

//get a page to create a new short url | show me the urls_new page with the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:key/edit", (req, res) => {
  var shortURL = req.params.key;
  var templateVars;
  getLongURL(dbInstance, shortURL, (err, longURL) => {
    debugger;
        templateVars = {
        longURL: longURL,
        shortURL: shortURL
      };
  });
  res.render("urls_show", templateVars);
});

//add a new short URL to the database |
app.post("/urls", (req, res) => {
  var theShortURL = generateRandomString();
  var userEnterURL = req.body.longURL;
  urlDatabase[theShortURL] = userEnterURL;
  res.redirect('/urls/shortURL');
});

app.put("/urls/:key/edit", (req, res) => {
  urlDatabase[req.params.key] = req.body.longURL;
  res.redirect('/urls');
});

app.delete("/urls/:key", (req, res) => {
  var keyToRemove = req.params.key;
  delete urlDatabase[keyToRemove];
  res.redirect('/urls');
});

app.get("/urls/shortURL", (req, res) => {
  var length = Object.keys(urlDatabase).length -1;
  var shortenTheURL = Object.keys(urlDatabase)[length];
  res.render("urls_create", {shortURL: shortenTheURL});
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//starts the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
