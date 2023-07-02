const question = require("../model/QuizQuestion");
const QuizAnswerKey = require("../model/QuizAnswerKey");
const answerKey = require("../model/AnswerKey");
const Quiz = require("../model/quiz");
const QB = require("../model/questionBank");
const User = require("../model/User");

const addQuestion = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const findQuiz = await Quiz.findOne({ _id: req.body.quizid }).exec();
  if (!findQuiz) return res.status(404).json({ message: "Quiz not found" });
  if (findQuiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (req?.body?.qbquestion && req.body.qbquestion === "true") {
    if (!req?.body?.qbqid)
      return res
        .status(400)
        .json({ message: "Please include question bank question id" });
    const findQbQuestion = await QB.findOne({ _id: req.body.qbqid }).exec();
    if (!findQbQuestion)
      return res
        .status(404)
        .json({ message: "Question bank question not found" });
    const findQbAnswerKey = await answerKey
      .findOne({ qid: req.body.qbqid })
      .exec();
    if (!findQbAnswerKey)
      return res
        .status(404)
        .json({ message: "Answer for question bank question not found" });
    const result = await question.create({
      question: findQbQuestion.question,
      options: findQbQuestion.options,
      quizid: findQuiz._id,
    });
    await QuizAnswerKey.create({
      qid: result._id,
      answer: findQbAnswerKey.answer,
      quizid: findQuiz._id,
    });
    findQuiz.questions.push(result._id);
    await findQuiz.save();
    return res.status(201).json({ qid: result._id });
  }
  if (!req?.body?.answer || !req?.body?.options || !req?.body?.question)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  if (req?.body?.options && req.body.options.length !== 4)
    return res.status(400).json({ message: "Please include 4 options" });
  try {
    const result = await question.create({
      question: req.body.question,
      quizid: findQuiz._id,
      options: req.body.options,
    });
    await QuizAnswerKey.create({
      qid: result._id,
      answer: req.body.answer,
      quizid: findQuiz._id,
    });
    findQuiz.questions.push(result._id);
    await findQuiz.save();
    res.status(201).json({ qid: result._id });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
const deleteQuestion = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const findQuiz = await Quiz.findOne({ _id: req.body.quizid }).exec();
  if (!findQuiz) return res.status(404).json({ message: "Quiz not found" });
  if (findQuiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (findQuiz.responses !== 0)
    return res.status(403).json({
      message:
        "You cannot delete the question since quiz already has responses.",
    });
  if (!req?.body?.qid) {
    return res.status(400).json({
      message: "Please include qid",
    });
  }
  const findQuestion = await question
    .findOne({ _id: req.body.qid, quizid: findQuiz._id })
    .exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  await question.deleteOne({ _id: req.body.qid, quizid: findQuiz._id });
  await QuizAnswerKey.deleteOne({ qid: req.body.qid, quizid: findQuiz._id });
  findQuiz.questions.pull(req.body.qid);
  await findQuiz.save();
  res.status(200).json("Question deleted successfully!");
};
const editQuestion = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const findQuiz = await Quiz.findOne({ _id: req.body.quizid }).exec();
  if (!findQuiz) return res.status(404).json({ message: "Quiz not found" });
  if (findQuiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (findQuiz.responses !== 0)
    return res.status(403).json({
      message: "You cannot edit the question since quiz already has responses.",
    });
  if (
    !(
      req?.body?.qid &&
      (req.body.options || req.body.answer || req.body.question)
    )
  ) {
    return res.status(400).json({
      message: "Please include qid and atleast one parameter to change",
    });
  }
  if (req?.body?.options && req.body.options.length !== 4)
    return res.status(400).json({ message: "Please include 4 options" });
  const findQuestion = await question
    .findOne({ _id: req.body.qid, quizid: findQuiz._id })
    .exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  if (req?.body?.question) findQuestion.question = req.body.question;
  if (req?.body?.options) findQuestion.options = req.body.options;
  await findQuestion.save();
  if (req?.body?.answer) {
    const findAnswer = await QuizAnswerKey.findOne({
      qid: findQuestion._id,
    }).exec();
    findAnswer.answer = req.body.answer;
    await findAnswer.save();
  }
  res.status(200).json("Question edited successfully!");
};

module.exports = { addQuestion, editQuestion, deleteQuestion };
