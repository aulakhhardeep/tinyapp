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

const generateRandomString = function() {
  let string = (Math.random() + 1).toString(36).substring(6);
  return string;
};




module.exports = {
  getUserByEmail,generateRandomString, getUserByID };