const express = require('express');
const { importTasks, getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

// Route definitions
router.post('/import', importTasks);        // Import tasks
router.get('/tasks', getTasks);             // Get all tasks with pagination, search, and sorting
router.post('/tasks', createTask);          // Create a new task
router.put('/tasks/:id', updateTask);       // Update a task
router.delete('/tasks/:id', deleteTask);    // Delete a task

module.exports = router;
