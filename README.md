# ProQuiz - A Comprehensive Quiz Web Application

![ProQuiz Logo](https://drive.google.com/uc?export=view&id=1co-rWPuhOA0NZBiA1uUbQIefo-KEvAZF)

## Table of Contents
1. [Introduction](#introduction)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Usage](#usage)
5. [Screenshots](#screenshots)
6. [Future Enhancements](#future-enhancements)


---

## Introduction

Welcome to ProQuiz, a powerful quiz web application developed using the MERN stack. ProQuiz was created in just 1.5 months while I was learning the stack's technologies. This project showcases my dedication to mastering these technologies and my commitment to delivering a feature-rich and user-friendly application.

---

## Key Features

### User Authentication
- Secure user sign-in and registration forms with comprehensive form validation.
- OTP (One-Time Password) verification for added security.
- Password change functionality for registered users.
- Authentication tokens stored in memory for enhanced security, and refresh tokens to automatically refresh user session for seamless experience.

### Custom Frontend
- A fully custom frontend, built from scratch without relying on templates, ensuring a unique and engaging user experience.

### User Roles
- ProQuiz supports five distinct user roles:
  1. Quiz Maker
  2. Quiz Taker
  3. Question Validator
  4. Question Contributor
  5. Question Bank Viewer

### Extensive Question Bank
- A comprehensive question bank featuring questions organized by categories and subcategories.
- Sort questions by rating, validated count, difficulty level, date created, and more.

### User Contribution
- Users can add, edit, and delete questions within the question bank.
- A select group of users, known as question validators, have the authority to validate questions they deem correct.

### Quiz Creation
- Quiz makers can effortlessly create quizzes using questions from the question bank and their own questions.
- Customize quizzes by setting time limits and approval requirements for participants.
- Quiz makers can copy, edit and delete their quizzes, with options to start and end quiz sessions.

### Participant Management
- Quiz makers have the ability to accept, block, or reject participant requests to join a quiz.

### Quiz Results
- After a quiz, quiz makers can view scores of participants and their individual responses.

### Quiz Taking
- Quiz takers can create their own quizzes (general quizzes) using questions from question bank by specifying categories, subcategories, and other filters.
- Participate in custom quizzes created by other quiz makers by entering quiz codes (and requesting for approval if needed) and view their answers along with the correct ones.

---

## Technologies Used

- **Frontend:**
  - React
  - HTML5
  - CSS3
  - JavaScript

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB

- **Authentication:**
  - OTP Verification
  - Sign in using username and password
  - JSON Web Tokens (JWT) for authentication and refresh tokens

- **Other Tools:**
  - REST APIs
  - Git and GitHub for version control

---


## Usage

1. Sign in or register to access the full range of features based on your user role.
2. Explore and contribute to the extensive question bank.
3. Create your own quizzes or participate in existing ones.
4. Manage participant requests and view quiz results.
5. Enjoy a seamless and engaging quiz experience!

---

## Screenshots

<!-- Include screenshots of your application here -->
| ![Homepage](https://drive.google.com/uc?export=view&id=1KWYpfHUXOXiijOSjkrSi717PzKgEVq7N) | ![User Registration](https://drive.google.com/uc?export=view&id=1Zn07UlTP_DMs0o-vvF-NFruMI3-5bHIS) |
|:--:|:--:|
| **Homepage** | **User Registration** |

| ![User Login](https://drive.google.com/uc?export=view&id=1nrtwAnf7PMgG34Rw4sdFZWTeMr1PZSAq) | ![Dashboard](https://drive.google.com/uc?export=view&id=1kGMZR_EMtEJ71RYeFlxXgfK3VIkqJEWj) |
|:--:|:--:|
| **User Login** | **Dashboard** |

| ![Quiz Maker Screen](https://drive.google.com/uc?export=view&id=1Fn52yknuz48VOdxW01YyouOX50hh-bLQ) | ![Quiz Taker Screen](https://drive.google.com/uc?export=view&id=1vmmHAdvYvtAl3LT4NIhIQTwEAj_pk86R) |
|:--:|:--:|
| **Quiz Maker Screen** | **Quiz Taker Screen** |

| ![Quiz Session](https://drive.google.com/uc?export=view&id=1fxGW35IM-lEn6QuJntRJjKcAOfLVPo-w) | ![Quiz Taker Result Screen](https://drive.google.com/uc?export=view&id=1oQwo-oNr2ynEREII01KWMs634luvA_UX) |
|:--:|:--:|
| **Quiz Session** | **Quiz Taker Result Screen** |

| ![Question Contributor Screen](https://drive.google.com/uc?export=view&id=1aWTyHC9HqMZEL-ZKKtVcYvE2RW2nq3Nj) | ![Question Validator Screen](https://drive.google.com/uc?export=view&id=1_Gy7EAVBjb2OMRMGl5cFHv2EHHI_iQoK) |
|:--:|:--:|
| **Question Contributor Screen** | **Question Validator Screen** |

| ![Question Bank Viewer Screen](https://drive.google.com/uc?export=view&id=1yiQ-kG7CBilNsQRBpDmpoDY6srCO1Ui8) | |
|:--:|:--:|
| **Question Bank Viewer Screen** | |


---

## Future Enhancements

In the future, ProQuiz will receive additional enhancements, including:

- **Spreadsheet Integration:** Allow users to upload questions from spreadsheets.
- **Results Export:** Enable users to download quiz results as spreadsheets.
- **And More:** Continuously improve and expand ProQuiz's features and capabilities.

---

Thank you for exploring ProQuiz, and I hope you find it both useful and enjoyable!
