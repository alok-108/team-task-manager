const Task = require('../models/Task');

// POST /api/projects/:projectId/tasks - Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // If assignedTo is provided, verify user is a project member
    if (assignedTo) {
      const isMember = req.project.members.some(
        m => m.user.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user must be a project member' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: req.params.projectId,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.populate('assignedTo', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// GET /api/projects/:projectId/tasks - Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { status, assignedTo, priority, sort } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') {
      sortOption = { priority: 1 }; // Will sort alphabetically, but functional
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .sort(sortOption);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// GET /api/projects/:projectId/tasks/:taskId - Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId
    }).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// PUT /api/projects/:projectId/tasks/:taskId - Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const isAdmin = req.memberRole === 'admin';
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    // Members can only update status of tasks assigned to them
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    if (!isAdmin) {
      // Non-admin can only change status
      if (status) task.status = status;
    } else {
      // Admin can update everything
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) {
        // Verify assignee is a project member
        if (assignedTo) {
          const isMember = req.project.members.some(
            m => m.user.toString() === assignedTo
          );
          if (!isMember) {
            return res.status(400).json({ message: 'Assigned user must be a project member' });
          }
        }
        task.assignedTo = assignedTo || null;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// DELETE /api/projects/:projectId/tasks/:taskId - Delete task (admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.params.projectId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
