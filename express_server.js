const express = require('express');
let cookieParser = require('cookie-parser');
const app = express();

const PORT = 8080;// default port 8080
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);//here getting the urlDatabase object in the form of json string
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL does not exist");
  }
  const username = req.cookies["username"];
  const templateVars = { id: req.params.id, username, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//post request to generate short URL
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//post request for delete
app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//post request for edit
app.post("/urls/:id/edit", (req, res) => {
  let id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL; //storing the edited longURL in the database
  res.redirect("/urls");
});

//a post request to handle login route
app.post("/login", (req,res) => {
  let username = req.body.username;
  res.cookie('username',username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let string = (Math.random() + 1).toString(36).substring(6);
  return string;
};

