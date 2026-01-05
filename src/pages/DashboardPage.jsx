import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useContext';
import { useAdmission } from '../hooks/useContext';
import { Navbar } from '../components/Navbar';
import { PersonalDetailsPage } from './PersonalDetailsPage';
import { DocumentsPage } from './DocumentsPage';
import { PaymentPage } from './PaymentPage';
import { StatusPage } from './StatusPage';

export const DashboardPage = () => {
  const { user, admissionId } = useAuth();
  const { admissionData, loadAdmissionData, loading } = useAdmission();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (admissionId) {
      loadAdmissionData(admissionId);
    }
  }, [admissionId, loadAdmissionData]);

  useEffect(() => {
    if (admissionData.admission) {
      setCurrentStep(admissionData.admission.step || 1);
    }
  }, [admissionData.admission]);

  if (loading && !admissionData.admission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-primary mb-4">📋 Steps</h3>
              <ul className="space-y-2">
                {[
                  { step: 1, label: 'Personal Details' },
                  { step: 2, label: 'Documents' },
                  { step: 3, label: 'Payment' },
                  { step: 4, label: 'Status' },
                ].map((item) => (
                  <li key={item.step}>
                    <button
                      onClick={() => {
                        if (item.step <= currentStep) {
                          setCurrentStep(item.step);
                        } else {
                          alert('Complete current step first!');
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded transition ${
                        currentStep === item.step
                          ? 'bg-primary text-white font-semibold'
                          : currentStep > item.step
                          ? 'bg-success text-white'
                          : 'bg-gray-100 text-gray-700 cursor-not-allowed'
                      }`}
                      disabled={item.step > currentStep}
                    >
                      {currentStep > item.step ? '✓' : item.step}. {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentStep === 1 && (
              <PersonalDetailsPage
                admissionId={admissionId}
                onNext={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <DocumentsPage
                admissionId={admissionId}
                onNext={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 3 && (
              <PaymentPage
                admissionId={admissionId}
                onNext={() => setCurrentStep(4)}
              />
            )}
            {currentStep === 4 && (
              <StatusPage
                admissionId={admissionId}
                onSubmit={() => setCurrentStep(4)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
