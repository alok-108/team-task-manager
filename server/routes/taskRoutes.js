const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/projectAuth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(auth);

// Task CRUD
router.post('/', projectAdmin, createTask);       // Only admin can create
router.get('/', projectMember, getTasks);           // Any member can view
router.get('/:taskId', projectMember, getTask);     // Any member can view
router.put('/:taskId', projectMember, updateTask);  // Member can update own status; admin can update all
router.delete('/:taskId', projectAdmin, deleteTask); // Only admin can delete

module.exports = router;
