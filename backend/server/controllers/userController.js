const User = require("../models/User");

// (ADMIN) Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while fetching all users",
    });
  }
};

// (ADMIN) Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "No user found with that ID" });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while updating the user role",
    });
  }
};

// (ADMIN) Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "No user found with that ID" });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while deleting the user",
    });
  }
};
