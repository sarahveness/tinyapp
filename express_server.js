var express = require("express");
var app = express();

var methodOverride = require("method-override");
app.use(methodOverride('_method'))

app.set("view engine", "ejs");
var PORT = process.env.PORT || 3000; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

app.use(express.static('public'));

// ----------------------------

function generateRandomString() {
  var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i = 0; i < 6; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//first page : localhost:3000/urls | show me the urls_index view
app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//get a page to create a new short url | show me the urls_new page with the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:key/edit", (req, res) => {
  var templateVars = {
    longURL: urlDatabase[req.params.key],
    key: req.params.key,
  };
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
