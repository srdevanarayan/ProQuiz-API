const User = require("../model/User");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  //console.log(process.env.RSA_PUBLIC_KEY.replace(/\\n/gm, "\n"));
  jwt.verify(
    refreshToken,
    process.env.RSA_PUBLIC_KEY.replace(/\\n/gm, "\n"),
    { algorithm: ["RS256"] },
    (err, decoded) => {
      if (err || foundUser.user !== decoded.user) return res.sendStatus(403);
      const roles = Object.values(foundUser.roles);
      const user = Object.values(foundUser.user);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            user: decoded.user,
            roles: roles,
          },
        },
        process.env.RSA_PRIVATE_KEY.replace(/\\n/gm, "\n"),
        { expiresIn: "3h", algorithm: "RS256" }
      );
      res.json({ user, roles, accessToken });
    }
  );
};

module.exports = { handleRefreshToken };
