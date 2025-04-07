import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
      <h1 className="text-4xl text-primary font-bold mb-4">
        <i className="fas fa-exclamation-triangle mr-2"></i> Page Not Found
      </h1>
      <p className="text-xl mb-6">Sorry, this page does not exist</p>
      <Link to="/" className="btn btn-primary">
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFound; 