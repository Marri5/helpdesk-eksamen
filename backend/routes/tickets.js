const express = require('express');
const { check } = require('express-validator');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
  getTicketStats,
  assignTicket
} = require('../controllers/tickets');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// @route   GET /api/tickets
// @desc    Get all tickets
// @access  Private
router.get('/', getTickets);

// @route   GET /api/tickets/stats
// @desc    Get ticket statistics
// @access  Private/Admin
router.get('/stats', authorize('admin'), getTicketStats);

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', getTicket);

// @route   POST /api/tickets
// @desc    Create a ticket
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  createTicket
);

// @route   PUT /api/tickets/:id
// @desc    Update ticket
// @access  Private
router.put('/:id', updateTicket);

// @route   PUT /api/tickets/:id/assign
// @desc    Assign ticket to TO
// @access  Private/Admin
router.put(
  '/:id/assign',
  authorize('admin'),
  [
    check('assignedTo', 'Assigned user ID is required').not().isEmpty(),
    check('supportLevel', 'Support level must be either firstline or secondline').isIn(['firstline', 'secondline'])
  ],
  assignTicket
);

// @route   DELETE /api/tickets/:id
// @desc    Delete ticket
// @access  Private
router.delete('/:id', deleteTicket);

// @route   POST /api/tickets/:id/comments
// @desc    Add comment to ticket
// @access  Private
router.post(
  '/:id/comments',
  [check('text', 'Text is required').not().isEmpty()],
  addComment
);

module.exports = router; 