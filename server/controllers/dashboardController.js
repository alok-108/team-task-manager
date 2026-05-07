const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/dashboard - Aggregated stats for the current user
exports.getDashboard = async (req, res) => {
  try {
    // Get all projects where user is a member
    const projects = await Project.find({
      'members.user': req.user._id
    }).populate('owner', 'name email');

    const projectIds = projects.map(p => p._id);

    // Get all tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Get tasks assigned to the user
    const myTasks = await Task.find({
      assignedTo: req.user._id,
      project: { $in: projectIds }
    })
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    // Compute stats
    const now = new Date();

    const totalTasks = allTasks.length;
    const todoCount = allTasks.filter(t => t.status === 'todo').length;
    const inProgressCount = allTasks.filter(t => t.status === 'in-progress').length;
    const doneCount = allTasks.filter(t => t.status === 'done').length;
    const overdueCount = allTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    const myTotalTasks = myTasks.length;
    const myTodoCount = myTasks.filter(t => t.status === 'todo').length;
    const myInProgressCount = myTasks.filter(t => t.status === 'in-progress').length;
    const myDoneCount = myTasks.filter(t => t.status === 'done').length;
    const myOverdueCount = myTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    // Per-project breakdown
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const projectTasks = allTasks.filter(
          t => t.project.toString() === project._id.toString()
        );
        const pOverdue = projectTasks.filter(
          t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
        ).length;

        return {
          _id: project._id,
          name: project.name,
          totalTasks: projectTasks.length,
          todo: projectTasks.filter(t => t.status === 'todo').length,
          inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
          done: projectTasks.filter(t => t.status === 'done').length,
          overdue: pOverdue
        };
      })
    );

    // Upcoming tasks (due in next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = myTasks.filter(
      t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDaysFromNow && t.status !== 'done'
    );

    res.json({
      overview: {
        totalProjects: projects.length,
        totalTasks,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        overdue: overdueCount,
        completionRate: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0
      },
      myStats: {
        totalTasks: myTotalTasks,
        todo: myTodoCount,
        inProgress: myInProgressCount,
        done: myDoneCount,
        overdue: myOverdueCount
      },
      projectStats,
      upcomingTasks: upcomingTasks.slice(0, 10), // Limit to 10
      recentTasks: myTasks.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
