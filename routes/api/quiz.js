const express = require("express");
const router = express.Router();
const quizController = require("../../controllers/quizController");

router.post("/create", quizController.createQuiz);
router.put("/edit", quizController.editQuiz);
router.post("/delete", quizController.deleteQuiz);
router.post("/copy", quizController.copyQuiz);
router.put("/start", quizController.startQuiz);
router.put("/end", quizController.endQuiz);
router.put("/manageparticipants", quizController.manageParticipants);
router.post("/requestapproval", quizController.requestApproval);
router.post("/info", quizController.getQuizInfo);
router.post("/questions", quizController.getQuizQuestions);
router.post("/questionsandanswers", quizController.getQuizQuestionsAndAnswers);
router.post("/quizfromcode", quizController.getQuizFromCode);
router.put("/session/initialize", quizController.initializeQuizSession);
router.put("/session/submit", quizController.submitAnswer);
router.post("/getresponses", quizController.getResponses);
router.post("/getparticipants", quizController.getParticipants);
router.post("/creategeneralquiz", quizController.createGeneralQuiz);
router.post("/quizstatus", quizController.getQuizStatus);

module.exports = router;
