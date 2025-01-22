const express = require("express");
const natural = require("natural");
const router = express.Router();

const responses = {
  "hi": {
    text: "Hi, There! How Can I Help You?",
    options: [
      "The college offers the following Courses",
      "Tell me about placements",
      "What is the college known for?",
      "What is the location of the college?",
    ],
  },
  "what is the name of the college?": "The name of the college is R.V.R & J.C College of Engineering.",
  "what is the college known for?": "R.V.R & J.C College of Engineering is renowned for its academic excellence and industry connections.",
  "tell me about placements":
    "As of now, 352 offers have been made by TCS. For more details, visit <a href='https://rvrjcce.ac.in/xtrainingandplacements.php'>here</a>.",
  "what is the location of the college?": "The college is located in Chowdavaram, Guntur, Andhra Pradesh.",
  "what Course are available?": {
    text: "The college offers the following Courses:",
    options: ["Undergraduate Courses", "Postgraduate Courses", "Diploma Courses"],
  },
  "undergraduate courses": {
    text: "Available Undergraduate Courses:",
    options: ["B.Tech", "BBA", "B.Sc"],
  },
  "postgraduate courses": {
    text: "Available Postgraduate Courses:",
    options: ["M.Tech", "MBA", "M.Sc"],
  },
  "b.tech": {
    text: "B.Tech includes the following departments:",
    options: ["CSE", "CSD", "ECE", "EEE", "MECH", "CIVIL"],
  },
  "how can i apply for scholarships?":"Scholarships can be applied through the official college portal. Visit <a href='https://spkhub.netlify.app'>here</a> for more information.",
  "what is the hostel fee?": "The hostel fee ranges from ₹5000 to ₹8000 per month, depending on the room type.",
};


const greetingKeywords = ["hi", "hello", "hey", "greetings",'yow','hi buddy','rvr'];

function processInput(input) {
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;
  const tokens = tokenizer.tokenize(input);
  return tokens.map((token) => stemmer.stem(token)).join(" ");
}

router.post("/message", (req, res) => {
  const userInput = req.body.text.toLowerCase().trim();

  
  if (greetingKeywords.some((greeting) => userInput.includes(greeting))) {
    return res.json(responses["hi"]);
  }

  if (responses[userInput]) {
    const response = responses[userInput];
    return res.json({ text: response.text || response, options: response.options || [] });
  }

  const processedInput = processInput(userInput);
  const response = getResponse(processedInput);

  if (response) {
    res.json({ text: response.text || response, options: response.options || [] });
  } else {
    res.json({
      text: "I'm sorry, I couldn't understand your question. Could you try rephrasing it?",
    });
  }
});

function getResponse(userInput) {
  const keys = Object.keys(responses);
  let bestMatch = { key: null, score: 0 };

  keys.forEach((key) => {
    const normalizedKey = processInput(key.toLowerCase());
    const score = natural.JaroWinklerDistance(userInput, normalizedKey);
    if (score > bestMatch.score) {
      bestMatch = { key, score };
    }
  });

  if (bestMatch.score > 0.7) {
    return responses[bestMatch.key];
  }

  const suggestions = keys.filter((key) =>
    natural.JaroWinklerDistance(userInput, processInput(key.toLowerCase())) > 0.5
  );

  if (suggestions.length > 0) {
    return {
      text: "Did you mean:",
      options: suggestions,
    };
  }

  return null;
}

module.exports = router;
