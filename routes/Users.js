const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcryptjs");
const { validateToken } = require("../middleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");

//Register route (post request to create a user)
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json("SUCCESS");
  });
});

//Login route (login request)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //See if username already exists in db
  const user = await Users.findOne({ where: { username: username } });

  if (!user) res.json({ error: "User Doesn't Exist" });

  //Using bcrypt to compare if current password = stored password
  bcrypt.compare(password, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Username And Password Combination" });

    //Storing token on local storage, vulnerable to xss attacks
    //Token stores username and id, useful elsewhere (like Likes.js)
    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantsecret"
    );
    res.json({ token: accessToken, username: username, id: user.id });
    //res.json("YOU LOGGED IN");
  });
});

//(auth request)
//This endpoint checks to see if we are authenticated or not
//so someone doesn't use a fake token to access the features
//also get info about the user that can be used elsewhere (App.js useState)
router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

//(query basic info from the user)
router.get("/basicinfo/:id", async (req, res) => {
  const id = req.params.id; //grab this and pass in Profile.js { id }

  const basicInfo = await Users.findByPk(id, {
    //query from usertable, user with id = id
    attributes: { exclude: ["password"] }, //want to pass extra info to query--to exclude password from request
  });

  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  //Grab oldPassword from user input
  const { oldPassword, newPassword } = req.body;
  //Grab password from db
  const user = await Users.findOne({ where: { username: req.user.username } });
  //Use bcrypt again to compare the two passwords
  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Password Entered!" });

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash },
        { where: { username: req.user.username } }
      );
      res.json("SUCCESS");
    });
  });
});

module.exports = router;
