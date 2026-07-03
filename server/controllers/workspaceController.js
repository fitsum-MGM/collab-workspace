const Workspace = require('../models/Workspace')
const WorkspaceMember = require('../models/WorkspaceMember')
const User = require("../models/user")

// Create a new workspace
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    // Create a slug from the name
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    // Create the workspace
    const workspace = await Workspace.create({
      name,
      slug,
      owner: req.user._id,
    });

    // Add the creator as owner member
    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: "owner",
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all workspaces for current user
const getWorkspaces = async (req, res) => {
  try {
    // Find all memberships for this user
    const memberships = await WorkspaceMember.find({
      user: req.user._id,
    }).populate("workspace");

    // Extract workspace data
    const workspaces = memberships.map((m) => ({
      ...m.workspace._doc,
      role: m.role,
    }));

    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single workspace by id
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is a member
    const member = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: req.user._id,
    });

    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ ...workspace._doc, role: member.role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a member to a workspace
const addWorkspaceMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = "editor" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const currentMember = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: req.user._id,
      role: "owner",
    });

    if (!currentMember) {
      return res.status(403).json({ message: "Only the workspace owner can share it" });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: targetUser._id,
    });

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member of this workspace" });
    }

    const member = await WorkspaceMember.create({
      workspace: workspace._id,
      user: targetUser._id,
      role,
    });

    res.status(201).json({
      message: "Workspace shared successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspace, addWorkspaceMember };
