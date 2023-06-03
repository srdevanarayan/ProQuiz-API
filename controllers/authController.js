const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await User.findOne({ user: user }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  if (foundUser.status === "unverified")
    return res.status(401).json({ message: "User not verified." });
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs
    //console.log(process.env.RSA_PRIVATE_KEY.replace(/\\\\n/g, "\\n"));
    const accessToken = jwt.sign(
      {
        UserInfo: {
          user: foundUser.user,
          roles: roles,
        },
      },
      process.env.RSA_PRIVATE_KEY.replace(/\\n/gm, "\n"),
      { expiresIn: "3h", algorithm: "RS256" }
    );
    const refreshToken = jwt.sign(
      { user: foundUser.user },
      process.env.RSA_PRIVATE_KEY.replace(/\\n/gm, "\n"),
      { expiresIn: "3d", algorithm: "RS256" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    // console.log(result);
    // console.log(roles);

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      //secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
