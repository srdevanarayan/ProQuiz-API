const getRoles = async (req, res) => {
  res.status(200).json({ message: req.roles });
};

module.exports = { getRoles };
