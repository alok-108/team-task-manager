const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// POST /api/projects - Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Populate owner and member details
    await project.populate('members.user', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// GET /api/projects - List projects where user is a member
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });

    // Attach task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// GET /api/projects/:id - Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check membership
    const isMember = project.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// PUT /api/projects/:id - Update project (admin only, enforced by middleware)
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// DELETE /api/projects/:id - Delete project and all its tasks
exports.deleteProject = async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project and all its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// POST /api/projects/:id/members - Add member by email
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const project = req.project;

    // Check if already a member
    const existingMember = project.members.find(
      m => m.user.toString() === user._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push({
      user: user._id,
      role: role || 'member'
    });

    await project.save();
    await project.populate('members.user', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
};

// DELETE /api/projects/:id/members/:userId - Remove member
exports.removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    // Cannot remove the project owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    const memberIndex = project.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this project' });
    }

    project.members.splice(memberIndex, 1);

    // Also unassign any tasks assigned to this user in this project
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: null }
    );

    await project.save();
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};
