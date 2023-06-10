const User = require("../model/User");
const QB = require("../model/questionBank");

const getStats = async (req, res) => {
  if (
    !req.body.statsof ||
    (req.body.statsof !== "contributed" &&
      req.body.statsof !== "verified" &&
      req.body.statsof !== "userdetails")
  )
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  if (
    req.body.statsof === "userdetails" &&
    (!req.body.usernames ||
      !Array.isArray(req.body.usernames) ||
      req.body.usernames.length === 0)
  ) {
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  }
  if (req.body.statsof === "contributed") {
    const getUser = await User.find({ user: req.user }).exec();
    const questionsContributed = getUser[0].contributed.length;
    return res
      .status(200)
      .json({ "Questions Contributed": questionsContributed });
  }
  if (req.body.statsof === "verified") {
    const getUser = await User.find({ user: req.user }).exec();
    const questionsVerified = getUser[0].verified.length;
    return res.status(200).json({ "Questions Verified": questionsVerified });
  }
  if (req.body.statsof === "userdetails") {
    const userNames = req.body.usernames;
    let response = { users: [] };
    const findUsers = await User.find({ user: { $in: userNames } }).exec();
    for (let item in findUsers) {
      let user = findUsers[item];
      response.users.push({
        user: user.user,
        name: user.name,
      });
    }
    res.status(200).json(response);
  }
};

module.exports = { getStats };
