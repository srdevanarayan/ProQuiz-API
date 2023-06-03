const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, name, pwd } = req.body;
  if (!user || !pwd || !name)
    return res
      .status(400)
      .json({ message: "Username, name and password are required." });

  // check for duplicate usernames in the db
  const duplicate = await User.findOne({ user: user }).exec();
  if (duplicate) return res.sendStatus(409); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    //create and store the new user
    const result = await User.create({
      user: user,
      name: name,
      password: hashedPwd,
    });

    //console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
