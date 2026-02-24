import React from 'react';

export const FormGroup = ({ label, name, type = 'text', required, children, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          {...props}
        />
      )}
    </div>
  );
};

export const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClass = 'px-6 py-2 rounded-lg font-semibold transition-all duration-300';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'bg-secondary text-white hover:bg-red-600',
    success: 'bg-success text-white hover:bg-green-600',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Alert = ({ type = 'info', children, onClose }) => {
  const typeClass = {
    error: 'bg-red-50 border-l-4 border-danger text-danger',
    success: 'bg-green-50 border-l-4 border-success text-success',
    warning: 'bg-yellow-50 border-l-4 border-warning text-yellow-800',
    info: 'bg-blue-50 border-l-4 border-primary text-primary',
  };

  return (
    <div className={`p-4 rounded mb-4 ${typeClass[type]}`}>
      <div className="flex justify-between items-center">
        <span>{children}</span>
        {onClose && (
          <button onClick={onClose} className="ml-4 font-bold">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export const Loading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};
