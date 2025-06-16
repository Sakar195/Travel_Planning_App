const asyncHandler = require("express-async-handler");
const Tag = require("../models/Tag");
const { body, validationResult } = require("express-validator");

/**
 * @desc    Get all tags (Public/User)
 * @route   GET /api/tags
 * @access  Public
 */
const getAllTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({}).sort({ name: 1 }); // Simple fetch for public use
  res.json(tags);
});

/**
 * @desc    ADMIN: Get all tags with pagination and search
 * @route   GET /api/tags/admin
 * @access  Private/Admin
 */
const adminGetAllTags = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page
  const search = req.query.search || "";

  const query = search
    ? { name: { $regex: search, $options: "i" } } // Case-insensitive search by name
    : {};

  try {
    const count = await Tag.countDocuments(query);
    const tags = await Tag.find(query)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      tags,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalTags: count,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching tags");
  }
});

/**
 * @desc    ADMIN: Create a new tag
 * @route   POST /api/tags/admin
 * @access  Private/Admin
 */
const adminCreateTag = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  // Check if tag already exists (case-insensitive)
  const tagExists = await Tag.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (tagExists) {
    res.status(400);
    throw new Error(`Tag with name "${name}" already exists`);
  }

  const tag = new Tag({
    name: name.trim(), // Trim whitespace
    description: description?.trim() || "", // Optional description
  });

  const createdTag = await tag.save();
  res.status(201).json(createdTag);
});

/**
 * @desc    ADMIN: Update a tag
 * @route   PUT /api/tags/:id
 * @access  Private/Admin
 */
const adminUpdateTag = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  const tagId = req.params.id;

  const tag = await Tag.findById(tagId);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  // Check if another tag with the new name already exists (case-insensitive)
  if (name && name.toLowerCase() !== tag.name.toLowerCase()) {
    const existingTag = await Tag.findOne({
      _id: { $ne: tagId }, // Exclude the current tag
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingTag) {
      res.status(400);
      throw new Error(`Another tag with name "${name}" already exists`);
    }
    tag.name = name.trim();
  }

  tag.description = description?.trim() ?? tag.description;

  const updatedTag = await tag.save();
  res.json(updatedTag);
});

/**
 * @desc    ADMIN: Delete a tag
 * @route   DELETE /api/tags/:id
 * @access  Private/Admin
 */
const adminDeleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  // TODO: Consider implications - should deleting a tag remove it from all associated trips?
  // For now, just delete the tag document.
  await tag.deleteOne();

  res.json({ message: "Tag removed successfully" });
});

// TODO: Add adminUpdateTag and adminDeleteTag controllers if needed

module.exports = {
  getAllTags,
  adminGetAllTags,
  adminCreateTag,
  adminUpdateTag,
  adminDeleteTag,
};
