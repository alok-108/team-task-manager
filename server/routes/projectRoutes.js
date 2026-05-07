const router = require('express').Router();
const auth = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/projectAuth');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

// All routes require authentication
router.use(auth);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', projectMember, getProject);
router.put('/:id', projectAdmin, updateProject);
router.delete('/:id', projectAdmin, deleteProject);

// Member management (admin only)
router.post('/:id/members', projectAdmin, addMember);
router.delete('/:id/members/:userId', projectAdmin, removeMember);

module.exports = router;
