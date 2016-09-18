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
    if (err) {
      console.log("Could not connect to database! Unexpected error. Details below");
      throw err;
    }

    cb(err, db);
  });
}

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
    })
  });

});

//get a page to create a new short url | show me the urls_new page with the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add a new short URL to the database |
app.post("/urls", (req, res) => {
  var newURL = {
    shortURL: generateRandomString(),
    longURL: req.body.longURL
  }
  console.log("Attemping to insert new URL: ", newURL);

  connectAndThen((err, db) => {
    db.collection('urls').insert(newURL, (err, url) => {
      if(err) res.status(500).json(err);
      res.render("urls_created", {url: newURL.longURL});
    })
})
});


app.get("/urls/:key/edit", (req, res) => {
  connectAndThen(function(err, db) {
    if (err) {
      console.log("With errors: "+err);
    }
    //when you're using "find" you have to use ".toArray" to get the information back.
    db.collection("urls").findOne({shortURL: req.params.key}, (err, url) => {
      res.render("urls_editandshow", {url: url});
    })
  });

});



app.put("/urls/:key/edit", (req, res) => {
  connectAndThen(function(err, db) {
    db.collection("urls").updateOne({shortURL: req.params.key}, {$set: {longURL: req.body.longURL}}, (err, urls) => {
    res.redirect('/urls');
    })
  });
});


app.delete("/urls/:key", (req, res) => {
  connectAndThen(function(err, db) {
    db.collection("urls").deleteOne({shortURL: req.params.key}, function(err) {
      res.redirect('/urls');
    })
  });
});

//Redirect to the actual page
app.get("/u/:shortURL", (req, res) => {
  // var longURL =
  connectAndThen((err, db) => {
    //find a URL with the matching shortURL
    db.collection('urls').findOne({shortURL: req.params.shortURL}, function(err, url) {
      //Redirect to the short URL
      res.redirect(url);
    })
  })
});


//starts the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});














