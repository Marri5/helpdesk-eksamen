import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/AlertContext';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const TicketForm = () => {
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    subject: '',
    yearOfStudy: ''
  });

  const { title, description, category, priority, subject, yearOfStudy } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ticketData = {
        ...formData,
        submitter: user._id,
        status: 'new',
        assignedTo: null
      };
      
      console.log('Creating ticket with data:', ticketData);
      const res = await axios.post('/api/tickets', ticketData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Ticket created successfully:', res.data);
      setAlert('Ticket created successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating ticket:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      setAlert(error.response?.data?.message || 'Error creating ticket', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Support Ticket</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the subject/course name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yearOfStudy">
                Year of Study
              </label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={yearOfStudy}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="first_year">First Year</option>
                <option value="second_year">Second Year</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Academic Support">Academic Support</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Course Material">Course Material</option>
                <option value="Exam Accommodation">Exam Accommodation</option>
                <option value="Study Group">Study Group</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Detailed description of your issue"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketForm; 