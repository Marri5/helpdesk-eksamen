const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://10.12.3.88:27017/helpdesk');

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Sample tickets
const tickets = [
  {
    title: 'Cannot access email',
    description: 'I am unable to access my work email since this morning. I have tried restarting my computer but it did not help.',
    category: 'Account',
    status: 'Open',
    priority: 'High',
    // user will be set after user creation
  },
  {
    title: 'Need software installation',
    description: 'I need Adobe Photoshop installed on my workstation for a new project.',
    category: 'Software',
    status: 'Under arbeid',
    priority: 'Medium',
    // user will be set after user creation
  },
  {
    title: 'Printer not working',
    description: 'The office printer on the 2nd floor is showing an error message and will not print documents.',
    category: 'Hardware',
    status: 'Open',
    priority: 'Medium',
    // user will be set after user creation
  }
];

// Import data
const importData = async () => {
  try {
    // Clear current data
    await User.deleteMany();
    await Ticket.deleteMany();

    // Create users
    const createdUsers = await User.create(users);
    
    // Get regular user ID
    const regularUserId = createdUsers.find(user => user.role === 'user')._id;

    // Add user reference to tickets
    const ticketsWithUser = tickets.map(ticket => ({
      ...ticket,
      user: regularUserId
    }));

    // Create tickets
    await Ticket.create(ticketsWithUser);

    console.log('Data imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Ticket.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Decide what to do based on command
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete data');
  process.exit();
} 