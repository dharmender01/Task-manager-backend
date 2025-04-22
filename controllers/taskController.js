const Task = require('../models/Task');
const fetchGoogleSheetData = require('../services/googleSheetService');

// Function to import tasks from Google Sheets
exports.importTasks = async (req, res) => {
  try {
    const { url } = req.body;

    // Fetch data from Google Sheets via the service
    const data = await fetchGoogleSheetData(url);

    // Check if data was returned and is not empty
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No tasks found in the provided Google Sheets link.' });
    }

    // Map the data to fit the task model
    const tasks = data.map(item => ({
      title: item.Title, // Assuming 'Title' is a column in the Google Sheets
      description: item.Description, // Assuming 'Description' is a column
      dueDate: new Date(item.DueDate), // Assuming 'DueDate' is a column
    }));

    // Check for duplicate tasks in bulk
    const existingTasks = await Task.find({
      $or: tasks.map(task => ({
        title: task.title,
        dueDate: task.dueDate,
      })),
    });

    // Create a set of tasks to insert (avoid duplicates)
    const tasksToInsert = tasks.filter(task => {
      return !existingTasks.some(existingTask =>
        existingTask.title === task.title && existingTask.dueDate.toISOString() === task.dueDate.toISOString()
      );
    });

    if (tasksToInsert.length > 0) {
      // Insert the new tasks
      await Task.insertMany(tasksToInsert);
      console.log(`Successfully imported ${tasksToInsert.length} tasks.`);
    }

    // Send success response with the number of tasks imported
    res.status(201).json({ message: `${tasksToInsert.length} tasks imported successfully` });
  } catch (err) {
    console.error('Error importing tasks:', err);
    res.status(400).json({ error: 'Error importing tasks: ' + err.message });
  }
};

// Function to get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Error fetching tasks: ' + err.message });
  }
};

// Function to create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // Validate incoming data (basic validation)
    if (!title || !description || !dueDate) {
      return res.status(400).json({ error: 'Title, description, and due date are required.' });
    }

    // Create and save the new task
    const task = new Task({ title, description, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Error creating task: ' + err.message });
  }
};

// Function to update an existing task by ID
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate the update data
    if (!updateData.title && !updateData.description && !updateData.dueDate) {
      return res.status(400).json({ error: 'At least one field (title, description, due date) is required to update the task.' });
    }

    // Update the task
    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Error updating task: ' + err.message });
  }
};

// Function to delete a task by ID
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the task
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Error deleting task: ' + err.message });
  }
};
