const User = require("../model/User");

const handleNameChange = async (req, res) => {
  if (!req.body.newname)
    return res.status(400).json({ message: "A name should be provided" });
  const foundUser = await User.findOne({ user: req.user }).exec();
  foundUser.name = req.body.newname;
  await foundUser.save();
  res.status(201).json({ message: "Name updated successfully" });
};

module.exports = { handleNameChange };
