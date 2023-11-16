const User = require("../../model/User");
const bcrypt = require("bcrypt");
const ROLES_LIST = require("../../config/roles_list");
const handleNewUser = async (req, res) => {
  const { user, name, pwd, role } = req.body;
  //check if required parameters are provided
  if (!user || !pwd || !name || !role) {
    return res
      .status(400)
      .json({ message: "Username, name, password and role are required." });
  }
  //check if a valid role is provided
  if (!ROLES_LIST[role]) {
    return res.status(400).json({ message: "Please provide a valid role." });
  }
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
      roles: ROLES_LIST[role],
    });

    //console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
