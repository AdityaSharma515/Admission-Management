import React, { useState, useEffect } from 'react';
import { useAdmission } from '../hooks/useContext';
import { Navbar } from '../components/Navbar';
import { PersonalDetailsPage } from './PersonalDetailsPage';
import { DocumentsPage } from './DocumentsPage';
import { PaymentPage } from './PaymentPage';
import { StatusPage } from './StatusPage';

export const DashboardPage = () => {
  const { admissionData, loadAdmissionData, loading } = useAdmission();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadAdmissionData();
  }, [loadAdmissionData]);

  useEffect(() => {
    const profile = admissionData.profile;
    const documents = admissionData.documents || [];
    const payment = admissionData.payment || {};

    const requiredDocTypes = [
      'PASSPORT_PHOTO',
      'PROVISIONAL_ADMISSION_LETTER',
      'AADHAR_CARD',
      'X_MARKSHEET',
      'XII_MARKSHEET'
    ];

    let nextStep = 1;

    if (profile?.id) {
      nextStep = 2;
    }

    const uploadedTypes = documents.map((d) => d.type);
    const docsComplete = requiredDocTypes.every((t) => uploadedTypes.includes(t));
    if (profile?.id && docsComplete) {
      nextStep = 3;
    }

    const paymentStatus = payment.payment_status || payment.status;
    if (paymentStatus === 'completed') {
      nextStep = 4;
    }

    if (profile?.status && profile.status !== 'DRAFT') {
      nextStep = 4;
    }

    setCurrentStep(nextStep);
  }, [admissionData.profile, admissionData.documents, admissionData.payment]);

  if (loading && !admissionData.profile) {
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
                onNext={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <DocumentsPage
                onNext={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 3 && (
              <PaymentPage
                onNext={() => setCurrentStep(4)}
              />
            )}
            {currentStep === 4 && (
              <StatusPage
                onSubmit={() => setCurrentStep(4)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
