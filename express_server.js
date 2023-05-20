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
  const id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: getUserByID(id, users)};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = { user: getUserByID(id, users)};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL does not exist");
  }
  const id = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: getUserByID(id, users)};
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

  if(getUserByEmail(req.body.email, users)) {//check if user already exists or not
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

  if(!getUserByEmail(req.body.email, users)) {//check if user already exists or not
    return res.status(403).send("User not found, You need to register.");
  } else if(!getUserByPassword(req.body.password, users)) {
    return res.status(403).send("Incorrect Password.");
  }

  let id = generateRandomString();
  let email = req.body.email; //storing the value of email field in object key email.
  let password = req.body.password;
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let string = (Math.random() + 1).toString(36).substring(6);
  return string;
};

const getUserByID = function(userid, users) {
  for(let id in users) {
    if (userid === users[id].id) {
      return users[id];
    }
  }
  return null;
};

const getUserByEmail = function(email, users) {
  for(const userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const getUserByPassword = function(password, users) {
  for(const userId in users) {
    if(users[userId].password=== password) {
      return users[userId];
    }
  }
  return null;
};
