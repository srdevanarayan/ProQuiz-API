const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  //console.log(token);
  jwt.verify(
    token,
    process.env.RSA_PUBLIC_KEY.replace(/\\n/gm, "\n"),
    { algorithm: ["RS256"] },
    (err, decoded) => {
      if (err) return res.sendStatus(403); //invalid token
      req.user = decoded.UserInfo.user;
      req.roles = decoded.UserInfo.roles;
      next();
    }
  );
};

module.exports = verifyJWT;
