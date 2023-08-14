const User = require("../model/User");
const QuizCode = require("../model/quizCode");
const Quiz = require("../model/Quiz");
const QuizApproval = require("../model/QuizApprovallist");
const QuizQuestion = require("../model/QuizQuestion");
const QuizAnswerKey = require("../model/QuizAnswerKey");
const Response = require("../model/Response");
const QB = require("../model/questionBank");
const QBQuestionHistory = require("../model/QBQuestionHistory");
const mongoose = require("mongoose");
const question = require("../model/QuizQuestion");
const answerKey = require("../model/AnswerKey");

const createQuiz = async (req, res) => {
  if (!req?.body?.name)
    return res.status(400).json({ message: "Please include name" });
  const codeDocument = await QuizCode.findOne().exec();
  let uniqueCode = codeDocument.code;
  const characters = req.body.name.slice(0, 3);
  uniqueCode = characters + uniqueCode;
  codeDocument.code = codeDocument.code + 1;
  await codeDocument.save();
  let quizCreated;
  try {
    quizCreated = await Quiz.create({
      name: req.body.name,
      code: uniqueCode,
      quizmaker: req.user,
    });
    await QuizApproval.create({
      quizid: quizCreated._id,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
  const findUser = await User.findOne({ user: req.user });
  findUser.customquizcreated.push(quizCreated._id);
  await findUser.save();
  if (req?.body?.approvalrequired === "false")
    quizCreated.approvalrequired = "false";
  if (req?.body?.timer && isNaN(req.body.timer) === true)
    return res.status(400).json({ message: "Timer value is not a number" });
  if (req?.body?.timer && isNaN(req.body.timer) === false)
    quizCreated.timer = req.body.timer;
  await quizCreated.save();
  res.status(201).json({ quizid: quizCreated._id });
};

const editQuiz = async (req, res) => {
  const { name, timer, approvalrequired } = req.body;
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!name && !timer && !approvalrequired) {
    return res.status(400).json({ message: "No properties to change" });
  }
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (quiz.type === "general")
    return res.status(401).json({ message: "You cannot edit a general quiz!" });
  if (quiz.status !== "new")
    return res
      .status(401)
      .json({ message: "You cannot edit an already conducted quiz!" });
  if (name) {
    quiz.name = name;
    quiz.code = name.slice(0, 3) + quiz.code.slice(3);
  }
  if (timer) {
    if (isNaN(timer)) {
      return res.status(400).json({ message: "Timer value is not a number" });
    }
    quiz.timer = timer;
  }
  if (approvalrequired !== undefined) {
    if (quiz.approvalrequired !== approvalrequired) {
      if (approvalrequired !== true && approvalrequired !== false) {
        return res
          .status(400)
          .json({ message: "Approval required value is not a boolean" });
      }
      quiz.approvalrequired = approvalrequired;
      if (approvalrequired === "true") {
        await QuizApproval.create({
          quizid: quizid,
        });
      }
      if (approvalrequired === "false") {
        await QuizApproval.deleteOne({ quizid: quizid });
      }
    }
  }
  await quiz.save();
  return res.status(200).json({ message: "Quiz updated successfully" });
};

const deleteQuiz = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  const findUser = await User.findOne({ user: req.user });
  if (findUser.customquizcreated.includes(quiz._id)) {
    findUser.customquizcreated.pull(quiz._id);
    await findUser.save();
  } else if (findUser.generalquizcreated.includes(quiz._id)) {
    findUser.generalquizcreated.pull(quiz._id);
    await findUser.save();
  } else {
    return res.status(404).json({ message: "Quiz not found in user array" });
  }
  await QuizQuestion.deleteMany({ quizid: quizid });
  await QuizAnswerKey.deleteMany({ quizid: quizid });
  await Response.deleteMany({ quizid: quizid });
  await Quiz.deleteOne({ _id: quiz._id });
  await QuizApproval.deleteOne({ quizid: quizid });
  const filter = {
    $or: [
      { customquizanswered: quizid },
      { generalquizanswered: quizid },
      { quiztobecompleted: quizid },
    ],
  };
  const update = {
    $pull: {
      customquizanswered: quizid,
      generalquizanswered: quizid,
      quiztobecompleted: quizid,
    },
  };
  const options = { multi: true };

  try {
    await User.updateMany(filter, update, options);
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({ message: "Quiz deleted successfully" });
};

const copyQuiz = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (quiz.type === "general")
    return res
      .status(401)
      .json({ message: "You cannot copy a general quiz! Try retaking it" });
  const codeDocument = await QuizCode.findOne().exec();
  let uniqueCode = codeDocument.code;
  const characters = quiz.name.slice(0, 3);
  uniqueCode = characters + uniqueCode;
  codeDocument.code = codeDocument.code + 1;
  await codeDocument.save();
  let quizCreated;
  let questionsarray = [];
  try {
    quizCreated = await Quiz.create({
      name: quiz.name,
      code: uniqueCode,
      quizmaker: req.user,
      type: quiz.type,
      timer: quiz.timer,
      approvalrequired: quiz.approvalrequired,
    });
    const getQuestions = await QuizQuestion.find({ quizid: quizid });
    for (const doc of getQuestions) {
      const newQuestion = await QuizQuestion.create({
        question: doc.question,
        quizid: quizCreated._id,
        options: doc.options,
      });
      const findAnswer = await QuizAnswerKey.findOne({ qid: doc._id });
      await QuizAnswerKey.create({
        qid: newQuestion._id,
        quizid: quizCreated._id,
        answer: findAnswer.answer,
      });
      questionsarray.push(newQuestion._id);
    }
    quizCreated.questions = questionsarray;
    await quizCreated.save();
    await QuizApproval.create({
      quizid: quizCreated._id,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
  const findUser = await User.findOne({ user: req.user });
  findUser.customquizcreated.push(quizCreated._id);
  await findUser.save();
  res
    .status(201)
    .json({ message: `Quiz copied successfully with code: ${uniqueCode} ` });
};

const startQuiz = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (quiz.status === "started")
    return res.status(409).json({ message: "Quiz already started" });
  quiz.status = "started";
  await quiz.save();
  res.status(200).json({ message: "Quiz started" });
};
const endQuiz = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (quiz.status === "ended")
    return res.status(409).json({ message: "Quiz already ended" });
  quiz.status = "ended";
  await quiz.save();
  const filter = {
    $or: [{ quiztobecompleted: quizid }],
  };
  const update = {
    $pull: {
      quiztobecompleted: quizid,
    },
  };
  const options = { multi: true };

  try {
    await User.updateMany(filter, update, options);
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({ message: "Quiz ended" });
};

const manageParticipants = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  if (!req.body.status) {
    if (!req?.body?.userlist)
      return res
        .status(400)
        .json({ message: "Please provide users to approve" });
    const findAllUsers = await User.find({ user: { $in: req.body.userlist } });
    if (
      !findAllUsers ||
      !Array.isArray(findAllUsers) ||
      findAllUsers.length !== req.body.userlist.length
    )
      return res.status(404).json({ message: "User/s not found" });
    if (
      !req.body.action ||
      !["approve", "block", "unblock"].includes(req.body.action)
    )
      return res.status(400).json({ message: "Please provide valid action" });
  }
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (quiz.quizmaker !== req.user)
    return res
      .status(401)
      .json({ message: "You are not the creator of this quiz!" });
  if (quiz.type === "general")
    return res
      .status(401)
      .json({ message: "You cannot approve for a general quiz!" });
  if (quiz.approvalrequired === "false")
    return res
      .status(401)
      .json({ message: "Approval is not required for this quiz!" });
  const findApprovalList = await QuizApproval.findOne({ quizid: quizid });
  let changeExists = false;
  if (req.body.status && req.body.status === "close") {
    findApprovalList.status = "closed";
    await findApprovalList.save();
    return res.status(200).json({ message: "Approval requests are closed." });
  }
  if (req.body.status && req.body.status === "open") {
    findApprovalList.status = "open";
    await findApprovalList.save();
    return res.status(200).json({ message: "Approval requests are opened." });
  }

  if (req?.body?.action === "approve") {
    for (let index in req.body.userlist) {
      let item = req.body.userlist[index];
      if (findApprovalList.requested.includes(item)) {
        findApprovalList.approved.push(item);
        findApprovalList.requested.pull(item);
        changeExists = true;
        const findUser = await User.findOne({ user: item }).exec();
        findUser.quiztobecompleted.push(quizid);
        await findUser.save();
        quiz.participants = quiz.participants + 1;
        await quiz.save();
      }
    }
    await findApprovalList.save();
  }
  if (req?.body?.action === "block") {
    for (let index in req.body.userlist) {
      let item = req.body.userlist[index];
      if (findApprovalList.requested.includes(item)) {
        findApprovalList.blocked.push(item);
        findApprovalList.requested.pull(item);
        changeExists = true;
      } else if (findApprovalList.approved.includes(item)) {
        findApprovalList.blocked.push(item);
        findApprovalList.approved.pull(item);
        const findUser = await User.findOne({ user: item }).exec();
        findUser.quiztobecompleted.pull(quizid);
        await findUser.save();
        quiz.participants = quiz.participants - 1;
        await quiz.save();
        changeExists = true;
      }
    }
    await findApprovalList.save();
  }
  if (req?.body?.action === "unblock") {
    for (let index in req.body.userlist) {
      let item = req.body.userlist[index];
      if (findApprovalList.blocked.includes(item)) {
        findApprovalList.approved.push(item);
        findApprovalList.blocked.pull(item);
        changeExists = true;
        const findUser = await User.findOne({ user: item }).exec();
        findUser.quiztobecompleted.push(quizid);
        await findUser.save();
        quiz.participants = quiz.participants + 1;
        await quiz.save();
      }
    }
    await findApprovalList.save();
  }
  if (changeExists)
    res
      .status(201)
      .json({ message: `Users ${req?.body?.action}ed successfully` });
  else
    res.status(400).json({ message: `No users found to ${req?.body?.action}` });
};

const requestApproval = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const quiz = await Quiz.findById(quizid);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  console.log(quiz.approvalrequired);
  const findUser = await User.findOne({ user: req.user });
  if (findUser.customquizanswered.includes(quizid))
    return res
      .status(400)
      .json({ message: "You already participated in this quiz" });
  if (quiz.type === "general")
    return res
      .status(401)
      .json({ message: "You cannot request approval for a general quiz!" });
  if (quiz.quizmaker === req.user)
    return res
      .status(400)
      .json({ message: "You cannot request approval for your own quiz!" });
  if (quiz.approvalrequired === false) {
    findUser.quiztobecompleted.push(quizid);
    await findUser.save();
    return res.status(200).json({ message: "Quiz added to pending list" });
  }
  const findApprovalList = await QuizApproval.findOne({ quizid: quizid });
  if (findApprovalList.status === "closed")
    return res
      .status(401)
      .json({ message: "This quiz doesn't accept approval requests." });
  if (findApprovalList.requested.includes(req.user))
    return res
      .status(409)
      .json({ message: "You have already requested approval for this quiz" });
  if (findApprovalList.approved.includes(req.user))
    return res
      .status(409)
      .json({ message: "You are already approved for this quiz" });
  if (findApprovalList.blocked.includes(req.user))
    return res.status(401).json({
      message:
        "You are blocked by the quiz maker. You cannot request for approval.",
    });
  findApprovalList.requested.push(req.user);
  await findApprovalList.save();
  res
    .status(200)
    .json({ message: "Successfully requested approval for the quiz" });
};

const getQuizInfo = async (req, res) => {
  if (!req?.body?.option || !req?.body?.pagesize || !req?.body?.pagenumber)
    return res.status(400).json({
      message: "Please include valid option, pagesize and page number",
    });
  const pagesize = req.body.pagesize;
  const pagenumber = req.body.pagenumber;
  if (
    req.body.option !== "customquizanswered" &&
    req.body.option !== "generalquizanswered" &&
    req.body.option !== "generalquizcreated" &&
    req.body.option !== "quiztobecompleted" &&
    req.body.option !== "customquizcreated"
  )
    return res.status(400).json({ message: "Please include valid option" });
  if (isNaN(req.body.pagesize) || isNaN(req.body.pagenumber))
    return res
      .status(400)
      .json({ message: "Pagenumber/ pagesize is not a number" });
  const findUser = await User.findOne({ user: req.user }).exec();
  if (req.body.option === "customquizcreated") {
    let findQuizIds = findUser.customquizcreated;
    findQuizIds.reverse();
    /* const startIndex = (pagenumber - 1) * pagesize;
    const endIndex = pagenumber * pagesize;
    let slicedArray = findQuizIds.slice(startIndex, endIndex);
    findQuizIds = slicedArray; */
    if (Array.isArray(findQuizIds) && findQuizIds.length === 0)
      return res
        .status(404)
        .json({ message: "No custom quiz created by the user" });
    let response = { quizzes: [] };
    for (let item in findQuizIds) {
      let quizid = findQuizIds[item];
      const findQuiz = await Quiz.find({ _id: quizid }).exec();
      findQuiz.forEach((quiz) => {
        response.quizzes.push({
          quizid: quiz._id,
          code: quiz.code,
          type: quiz.type,
          name: quiz.name,
          status: quiz.status,
          participants: quiz.participants,
          responses: quiz.responses,
          approvalrequired: quiz.approvalrequired,
          createdAt: quiz.createdAt,
        });
      });
    }
    return res.status(200).json(response);
  }
  if (req.body.option === "generalquizcreated") {
    let findQuizIds = findUser.generalquizcreated;
    findQuizIds.reverse();
    const startIndex = (pagenumber - 1) * pagesize;
    const endIndex = pagenumber * pagesize;
    let slicedArray = findQuizIds.slice(startIndex, endIndex);
    findQuizIds = slicedArray;
    if (Array.isArray(findQuizIds) && findQuizIds.length === 0)
      return res
        .status(404)
        .json({ message: "No general quiz created by the user" });
    let response = { quizzes: [] };
    for (let item in findQuizIds) {
      let quizid = findQuizIds[item];
      const findQuiz = await Quiz.findOne({ _id: quizid }).exec();
      findQuiz.forEach((quiz) => {
        response.quizzes.push({
          quizid: quiz._id,
          code: quiz.code,
          type: quiz.type,
          name: quiz.name,
          status: quiz.status,
          createdAt: quiz.createdAt,
          approvalrequired: quiz.approvalrequired,
        });
      });
    }
    return res.status(200).json(response);
  }
  if (req.body.option === "quiztobecompleted") {
    let findQuizIds = findUser.quiztobecompleted;
    findQuizIds.reverse();
    const startIndex = (pagenumber - 1) * pagesize;
    const endIndex = pagenumber * pagesize;
    let slicedArray = findQuizIds.slice(startIndex, endIndex);
    findQuizIds = slicedArray;
    if (Array.isArray(findQuizIds) && findQuizIds.length === 0)
      return res
        .status(404)
        .json({ message: "No quiz to be completed by the user" });
    let response = { quizzes: [] };
    for (let item in findQuizIds) {
      let quizid = findQuizIds[item];
      const findQuiz = await Quiz.find({ _id: quizid }).exec();
      findQuiz.forEach((quiz) => {
        response.quizzes.push({
          quizid: quiz._id,
          code: quiz.code,
          type: quiz.type,
          name: quiz.name,
          status: quiz.status,
          createdAt: quiz.createdAt,
        });
      });
    }
    return res.status(200).json(response);
  }
  if (req.body.option === "generalquizanswered") {
    let findQuizIds = findUser.generalquizanswered;
    findQuizIds.reverse();
    const startIndex = (pagenumber - 1) * pagesize;
    const endIndex = pagenumber * pagesize;
    let slicedArray = findQuizIds.slice(startIndex, endIndex);
    findQuizIds = slicedArray;
    if (Array.isArray(findQuizIds) && findQuizIds.length === 0)
      return res
        .status(404)
        .json({ message: "No general quiz answered by the user" });
    let response = { quizzes: [] };
    for (let item in findQuizIds) {
      let quizid = findQuizIds[item];
      const findQuiz = await Quiz.find({ _id: quizid }).exec();
      findQuiz.forEach((quiz) => {
        response.quizzes.push({
          quizid: quiz._id,
          code: quiz.code,
          type: quiz.type,
          name: quiz.name,
          status: quiz.status,
          createdAt: quiz.createdAt,
        });
      });
    }
    return res.status(200).json(response);
  }
  if (req.body.option === "customquizanswered") {
    let findQuizIds = findUser.customquizanswered;
    findQuizIds.reverse();
    const startIndex = (pagenumber - 1) * pagesize;
    const endIndex = pagenumber * pagesize;
    let slicedArray = findQuizIds.slice(startIndex, endIndex);
    findQuizIds = slicedArray;
    if (Array.isArray(findQuizIds) && findQuizIds.length === 0)
      return res
        .status(404)
        .json({ message: "No custom quiz answered by the user" });
    let response = { quizzes: [] };
    for (let item in findQuizIds) {
      let quizid = findQuizIds[item];
      const findQuiz = await Quiz.find({ _id: quizid }).exec();
      findQuiz.forEach((quiz) => {
        response.quizzes.push({
          quizid: quiz._id,
          code: quiz.code,
          type: quiz.type,
          name: quiz.name,
          status: quiz.status,
          createdAt: quiz.createdAt,
        });
      });
    }
    return res.status(200).json(response);
  }
};

const getQuizQuestions = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (findQuiz.quizmaker === req.user && findQuiz.type === "custom")
    return res
      .status(403)
      .json({ message: "You cannot participate in your own quiz!" });
  const findUser = await User.findOne({ user: req.user });
  if (!findUser.quiztobecompleted.includes(quizid))
    return res
      .status(403)
      .json({ message: "You cannot participate in this quiz" });
  if (findUser.generalquizanswered.includes(quizid))
    return res
      .status(403)
      .json({ message: "You already participated in this general quiz!" });
  if (findQuiz.approvalrequired === "true") {
    const findQuizApproval = await QuizApproval.findOne({
      quizid: quizid,
    }).exec();
    if (
      findQuiz.type === "custom" &&
      !findQuizApproval.approved.includes(req.user)
    )
      return res
        .status(403)
        .json({ message: "You cannot participate in this quiz" });
  }
  if (findQuiz.status === "new")
    return res.status(403).json({ message: "Quiz has not started yet." });
  if (findQuiz.status === "ended")
    return res.status(403).json({ message: "Quiz ended." });
  /* const findQuiz = await Quiz.findOne({ _id: quizid }); */
  let response = { timer: findQuiz.timer, questions: [] };
  let questionIds = findQuiz.questions;
  questionIds.sort(() => Math.random() - 0.5);
  for (let index in questionIds) {
    let item = questionIds[index];
    const getQuestion = await QuizQuestion.findOne({ _id: item }).exec();
    response.questions.push({
      qid: getQuestion._id,
      question: getQuestion.question,
      options: getQuestion.options,
      quizid: getQuestion.quizid,
    });
  }
  const findDuplicate = await Response.findOne({
    quizid: quizid,
    quiztaker: req.user,
  });
  if (!findDuplicate) {
    const getResponseDoc = await Response.create({
      quizid: quizid,
      quiztaker: req.user,
    });
    findQuiz.responsesarray.push(req.user);
    await findQuiz.save();
  }
  res.status(201).json(response);
};

const getQuizQuestionsAndAnswers = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (findQuiz.quizmaker !== req.user)
    return res
      .status(403)
      .json({ message: "You are not the creator of this quiz" });
  let response = {
    quizid: findQuiz._id,
    code: findQuiz.code,
    type: findQuiz.type,
    name: findQuiz.name,
    timer: findQuiz.timer,
    status: findQuiz.status,
    participants: findQuiz.participants,
    responses: findQuiz.responses,
    approvalrequired: findQuiz.approvalrequired,
    createdAt: findQuiz.createdAt,
    questions: [],
  };
  const qidArray = findQuiz.questions;
  const findQuestions = await QuizQuestion.find({ _id: { $in: qidArray } });
  for (const question of findQuestions) {
    const findAnswer = await QuizAnswerKey.findOne({
      qid: question._id,
    }).exec();
    response.questions.push({
      qid: question._id,
      question: question.question,
      options: question.options,
      answer: findAnswer.answer,
    });
  }
  res.status(200).json(response);
};

const getQuizFromCode = async (req, res) => {
  if (!req.body.quizcode)
    return res.status(400).json({ message: "Quiz code missing" });
  const findQuiz = await Quiz.findOne({ code: req.body.quizcode }).exec();
  if (!findQuiz) return res.status(404).json({ message: "Quiz not found" });
  if (findQuiz.type === "general")
    return res.status(401).json({ message: "This quiz is a general quiz." });
  let response = {
    quizid: findQuiz._id,
    name: findQuiz.name,
    quizmaker: findQuiz.quizmaker,
    code: req.body.quizcode,
    approvalrequired: findQuiz.approvalrequired,
  };
  res.status(200).json(response);
};

const initializeQuizSession = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  //console.log(findQuiz.quizmaker);
  if (findQuiz.quizmaker === req.user && findQuiz.type === "custom")
    return res
      .status(403)
      .json({ message: "You cannot participate in your own quiz!" });
  const findUser = await User.findOne({ user: req.user });
  if (!findUser.quiztobecompleted.includes(quizid))
    return res
      .status(403)
      .json({ message: "You cannot participate in this quiz" });
  if (findUser.generalquizanswered.includes(quizid))
    return res
      .status(403)
      .json({ message: "You already participated in this general quiz!" });
  if (findQuiz.approvalrequired === "true") {
    const findQuizApproval = await QuizApproval.findOne({
      quizid: quizid,
    }).exec();
    if (
      findQuiz.type === "custom" &&
      !findQuizApproval.approved.includes(req.user)
    )
      return res
        .status(403)
        .json({ message: "You cannot participate in this quiz" });
    findQuizApproval.approved.pull(req.user);
    await findQuizApproval.save();
  }
  if (findQuiz.status === "new")
    return res.status(403).json({ message: "Quiz has not started yet." });
  if (findQuiz.status === "ended")
    return res.status(403).json({ message: "Quiz ended." });
  const findResponse = await Response.findOne({
    quizid: quizid,
    quiztaker: req.user,
  });
  if (!findResponse)
    return res.status(404).json({ message: "Response object not found" });
  findUser.quiztobecompleted.pull(quizid);
  if (findQuiz.type === "custom") findUser.customquizanswered.push(quizid);
  else if (findQuiz.type === "general")
    findUser.generalquizanswered.push(quizid);
  await findUser.save();
  findResponse.starttime = Date();
  await findResponse.save();
  findQuiz.responsesarray.push(req.user);
  findQuiz.responses = findQuiz.responses + 1;
  await findQuiz.save();
  res.status(200).json({ message: "Quiz initialized" });
};

const submitAnswer = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (!req.body.qid || !req.body.answer)
    return res
      .status(400)
      .json({ message: "Please include question id and answer" });
  const qid = req.body.qid;
  if (findQuiz.status === "ended")
    return res.status(403).json({ message: "Quiz ended by the quizmaker" });
  if (findQuiz.status === "new")
    return res
      .status(403)
      .json({ message: "Quiz not yet started by the quizmaker" });
  const findQuestion = await QuizQuestion.findOne({ _id: qid }).exec();
  if (!findQuestion)
    return res.status(404).json({ message: "Question not found" });
  const findResponse = await Response.findOne({
    quizid: quizid,
    quiztaker: req.user,
  }).exec();
  if (!findQuiz.questions.includes(qid))
    return res
      .status(403)
      .json({ message: "Question does not belong the quiz" });
  if (!findResponse)
    return res.status(404).json({ message: "Response document not found" });
  if (!findResponse.starttime) {
    const findUser = await User.findOne({ user: req.user });
    if (findQuiz.approvalrequired === "true") {
      const findQuizApproval = await QuizApproval.findOne({
        quizid: quizid,
      }).exec();
      if (findQuizApproval) {
        findQuizApproval.approved.pull(req.user);
        await findQuizApproval.save();
      }
    }

    findUser.quiztobecompleted.pull(quizid);
    if (findQuiz.type === "custom") findUser.customquizanswered.push(quizid);
    else if (findQuiz.type === "general")
      findUser.generalquizanswered.push(quizid);
    await findUser.save();
    findResponse.starttime = Date();
    await findResponse.save();
    findQuiz.responsesarray.push(req.user);
    findQuiz.responses = findQuiz.responses + 1;
    findQuiz.participants = findQuiz.participants + 1;
    await findQuiz.save();
  }
  /* if (findQuiz.timer) {
    const date1 = new Date();
    const date2 = new Date(findResponse.starttime);
    const differenceInMilliseconds = date1.getTime() - date2.getTime();
    const differenceInSeconds = differenceInMilliseconds / 1000 + 30;
    if (differenceInSeconds > findQuiz.timer)
      return res.status(403).json({ message: "Quiz time is over" });
    console.log(differenceInSeconds);
  } */
  if (findResponse.responses && findResponse.responses.get(qid))
    return res.status(400).json({ message: "Question already answered" });
  findResponse.responses.set(qid, req.body.answer);
  await findResponse.save();
  res.status(201).json({ message: "Answer submitted successfully" });
};

const getResponses = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (!req.body.user)
    return res.status(400).json({ message: "Please include user" });
  if (findQuiz.quizmaker !== req.user && req.body.user !== req.user)
    return res.status(403).json({
      message: "You do not have permission to view other participants' answers",
    });
  const findResponse = await Response.findOne({
    quiztaker: req.body.user,
    quizid: req.body.quizid,
  }).exec();
  if (!findResponse)
    return res.status(404).json({ message: "Response not found" });
  const findQuestions = await QuizQuestion.find({
    _id: { $in: findQuiz.questions },
  }).exec();
  if (findResponse.score === -99) {
    findResponse.score = 0;
    for (const question of findQuestions) {
      const findAnswer = await QuizAnswerKey.findOne({
        qid: question._id,
        quizid: req.body.quizid,
      });
      if (findAnswer.answer === findResponse.responses.get(question._id))
        findResponse.score = findResponse.score + 1;
    }
    await findResponse.save();
  }

  let response = { score: findResponse.score, questions: [] };
  for (const question of findQuestions) {
    const findAnswer = await QuizAnswerKey.findOne({
      qid: question._id,
      quizid: req.body.quizid,
    });
    response.questions.push({
      question: question.question,
      options: question.options,
      answer: findAnswer.answer,
      useranswer: findResponse.responses.get(question._id),
    });
  }
  res.status(200).json(response);
};

const getParticipants = async (req, res) => {
  if (!req?.body?.quizid)
    return res.status(400).json({ message: "Please include quiz id" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (findQuiz.quizmaker !== req.user)
    return res
      .status(403)
      .json({ message: "You are not the creator of this quiz" });
  if (
    !req.body.userclass ||
    !["requested", "approved", "blocked", "responded"].includes(
      req.body.userclass
    )
  )
    return res
      .status(400)
      .json({ message: "Please specify what users to fetch" });
  let response = { users: [] };
  if (req.body.userclass === "responded") {
    const findRespondedUsers = [...new Set(findQuiz.responsesarray)];

    if (findRespondedUsers.length === 0)
      return res.status(404).json({ message: "No responded users found" });
    for (const user of findRespondedUsers) {
      let score = 0;
      const foundUser = await User.findOne({ user: user });
      const findResponse = await Response.findOne({
        quiztaker: user,
        quizid: quizid,
      }).exec();
      if (!findResponse)
        return res.status(404).json({ message: "Response not found" });
      const findQuestions = await QuizQuestion.find({
        _id: { $in: findQuiz.questions },
      }).exec();
      score = findResponse.score;
      if (findResponse.score === -99) {
        for (const question of findQuestions) {
          const findAnswer = await QuizAnswerKey.findOne({
            qid: question._id,
            quizid: quizid,
          });
          score = 0;
          if (findAnswer.answer === findResponse.responses.get(question._id))
            score = score + 1;
        }
      }

      response.users.push({
        user: user,
        name: foundUser.name,
        score: score,
      });
    }

    return res.status(200).json(response);
  }
  const findApproval = await QuizApproval.findOne({ quizid: quizid });
  if (req.body.userclass === "requested") {
    const findRequestedUsers = findApproval.requested;
    if (findRequestedUsers.length === 0)
      return res.status(404).json({ message: "No requested users found" });
    for (const user of findRequestedUsers) {
      const foundUser = await User.findOne({ user: user });
      response.users.push({
        user: user,
        name: foundUser.name,
      });
    }
    response.approval = findApproval.status;
    return res.status(200).json(response);
  }

  if (req.body.userclass === "approved") {
    const findApprovedUsers = findApproval.approved;
    if (findApprovedUsers.length === 0)
      return res.status(404).json({ message: "No Approved users found" });
    for (const user of findApprovedUsers) {
      const foundUser = await User.findOne({ user: user });
      response.users.push({
        user: user,
        name: foundUser.name,
      });
    }
    response.approval = findApproval.status;
    return res.status(200).json(response);
  }
  if (req.body.userclass === "blocked") {
    const findBlockedUsers = findApproval.blocked;
    if (findBlockedUsers.length === 0)
      return res.status(404).json({ message: "No Blocked users found" });
    for (const user of findBlockedUsers) {
      const foundUser = await User.findOne({ user: user });
      response.users.push({
        user: user,
        name: foundUser.name,
      });
    }
    response.approval = findApproval.status;
    return res.status(200).json(response);
  }
};

const createGeneralQuiz = async (req, res) => {
  if (
    !req.body.name ||
    !req.body.sortby ||
    !req.body.avoidduplicate ||
    !req.body.category ||
    !req.body.subcategory ||
    !req.body.minimum ||
    (!req.body.easy && !req.body.medium && !req.body.hard)
  ) {
    return res
      .status(400)
      .json({ message: "Please include necessary parameters" });
  }
  if (req.body.timer && isNaN(req.body.timer))
    return res.status(400).json({ message: "Timer value is not a number" });
  let finalQids = [];
  let easy, medium, hard;
  const category = req.body.category;
  const subcategory = req.body.subcategory;
  const easykey = category + "|" + subcategory + "|" + "easy";
  const mediumkey = category + "|" + subcategory + "|" + "medium";
  const hardkey = category + "|" + subcategory + "|" + "hard";
  const sortby = req.body.sortby;
  const history = await QBQuestionHistory.findOne({ quiztaker: req.user });
  if (!history) {
    const history = await QBQuestionHistory.create({ quiztaker: req.user });
  }
  if (!isNaN(req.body.easy) && req.body.easy !== "0") {
    let objectIds = [];
    if (req.body.avoidduplicate === "true") {
      const findHistory = await QBQuestionHistory.findOne({
        quiztaker: req.user,
      });
      avoidQids = findHistory?.qidhistory?.get(easykey);
      if (avoidQids)
        objectIds = avoidQids.map((id) => mongoose.Types.ObjectId(id));
    }

    const easyQuestions = await QB.aggregate([
      {
        $match: {
          category: category,
          subcategory: subcategory,
          difficulty: "easy",
          _id: { $nin: objectIds },
        },
      },
      { $sort: { [sortby]: -1 } },
      { $limit: parseInt(req.body.easy) },
    ]);
    if (easyQuestions) {
      const easyQids = easyQuestions.map((question) => question._id);
      easy = easyQids.length;
      finalQids.push(...easyQids);
      await QBQuestionHistory.updateOne(
        { quiztaker: req.user },
        { $addToSet: { [`qidhistory.${easykey}`]: easyQids } }
      );
    }
  }
  if (!isNaN(req.body.medium) && req.body.medium !== "0") {
    let objectIds = [];
    if (req.body.avoidduplicate === "true") {
      const findHistory = await QBQuestionHistory.findOne({
        quiztaker: req.user,
      });
      avoidQids = findHistory?.qidhistory?.get(mediumkey);
      if (avoidQids)
        objectIds = avoidQids.map((id) => mongoose.Types.ObjectId(id));
    }

    const mediumQuestions = await QB.aggregate([
      {
        $match: {
          category: category,
          subcategory: subcategory,
          difficulty: "medium",
          _id: { $nin: objectIds },
        },
      },
      { $sort: { [sortby]: -1 } },
      { $limit: parseInt(req.body.medium) },
    ]);
    if (mediumQuestions) {
      const mediumQids = mediumQuestions.map((question) => question._id);
      medium = mediumQids.length;
      finalQids.push(...mediumQids);
      await QBQuestionHistory.updateOne(
        { quiztaker: req.user },
        { $addToSet: { [`qidhistory.${mediumkey}`]: mediumQids } }
      );
    }
  }
  if (!isNaN(req.body.hard) && req.body.hard !== "0") {
    let objectIds = [];
    if (req.body.avoidduplicate === "true") {
      const findHistory = await QBQuestionHistory.findOne({
        quiztaker: req.user,
      });
      avoidQids = findHistory?.qidhistory?.get(hardkey);
      if (avoidQids)
        objectIds = avoidQids.map((id) => mongoose.Types.ObjectId(id));
    }

    const hardQuestions = await QB.aggregate([
      {
        $match: {
          category: category,
          subcategory: subcategory,
          difficulty: "hard",
          _id: { $nin: objectIds },
        },
      },
      { $sort: { [sortby]: -1 } },
      { $limit: parseInt(req.body.hard) },
    ]);
    if (hardQuestions) {
      const hardQids = hardQuestions.map((question) => question._id);
      hard = hardQids.length;
      finalQids.push(...hardQids);
      await QBQuestionHistory.updateOne(
        { quiztaker: req.user },
        { $addToSet: { [`qidhistory.${hardkey}`]: hardQids } }
      );
    }
  }
  if (finalQids.length < parseInt(req.body.minimum))
    return res.status(404).json({
      message: `Not enough questions above minimum limit. Easy:${easy}. Medium:${medium}. Hard:${hard}.`,
    });
  finalQids.sort(() => Math.random() - 0.5);
  const codeDocument = await QuizCode.findOne().exec();
  let uniqueCode = codeDocument.code;
  const characters = req.body.name.slice(0, 3);
  uniqueCode = characters + uniqueCode;
  codeDocument.code = codeDocument.code + 1;
  await codeDocument.save();
  let quizCreated;
  try {
    quizCreated = await Quiz.create({
      name: req.body.name,
      code: uniqueCode,
      quizmaker: req.user,
      type: "general",
      status: "started",
      approvalrequired: "false",
    });
  } catch (err) {
    return res.status(400).json(err);
  }
  const findUser = await User.findOne({ user: req.user });
  findUser.generalquizcreated.push(quizCreated._id);
  findUser.quiztobecompleted.push(quizCreated._id);
  await findUser.save();
  if (req?.body?.timer && isNaN(req.body.timer) === false)
    quizCreated.timer = req.body.timer;
  await quizCreated.save();
  for (let i = 0; i < finalQids.length; i++) {
    let item = finalQids[i];
    const findQbQuestion = await QB.findOne({ _id: item }).exec();
    const findQbAnswerKey = await answerKey.findOne({ qid: item }).exec();
    const result = await question.create({
      question: findQbQuestion.question,
      options: findQbQuestion.options,
      quizid: quizCreated._id,
    });
    await QuizAnswerKey.create({
      qid: result._id,
      answer: findQbAnswerKey.answer,
      quizid: quizCreated._id,
    });
    quizCreated.questions.push(result._id);
  }
  await quizCreated.save();
  return res.status(201).json({
    message: `Quiz created successfully with ${easy} easy, ${medium} medium, ${hard} hard questions for ${category} ${subcategory}`,
  });
};

const getQuizStatus = async (req, res) => {
  if (!req.body.quizid)
    return res.status(400).json({ message: "Quiz id missing" });
  const { quizid } = req.body;
  if (!quizid.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: "Quiz not found, invalid ID" });
  }
  const findQuiz = await Quiz.findById(quizid);
  if (!findQuiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (findQuiz.quizmaker === req.user && findQuiz.type === "custom")
    return res
      .status(404)
      .json({ message: "You cannot participate in your own quiz!" });
  const findUser = await User.findOne({ user: req.user });
  if (!findUser.quiztobecompleted.includes(quizid))
    return res
      .status(404)
      .json({ message: "You cannot participate in this quiz" });
  if (findUser.generalquizanswered.includes(quizid))
    return res
      .status(443)
      .json({ message: "You already participated in this general quiz!" });
  if (findQuiz.approvalrequired === "true") {
    const findQuizApproval = await QuizApproval.findOne({
      quizid: quizid,
    }).exec();
    if (
      findQuiz.type === "custom" &&
      !findQuizApproval.approved.includes(req.user)
    )
      return res
        .status(404)
        .json({ message: "You cannot participate in this quiz" });
  }
  if (findQuiz.status === "new")
    return res.status(404).json({ message: "Quiz has not started yet." });
  if (findQuiz.status === "ended")
    return res.status(404).json({ message: "Quiz ended." });
  res.status(200).json({ message: "Quiz has started" });
};
module.exports = {
  createQuiz,
  editQuiz,
  deleteQuiz,
  copyQuiz,
  startQuiz,
  endQuiz,
  manageParticipants,
  requestApproval,
  getQuizInfo,
  getQuizQuestions,
  getQuizFromCode,
  initializeQuizSession,
  submitAnswer,
  getQuizQuestionsAndAnswers,
  getResponses,
  getParticipants,
  createGeneralQuiz,
  getQuizStatus,
};
