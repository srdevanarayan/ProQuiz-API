const express = require("express");
const router = express.Router();
const quizController = require("../../controllers/quizController");

router.post("/create", quizController.createQuiz);
router.put("/edit", quizController.editQuiz);
router.delete("/delete", quizController.deleteQuiz);
router.post("/copy", quizController.copyQuiz);
router.put("/start", quizController.startQuiz);
router.put("/end", quizController.endQuiz);
router.put("/manageparticipants", quizController.manageParticipants);
router.post("/requestapproval", quizController.requestApproval);
router.get("/info", quizController.getQuizInfo);
router.get("/questions", quizController.getQuizQuestions);
router.get("/questionsandanswers", quizController.getQuizQuestionsAndAnswers);
router.get("/quizfromcode", quizController.getQuizFromCode);
router.put("/session/initialize", quizController.initializeQuizSession);
router.put("/session/submit", quizController.submitAnswer);
router.get("/getresponses", quizController.getResponses);
router.get("/getparticipants", quizController.getParticipants);
router.post("/creategeneralquiz", quizController.createGeneralQuiz);

module.exports = router;
