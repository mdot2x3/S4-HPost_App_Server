const { verify } = require("jsonwebtoken");

//Grab token sent through the frontend, validate with JWT Verify,
//if valid, continue with request and send to db
//if not, json response with error

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "importantsecret"); //validToken has username & id
    req.user = validToken;
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateToken };
