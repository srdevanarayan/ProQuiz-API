const mongoose = require("mongoose");
const QuizCode = require("../model/quizCode");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    const getQuizCode = await QuizCode.findOne().exec();
    if (!getQuizCode) await QuizCode.create({ code: 0 });
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
