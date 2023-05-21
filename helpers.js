// Returns a user object by searching for a matching userId in the users database
const getUserByID = function(userId, users) {
  for (let id in users) {
    if (users[id].id === userId) {
      return users[id];
    }
  }
  return undefined;
};
// Returns a user object by searching for a matching email in the users database
const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

// Generates a random string of length 6 using alphanumeric characters
const generateRandomString = function() {
  let string = (Math.random() + 1).toString(36).substring(6);
  return string;
};

module.exports = {
  getUserByEmail,generateRandomString, getUserByID };