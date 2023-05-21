const express = require('express');
let cookieSession = require('cookie-session');
const helpers = require('./helpers');
const getUserByEmail = helpers.getUserByEmail;
const generateRandomString = helpers.generateRandomString;
const getUserByID = helpers.getUserByID;
const bcrypt = require("bcryptjs");
const app = express();

const PORT = 8080;// default port 8080
app.use(cookieSession({
  name: 'session',
  keys: ["some value"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");//set EJS as the view engine

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

//Route to dislay URLs index page
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = getUserByID(userId, users);
  const templateVars = { urls: urlsForUser(userId), user};
  res.render("urls_index", templateVars);
});

//Route to display new URL creation page
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const user = getUserByID(userId, users);
  if (!user) { //if user is not logged in redirecting to login page
    return res.redirect("/login");
  }
  const templateVars = { user }; //if logged in then redirecting to urls_new page
  res.render("urls_new", templateVars);
});

//Route to display a specific URL
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
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

//Route to generate short URL
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(403).send("<p>You need to be logged in to shorten URLs.</p>");//IT is only working with curl
  }
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userId: userId };
  res.redirect(`/urls/${id}`);
});

//Route to handle  redirecting to the long URL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) { // Check if id exists in urlDatabase
    return res.status(404).send("URL does not exist");
  }
  
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//Route to display registration form
app.get("/register", (req,res) => {
  res.render("urls_register");
});

//post request to handle user registration
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
  let hashedPassword = bcrypt.hashSync(password, 10);
  //console.log(hashedPassword);
  users[id] = { id, email, hashedPassword };
  req.session.userId = id;
  res.redirect("/urls");
  
});

//Route to display login form
app.get("/login", (req,res) => {
  res.render("urls_login");
});

//Route to handle user login
app.post("/login", (req,res) => {
  if (req.body.email === "" || req.body.password === "") { //check if email or password were not provided
    return res.status(400).send("Email and password fields cannot be empty.");
  }
  const user = getUserByEmail(req.body.email, users);
  if (!user) {//check if user already exists or not
    return res.status(403).send("User not found, You need to register.");
  } else if (!bcrypt.compareSync(req.body.password, user.hashedPassword)) {
    return res.status(403).send("Incorrect Password.");
  }
  req.session.userId = user.id;
  res.redirect("/urls");
});



//post request for delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
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
  const userId = req.session.userId;
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


//post request to clear cookies and logout
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

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

//Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

