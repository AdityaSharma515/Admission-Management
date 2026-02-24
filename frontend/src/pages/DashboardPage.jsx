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
  const [maxStepUnlocked, setMaxStepUnlocked] = useState(1);

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
      'X_MARKSHEET',
      'XII_MARKSHEET',
      'JEE_RANK_CARD',
      'CATEGORY_CERTIFICATE',
      'MEDICAL_CERTIFICATE',
      'INSTITUTE_FEE_RECEIPT',
      'HOSTEL_FEE_RECEIPT',
      'UNDERTAKING',
      'CLASS_XII_ELIGIBILITY_FORM',
      'AADHAR_CARD'
    ];

    const uploadedTypes = documents.map((d) => d.type);
    const docsComplete = requiredDocTypes.every((t) => uploadedTypes.includes(t));
    const paymentStatus = payment.payment_status || payment.status;
    let computedMaxStep = 1;

    if (profile?.id) {
      computedMaxStep = 2;
    }

    if (profile?.id && docsComplete) {
      computedMaxStep = 3;
    }

    if (paymentStatus === 'completed') {
      computedMaxStep = 4;
    }

    if (profile?.status && profile.status !== 'DRAFT') {
      computedMaxStep = 4;
    }

    setMaxStepUnlocked(computedMaxStep);

    // Keep user on their current tab; only correct if they are beyond what is unlocked.
    setCurrentStep((prev) => {
      if (prev > computedMaxStep) return computedMaxStep;
      // On refresh / first load: show documents if profile exists.
      if (prev === 1 && profile?.id && computedMaxStep < 4) return 2;
      // If application is submitted/processed, always show Status.
      if (computedMaxStep === 4 && prev < 4) return 4;
      return prev;
    });
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
                        if (item.step <= maxStepUnlocked) {
                          setCurrentStep(item.step);
                        } else {
                          alert('Complete current step first!');
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded transition ${
                        currentStep === item.step
                          ? 'bg-primary text-white font-semibold'
                          : maxStepUnlocked > item.step
                          ? 'bg-success text-white'
                          : 'bg-gray-100 text-gray-700 cursor-not-allowed'
                      }`}
                      disabled={item.step > maxStepUnlocked}
                    >
                      {maxStepUnlocked > item.step ? '✓' : item.step}. {item.label}
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
