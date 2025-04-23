const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: {type :String, required: true},
  dueDate: {type :Date, required: true},
  completed: { type: Boolean, default: false }
});
module.exports = mongoose.model('Task', TaskSchema);
