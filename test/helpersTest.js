const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');
const { getUserByID } = require('../helpers.js');
const { generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined for non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});


describe('getUserByID', function() {
  it('should return a user with valid id', function() {
    const user = getUserByID("user2RandomID", testUsers);
    const expectedUserID = "user2RandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined for non-existent id', function() {
    const user = getUserByID("nonexistentID", testUsers);
    assert.isUndefined(user);
  });
});

describe('generateRandomString', function() {
  it('should return a random string of fixed length', function() {
    const length = 6;
    const randomString = generateRandomString(length);

    assert.isString(randomString);
    assert.lengthOf(randomString, length);
  });
});
