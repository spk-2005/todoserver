

const express = require("express");
const cors = require("cors");
const chatbotRoutes = require("./chatbot");
const PORT=5000;
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chatbot", chatbotRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
