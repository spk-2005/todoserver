const express = require("express");
const natural = require("natural");
const router = express.Router();

const responses = {
  "what is the name of the college?": "The name of the college is R.V.R & J.C College Of Engineering.",

  "what is the college known for?": "Ravindra Bharathi College is known for its excellence in education and student success.",

 "what is the college known for?": "R.V.R & J.C College Of Engineering. is known for its excellence in education and student success.",

 "what is the location of the college?": "The college is located in Chowdavaram Guntur, Andhra Pradesh.",
  "what is the college's admission process?": "The college follows a merit-based admission process.",
  "what departments are available?": {
    text: "The college offers departments in B.tech:",
    options: ["Undergraduate Courses", "Postgraduate Courses", "Diploma Courses"],
  },
  "tell me about the courses available.": {
    text: "The college offers the following categories of courses:",
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
  "diploma courses": {
    text: "Available Diploma Courses:",
    options: ["Data Science", "Cybersecurity", "AI and ML"],
  },
  "b.tech": {
    text: 'In B.Tech Course we have a total of 11 Departments',
    options: ["CSE", "CSD", "CSM", "CSO", "CSBS", "CIVIL", "ECE", "EEE", "MECH", "CAD"],
  },
  "how can i apply for scholarships?": "You can apply for scholarships through the college's official website:<a href='https://spkhub.netlify.app'>Click Here</a>",
  "what is the hostel fee?": "The hostel fee ranges from ₹5000 to ₹8000 per month, depending on the type of room.",
};

// Function to process the input (e.g., tokenization, stemming, etc.)
function processInput(input) {
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;
  const tokens = tokenizer.tokenize(input);
  return tokens.map((token) => stemmer.stem(token)).join(" ");
}

// Route to handle incoming messages
router.post("/message", (req, res) => {
  const userInput = req.body.text.toLowerCase().trim();

  // Check for exact match in predefined responses
  if (responses[userInput]) {
    const response = responses[userInput];
    return res.json({ text: response.text || response, options: response.options || [] });
  }

  // Process input with NLP techniques
  const processedInput = processInput(userInput);
  const response = getResponse(processedInput);

  if (response) {
    res.json({ text: response.text || response, options: response.options || [] });
  } else {
    res.json({
      text: "Sorry, I don't understand your question. Try asking about courses, departments, or fees.",
    });
  }
});

// Tokenize, stem, and (optional) lemmatize the input
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

  // If a close match is found, return the response
  if (bestMatch.score > 0.6) { // Lowered threshold for typo tolerance
    return responses[bestMatch.key];
  }

  // Special case for keyword "course" to show all course-related information
  if (userInput.includes("course")) {
    return responses["tell me about the courses available."];
  }  if (userInput.includes("btech" || 'b.tech')) {
    return responses["b.tech"];
  }

  // Suggest potential matches if no exact match is found
  const suggestions = keys.filter((key) =>
    natural.JaroWinklerDistance(userInput, processInput(key.toLowerCase())) > 0.4
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



