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

router.get('/', getTickets);

router.get('/stats', authorize('admin'), getTicketStats);

router.get('/:id', getTicket);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  createTicket
);

router.put('/:id', updateTicket);

router.put(
  '/:id/assign',
  authorize('admin', 'firstline', 'secondline'),
  [
    check('assignedTo', 'Assigned user ID is required').not().isEmpty(),
    check('supportLevel', 'Support level must be either firstline or secondline').isIn(['firstline', 'secondline'])
  ],
  assignTicket
);

router.delete('/:id', deleteTicket);

router.post(
  '/:id/comments',
  [check('text', 'Text is required').not().isEmpty()],
  addComment
);

module.exports = router; 