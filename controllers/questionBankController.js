const User = require("../model/User");
const QB = require("../model/questionBank");
const answerKey = require("../model/AnswerKey");
const mongoose = require("mongoose");
const isObjectEmpty = (objectName) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

const addQuestion = async (req, res) => {
  if (
    !req?.body?.category ||
    !req?.body?.subcategory ||
    !req?.body?.question ||
    !req?.body?.answer ||
    !req?.body?.options ||
    !req?.body?.difficulty
  )
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  if (req?.body?.options && req.body.options.length !== 4)
    return res.status(400).json({ message: "Please include 4 options" });
  if (
    req.body.difficulty !== "easy" &&
    req.body.difficulty !== "medium" &&
    req.body.difficulty !== "hard"
  )
    return res.status(400).json({ message: "Invalid difficulty level" });
  try {
    const result = await QB.create({
      category: req.body.category,
      subcategory: req.body.subcategory,
      creator: req.user,
      question: req.body.question,
      options: req.body.options,
      difficulty: req.body.difficulty,
    });
    await answerKey.create({
      qid: result._id,
      answer: req.body.answer,
    });
    res.status(201).json({ message: "Question added successfully" });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const rateQuestion = async (req, res) => {
  if (!req?.body?.rating || !req?.body?.qid)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  if (!req.body.qid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Question not found, invalid ID" });
  }
  const findQuestion = await QB.findOne({ _id: req.body.qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });

  const findUser = await User.findOne({ user: req.user }).exec();
  if (findUser.rated.includes(req.body.qid))
    return res
      .status(409)
      .json({ message: "You already rated this question!" });

  const avgRating = findQuestion.rating;
  const usersRated = findQuestion.usersrated;
  const aggregateRating = avgRating * usersRated;
  const newaggregateRating = aggregateRating + parseInt(req.body.rating);
  const updatedUsersRated = usersRated + 1;
  const newAvgRating = newaggregateRating / updatedUsersRated;
  findQuestion.rating = newAvgRating;
  findQuestion.usersrated = updatedUsersRated;
  await findQuestion.save();
  findUser.rated.push(req.body.qid);
  await findUser.save();
  res.status(200).json({ message: "Question rated successfully!" });
};

const removeQuestion = async (req, res) => {
  if (!req?.body?.qid)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  const qid = req.body.qid;
  if (!req.body.qid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Question not found, invalid ID" });
  }
  const findQuestion = await QB.findOne({ _id: qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  if (findQuestion.creator !== req.user)
    return res.status(403).json({
      message: "Cannot delete question since you are not the creator",
    });
  const findAnswerKey = await answerKey.findOne({ qid: qid }).exec();
  await findQuestion.deleteOne();
  await findAnswerKey.deleteOne();
  res.status(200).json({ message: "Question deleted successfully" });
};

const reportQuestion = async (req, res) => {
  if (!req?.body?.qid)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  const qid = req.body.qid;
  if (!req.body.qid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Question not found, invalid ID" });
  }
  const findQuestion = await QB.findOne({ _id: qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  const findUser = await User.findOne({ user: req.user }).exec();
  if (findUser.reported.includes(req.body.qid))
    return res
      .status(409)
      .json({ message: "You already reported this question!" });
  findQuestion.reported = findQuestion.reported + 1;
  await findQuestion.save();
  findUser.reported.push(req.body.qid);
  await findUser.save();
  res.status(200).json({ message: "Question reported successfully!" });
};
const verifyQuestion = async (req, res) => {
  if (!req?.body?.qid)
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  const qid = req.body.qid;
  if (!req.body.qid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Question not found, invalid ID" });
  }
  const findQuestion = await QB.findOne({ _id: qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  const findUser = await User.findOne({ user: req.user }).exec();
  if (findUser.verified.includes(req.body.qid))
    return res
      .status(409)
      .json({ message: "You already verified this question!" });
  findQuestion.verified = findQuestion.verified + 1;
  await findQuestion.save();
  findUser.verified.push(req.body.qid);
  await findUser.save();
  res.status(200).json({ message: "Question verified successfully!" });
};

const editQuestion = async (req, res) => {
  if (
    !(
      req?.body?.qid &&
      (req.body.options ||
        req.body.answer ||
        req.body.question ||
        req.body.category ||
        req.body.subcategory ||
        req.body.difficulty)
    )
  )
    return res
      .status(400)
      .json({ message: "Please include neccessary parameters" });
  if (req?.body?.options && req.body.options.length !== 4)
    return res.status(400).json({ message: "Please include 4 options" });

  const qid = req.body.qid;
  if (!req.body.qid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Question not found, invalid ID" });
  }
  const findQuestion = await QB.findOne({ _id: qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  if (findQuestion.creator !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of the question" });
  if (req.body?.question) findQuestion.question = req.body.question;
  if (req.body?.category) findQuestion.category = req.body.category;
  if (req.body?.subcategory) findQuestion.subcategory = req.body.subcategory;
  if (req.body?.options) findQuestion.options = req.body.options;
  if (req.body?.difficulty) {
    if (
      req.body.difficulty !== "easy" &&
      req.body.difficulty !== "medium" &&
      req.body.difficulty !== "hard"
    ) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    } else {
      findQuestion.difficulty = req.body.difficulty;
    }
  }
  if (req.body?.answer) {
    const findAnswerKey = await answerKey.findOne({ qid: qid }).exec();
    findAnswerKey.answer = req.body.answer;
    await findAnswerKey.save();
  }
  await findQuestion.save();
  res.status(200).json({ message: "Question edited successfully" });
};

const getQuestions = async (req, res) => {
  if (!req.body.pagesize || !req.body.pagenumber)
    return res
      .status(400)
      .json({ message: "Please include skip and limit for pagination" });
  const pageSize = Number(req.body.pagesize);
  const pageNumber = Number(req.body.pagenumber);
  let excludeArray = [];
  let includeArray = [];
  let filterArray = [];
  let matchObject = {};
  let sortObject = { rating: -1 };
  if (req.body?.category) matchObject.category = req.body.category;
  if (req.body?.subcategory) matchObject.subcategory = req.body.subcategory;
  if (req.body?.creator) matchObject.creator = req.body.creator;
  if (req.body?.difficulty) matchObject.difficulty = req.body.difficulty;
  if (req.body?.sortby) {
    if (req.body.sortby === "created") {
      sortObject = {};
      sortObject.createdAt = -1;
    }
    if (req.body.sortby === "verified") {
      sortObject = {};
      sortObject.verified = -1;
    }
  }
  if (req.body?.exclude) {
    req.body.exclude.forEach((element) => {
      excludeArray.push(mongoose.Types.ObjectId(element));
    });
    matchObject._id = { $nin: excludeArray };
  }
  if (req.body?.include) {
    req.body.include.forEach((element) => {
      includeArray.push(mongoose.Types.ObjectId(element));
    });
    matchObject._id = { $in: includeArray };
  }
  if (!isObjectEmpty(matchObject)) filterArray.push({ $match: matchObject });
  filterArray.push({ $sort: sortObject });
  filterArray.push(
    { $skip: pageSize * (pageNumber - 1) },
    { $limit: pageSize }
  );
  //console.log(filterArray);
  const result = await QB.aggregate(filterArray).exec();
  res.status(200).json(result);
};

const getCategories = async (req, res) => {
  const categories = await QB.distinct("category");
  res.status(200).json(categories);
};

const getSubCategories = async (req, res) => {
  if (!req.body.category)
    return res.status(400).json({ message: "Please include a category" });
  const subcategories = await QB.distinct("subcategory", {
    category: req.body.category,
  });
  res.status(200).json(subcategories);
};

module.exports = {
  addQuestion,
  rateQuestion,
  removeQuestion,
  reportQuestion,
  verifyQuestion,
  editQuestion,
  getQuestions,
  getCategories,
  getSubCategories,
};
