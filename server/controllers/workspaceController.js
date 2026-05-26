const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");

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

module.exports = { createWorkspace, getWorkspaces, getWorkspace };
