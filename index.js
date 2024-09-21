const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 


const app = express();
const PORT = 5000;

app.use(cors()); 


mongoose.connect("mongodb://localhost:27017/News")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error", err));

const todoSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  des: String,
});

const Todo = mongoose.model("todo", todoSchema);


app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    console.log("Fetched todos:", todos); 
    
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).send(err);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
