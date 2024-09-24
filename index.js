const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());  

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/News")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error", err));

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  des: String,
});

const Todo = mongoose.model("todo", todoSchema);

// GET - Fetch all todos
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

// POST - Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { id, des } = req.body;
    if (!id || !des) {
      return res.status(400).send('Id and description are required');
    }
    const newTodo = new Todo({ id, des });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).send('Internal server error');
  }
});


app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id, des } = req.body;
    const todoId = req.params.id; // Get id from URL parameters

    if (!id || !des) {
      return res.status(400).send('Id and description are required');
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { id: todoId },  
      { des: des },    
      { new: true }    
    );

    if (!updatedTodo) {
      return res.status(404).send('Todo not found');
    }

    res.json(updatedTodo);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).send('Internal server error');
  }
});


app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const deletedTodo = await Todo.findOneAndDelete({ id: todoId });

    if (!deletedTodo) {
      return res.status(404).send('Todo not found');
    }

    res.json({ message: 'Todo deleted', todo: deletedTodo });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
