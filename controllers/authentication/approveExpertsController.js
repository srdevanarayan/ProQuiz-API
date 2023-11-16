const User = require("../../model/User");

const approveExperts = async (req, res) => {
  if (!req.body.users)
    return res.status(400).json({ message: "User must be provided" });
  if (req.body.action !== "promote" && req.body.action !== "demote")
    return res.status(400).json({ message: "Please provide action" });
  const user = await User.findOne({ user: req.body.users }).exec();
  if (!user) {
    return res
      .status(404)
      .json({ message: `User ID ${req.body.users} not found` });
  }
  let msg;
  if (req.body.action === "promote") {
    user.roles.Expert = 1984;
    msg = "User promoted to expert";
  } else {
    user.roles.Expert = undefined;
    msg = "User demoted from expert";
  }
  await user.save();
  res.status(200).json({ message: msg });
};

module.exports = { approveExperts };
