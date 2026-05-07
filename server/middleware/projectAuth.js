const Project = require('../models/Project');

// Check if user is a member of the project (any role)
const projectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking project membership' });
  }
};

// Check if user is an admin of the project
const projectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Project admin access required' });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking admin access' });
  }
};

module.exports = { projectMember, projectAdmin };
