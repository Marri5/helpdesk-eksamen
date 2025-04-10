const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    let query = {};
    
    // If user is TO, only show their assigned tickets
    if (req.user.role.startsWith('TO')) {
      query.assignedTo = req.user.id;
    }
    // If regular user, only show their tickets
    else if (req.user.role === 'user') {
      query.user = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name role')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name role')
      .populate('comments.user', 'name role');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Access control:
    // - Admin can see all tickets
    // - Support staff can see tickets they're assigned to or tickets in their support level
    // - Users can see their own tickets
    if (req.user.role === 'user' && ticket.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if ((req.user.role === 'firstline' || req.user.role === 'secondline') && 
        ticket.assignedTo?.toString() !== req.user.id && 
        ticket.supportLevel !== req.user.role) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newTicket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      status: 'new',
      user: req.user.id,
      createdBy: req.user.id
    });

    const ticket = await newTicket.save();

    // Populate user and createdBy fields for the response
    await ticket.populate([
      { path: 'user', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error('Ticket creation error:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Make sure user owns ticket or is admin/TO
    if (
      ticket.user.toString() !== req.user.id &&
      req.user.role === 'user' &&
      (!req.user.role.startsWith('TO') || ticket.assignedTo?.toString() !== req.user.id)
    ) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('assignedTo', 'name role');

    res.json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Make sure user owns ticket or is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await ticket.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id
    };

    ticket.comments.unshift(newComment);

    await ticket.save();

    const populatedTicket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name role')
      .populate('comments.user', 'name');

    res.json({
      success: true,
      data: populatedTicket
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private/Admin
exports.getTicketStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'new' });
    const inProgress = await Ticket.countDocuments({ status: 'in_progress' });
    const resolved = await Ticket.countDocuments({ status: 'resolved' });
    const escalated = await Ticket.countDocuments({ status: 'escalated' });

    // Support staff stats
    const supportStats = {
      total: await User.countDocuments({ 
        role: { $in: ['firstline', 'secondline'] }
      }),
      firstline: await User.countDocuments({ role: 'firstline' }),
      secondline: await User.countDocuments({ role: 'secondline' }),
      resolved: await Ticket.countDocuments({ status: 'resolved' }),
      escalated: await Ticket.countDocuments({ status: 'escalated' })
    };

    // Get category distribution
    const categories = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get priority distribution
    const priorities = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        escalated,
        support: supportStats,
        categories,
        priorities
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Assign ticket to support staff
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { assignedTo, supportLevel } = req.body;

    // Verify the assigned user exists and has the correct role
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ msg: 'Assigned user not found' });
    }

    if (assignedUser.role !== supportLevel) {
      return res.status(400).json({ 
        msg: `User must be a ${supportLevel} support staff to be assigned this ticket` 
      });
    }

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Update ticket with assignment and support level
    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          assignedTo,
          supportLevel,
          status: 'in_progress',
          updatedAt: Date.now()
        }
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('assignedTo', 'name role');

    res.json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid ticket or user ID' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
}; 