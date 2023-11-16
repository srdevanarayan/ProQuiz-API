require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// custom middleware logger
//app.use(logger);
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
//app.use("/", express.static(path.join(__dirname, "/public")));

// routes

app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/verify", require("./routes/verifyEmail"));
app.use("/requestotp", require("./routes/requestotp"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));
app.use("/resetpassword", require("./routes/resetPassword"));

app.use(verifyJWT);
app.use("/roles", require("./routes/roles"));
app.use("/stats", require("./routes/stats"));
app.use("/answers", require("./routes/api/answers"));
app.use("/changename", require("./routes/api/changeName"));
app.use("/approveexperts", require("./routes/approveExperts"));
app.use("/qb", require("./routes/api/questionBank"));
app.use("/question", require("./routes/api/question"));
app.use("/quiz", require("./routes/api/quiz"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
