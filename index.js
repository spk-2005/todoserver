const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  des: { type: String, required: true },
});

const Todo = mongoose.model("Todo", todoSchema); 

mongoose.connect('mongodb://prasannasimha2005:oGaDsZX6g7gm7EtY@demo-shard-00-00.za1wp.mongodb.net:27017/demo?ssl=true&replicaSet=atlas-11j891-shard-0&authSource=admin&retryWrites=true&w=majority&appName=demo')
 .then(() => console.log("Successfully connected to MongoDB!"))
  .catch(err => console.error("Connection error:", err.message));

app.get('/api/todo', async (req, res) => {
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
app.post('/api/todo', async (req, res) => {
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

// PUT - Update a todo
app.put('/api/todo/:id', async (req, res) => {
  try {
    const { des } = req.body; // No need for id here
    const todoId = req.params.id; // Get id from URL parameters

    if (!des) {
      return res.status(400).send('Description is required');
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

// DELETE - Delete a todo
app.delete('/api/todo/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const deletedTodo = await Todo.findOneAndDelete({ id: todoId });

    if (!deletedTodo) {
      return res.status(404).send('Todo not found');
    }

    res.status(200).json({ message: 'Todo deleted', todo: deletedTodo });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
