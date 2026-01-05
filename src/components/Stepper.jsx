import React from 'react';

export const Stepper = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Personal Details' },
    { number: 2, label: 'Documents' },
    { number: 3, label: 'Payment' },
    { number: 4, label: 'Status' },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                  currentStep > step.number
                    ? 'bg-success text-white'
                    : currentStep === step.number
                    ? 'bg-primary text-white scale-110'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span
                className={`text-sm text-center ${
                  currentStep >= step.number
                    ? 'text-primary font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 mb-6 ${
                  currentStep > step.number ? 'bg-success' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
