const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { validationResult } = require('express-validator');


exports.getTickets = async (req, res) => {
  try {
    let query = {};
    
    if (['firstline', 'secondline', 'admin'].includes(req.user.role)) {
    }
    else {
      query.user = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      })
      .sort('-updatedAt');

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


exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      });

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const hasAccess = 
      req.user.role === 'admin' ||
      ticket.user._id.toString() === req.user.id ||
      ['firstline', 'secondline'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(401).json({ msg: 'Not authorized to view this ticket' });
    }

    ticket.comments.sort((a, b) => b.createdAt - a.createdAt);

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

exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name role');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const hasAccess = 
      req.user.role === 'admin' ||
      ticket.user._id.toString() === req.user.id ||
      ['firstline', 'secondline'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(401).json({ msg: 'Not authorized to update this ticket' });
    }

    if (['firstline', 'secondline'].includes(req.user.role) && req.body.status) {
      if (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Only the assigned support staff can update ticket status' });
      }

      if (!['resolved', 'in_progress'].includes(req.body.status)) {
        return res.status(400).json({ msg: 'Support staff can only set status to resolved or in progress' });
      }
    }

    if (!['admin', 'firstline', 'secondline'].includes(req.user.role)) {
      const allowedUpdates = ['description'];
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    }

    if (req.body.status === 'resolved' && ticket.status !== 'resolved') {
      const resolvedComment = {
        text: `Ticket marked as resolved by ${req.user.role} support staff`,
        user: req.user.id,
        createdAt: Date.now()
      };
      
      if (!ticket.comments) {
        ticket.comments = [];
      }
      ticket.comments.unshift(resolvedComment);
    }

    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          ...req.body,
          updatedAt: Date.now(),
          comments: ticket.comments
        }
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email role')
    .populate('assignedTo', 'name role')
    .populate({
      path: 'comments.user',
      select: 'name email role'
    });

    if (ticket.comments) {
      ticket.comments.sort((a, b) => b.createdAt - a.createdAt);
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

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

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

exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      });

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const canComment = 
      req.user.role === 'admin' ||
      ticket.user._id.toString() === req.user.id ||
      ['firstline', 'secondline'].includes(req.user.role);

    if (!canComment) {
      return res.status(401).json({ msg: 'Not authorized to comment on this ticket' });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id,
      createdAt: Date.now()
    };

    ticket.comments.unshift(newComment);
    ticket.updatedAt = Date.now();
    await ticket.save();

    const populatedTicket = await Ticket.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      });

    populatedTicket.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      data: populatedTicket
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'new' });
    const inProgress = await Ticket.countDocuments({ status: 'in_progress' });
    const resolved = await Ticket.countDocuments({ status: 'resolved' });
    const escalated = await Ticket.countDocuments({ status: 'escalated' });

    const supportStats = {
      total: await User.countDocuments({ 
        role: { $in: ['firstline', 'secondline'] }
      }),
      firstline: await User.countDocuments({ role: 'firstline' }),
      secondline: await User.countDocuments({ role: 'secondline' }),
      resolved: await Ticket.countDocuments({ status: 'resolved' }),
      escalated: await Ticket.countDocuments({ status: 'escalated' })
    };

    const categories = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

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

exports.assignTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { assignedTo, supportLevel } = req.body;

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.assignedTo && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Ticket is already assigned. Only admin can reassign tickets.' });
    }

    if (req.user.role !== 'admin') {
      if (assignedTo !== req.user.id) {
        return res.status(403).json({ msg: 'Support staff can only self-assign tickets' });
      }
      
      if (supportLevel !== req.user.role) {
        return res.status(400).json({ msg: 'Support level must match your role' });
      }
    } else {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ msg: 'Assigned user not found' });
      }

      if (assignedUser.role !== supportLevel) {
        return res.status(400).json({ 
          msg: `User must be a ${supportLevel} support staff to be assigned this ticket` 
        });
      }
    }

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