import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';

const TicketForm = () => {
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  const { title, description, category } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!title || !description || !category) {
      setAlert('Please fill in all fields', 'danger');
      return;
    }

    try {
      await axios.post('/tickets', formData);
      setAlert('Ticket created successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error creating ticket';
      setAlert(errorMsg, 'danger');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 m-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4><i className="fas fa-ticket-alt"></i> Submit a New Ticket</h4>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    className="form-control"
                    id="category"
                    name="category"
                    value={category}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                    <option value="Account">Account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="5"
                    value={description}
                    onChange={onChange}
                    placeholder="Detailed description of the issue"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary">
                    Submit Ticket
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm; 