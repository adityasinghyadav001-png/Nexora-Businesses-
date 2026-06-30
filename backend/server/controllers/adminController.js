const User = require("../models/User");
const Project = require("../models/Project");

// (ADMIN) Get Analytics Dashboard Data
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $in: ["Pending", "In Progress"] },
    });
    const completedProjects = await Project.countDocuments({
      status: "Completed",
    });

    // Calculate revenue (sum of budget from completed projects)
    const revenueAggregation = await Project.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$budget" } } },
    ]);
    const revenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Projects per service for charts
    const projectsPerService = await Project.aggregate([
      { $group: { _id: "$serviceName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Format chart data
    const chartLabels = projectsPerService.map(item => item._id || "Unknown");
    const chartData = projectsPerService.map(item => item.count);

    res.status(200).json({
      status: "success",
      data: {
        metrics: {
          totalUsers,
          totalProjects,
          activeProjects,
          completedProjects,
          revenue,
        },
        charts: {
          projectsPerService: {
            labels: chartLabels,
            data: chartData,
          },
        },
      },
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while fetching analytics",
    });
  }
};
