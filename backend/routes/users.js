const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (role && !['user', 'admin', 'firstline', 'secondline'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role value' });
    }

    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role) userFields.role = role;

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 