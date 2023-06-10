const answerKey = require("../model/AnswerKey");

const getAnswers = async (req, res) => {
  if (!req?.body?.qids)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  const answers = {};

  for (let i = 0; i < req.body.qids.length; i++) {
    const getAnswer = await answerKey.findOne({ qid: req.body.qids[i] });
    if (!getAnswer)
      return res.status(404).json({ message: "Some/ all questions not found" });
    answers[req.body.qids[i]] = getAnswer.answer;
  }
  res.status(200).json(answers);
};

module.exports = { getAnswers };
