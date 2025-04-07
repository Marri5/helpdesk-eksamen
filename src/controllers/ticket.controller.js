const Ticket = require('../models/ticket.model');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    let query;

    // If user is not admin, show only their tickets
    if (req.user.role !== 'admin') {
      query = Ticket.find({ user: req.user.id });
    } else {
      // Admin can see all tickets
      query = Ticket.find();
    }

    // Add sorting and populate user details
    const tickets = await query
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${req.params.id}`
      });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const ticket = await Ticket.create(req.body);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${req.params.id}`
      });
    }

    // Ensure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ticket'
      });
    }

    // Process history tracking for admin updates
    if (req.user.role === 'admin') {
      const { status, priority, category, title, description } = req.body;
      const historyEntries = [];

      // Track changes to fields
      if (status && status !== ticket.status) {
        historyEntries.push({
          field: 'status',
          oldValue: ticket.status,
          newValue: status,
          updatedBy: req.user.id
        });
      }

      if (priority && priority !== ticket.priority) {
        historyEntries.push({
          field: 'priority',
          oldValue: ticket.priority,
          newValue: priority,
          updatedBy: req.user.id
        });
      }

      if (category && category !== ticket.category) {
        historyEntries.push({
          field: 'category',
          oldValue: ticket.category,
          newValue: category,
          updatedBy: req.user.id
        });
      }

      if (title && title !== ticket.title) {
        historyEntries.push({
          field: 'title',
          oldValue: ticket.title,
          newValue: title,
          updatedBy: req.user.id
        });
      }

      if (description && description !== ticket.description) {
        historyEntries.push({
          field: 'description',
          oldValue: ticket.description,
          newValue: description,
          updatedBy: req.user.id
        });
      }

      // Add history entries if there are changes
      if (historyEntries.length > 0) {
        ticket.history = [...ticket.history, ...historyEntries];
        await ticket.save();
      }
    }

    // Update the ticket
    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${req.params.id}`
      });
    }

    // Ensure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this ticket'
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${req.params.id}`
      });
    }

    // Ensure user is ticket owner or admin to add comment
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this ticket'
      });
    }

    // Create new comment
    const newComment = {
      user: req.user.id,
      userName: req.user.name,
      content: req.body.content
    };

    // Add comment to ticket
    ticket.comments.push(newComment);
    await ticket.save();

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private/Admin
exports.getTicketStats = async (req, res) => {
  try {
    // Only admin can see stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access ticket statistics'
      });
    }

    // Get count of tickets by status
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to more readable format
    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Add total count
    const totalCount = await Ticket.countDocuments();
    formattedStats.total = totalCount;

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}; 