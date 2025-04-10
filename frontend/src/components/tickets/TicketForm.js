import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TicketForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'low',
        category: 'technical'
    });
    const [error, setError] = useState(null);

    const { title, description, priority, category } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create ticket');
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user) {
        return <div>Please log in to create a ticket</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create New Ticket</h1>
                <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter ticket title"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={onChange}
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Describe your issue"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={priority}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="technical">Technical</option>
                            <option value="billing">Billing</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketForm; 