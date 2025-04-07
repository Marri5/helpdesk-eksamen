const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
  getTicketStats
} = require('../controllers/ticket.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes need authentication
router.use(protect);

// Stats route - admin only
router.get('/stats', authorize('admin'), getTicketStats);

// Ticket routes - all authenticated users
router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicket)
  .put(updateTicket)
  .delete(deleteTicket);

// Comment routes
router.post('/:id/comments', addComment);

module.exports = router; 