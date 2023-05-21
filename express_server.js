const express = require('express');
let cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();

const PORT = 8080;// default port 8080
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },

};

app.use(express.urlencoded({ extended: true }));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);//here getting the urlDatabase object in the form of json string
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getUserByID(userId, users);
  const templateVars = { urls: urlsForUser(userId), user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getUserByID(userId, users);
  if (!user) { //if user is not logged in redirecting to login page
    return res.redirect("/login");
  }
  const templateVars = { user }; //if logged in then redirecting to urls_new page
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getUserByID(userId, users);
  if (!user) {
    return res.status(403).send("<p>You need to be logged in or register first.</p>");
  }
  if (!urlDatabase[req.params.id]) { //Handle Short URL Ids that do not exist
    return res.status(404).send("URL does not exist");
  }
  if (urlDatabase[req.params.id].userId !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
  res.render("urls_show", templateVars);
});

//post request to generate short URL
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("<p>You need to be logged in to shorten URLs.</p>");//IT is only working with curl
  }
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userId: userId };
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) { //handle long URL ids that do not exist
    return res.status(404).send("URL does not exist");
  }
  res.redirect(longURL);
});

//get request for registration form
app.get("/register", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  res.render("urls_register",email, password);
});

//get request for login form
app.get("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  res.render("urls_login",email, password);
});

//post request for delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getUserByID(userId, users);
  if (!user) {
    return res.status(403).send("<p>You need to be logged in or register first.</p>");
  }
  if (!urlDatabase[req.params.id]) { //Handle Short URL Ids that do not exist
    return res.status(404).send("URL does not exist");
  }
  if (urlDatabase[req.params.id].userId !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//post request for edit
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getUserByID(userId, users);
  if (!user) {
    return res.status(403).send("<p>You need to be logged in or register first.</p>");
  }
  if (!urlDatabase[req.params.id]) { //Handle Short URL Ids that do not exist
    return res.status(404).send("URL does not exist");
  }
  if (urlDatabase[req.params.id].userId !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  let id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL; //storing the edited longURL in the database
  res.redirect("/urls");
});

//post request to clear cookies
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//post request for registration
app.post("/register", (req,res) => {
  if (req.body.email === "" || req.body.password === "") { //check if email or password were not provided
    return res.status(400).send("Email and password fields cannot be empty.");
  }

  if (getUserByEmail(req.body.email, users)) {//check if user already exists or not
    return res.status(400).send("User already exists.");
  }

  let id = generateRandomString();
  let email = req.body.email; //storing the value of email field in object key email.
  let password = req.body.password;
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect("/urls");
  
});


//post request for login
app.post("/login", (req,res) => {
  if (req.body.email === "" || req.body.password === "") { //check if email or password were not provided
    return res.status(400).send("Email and password fields cannot be empty.");
  }
  const user = getUserByEmail(req.body.email, users);
  if (!user) {//check if user already exists or not
    return res.status(403).send("User not found, You need to register.");
  } else if (user.password !== req.body.password) {
    return res.status(403).send("Incorrect Password.");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let string = (Math.random() + 1).toString(36).substring(6);
  return string;
};

const getUserByID = function(userId, users) {
  for (let id in users) {
    if (users[id].id === userId) {
      return users[id];
    }
  }
  return null;
};

const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};
// a function which returns URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(cookieId) {
  const userUrls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userId === cookieId) {
      userUrls[id] = urlDatabase[id];
    }
  }
  return userUrls;
};
