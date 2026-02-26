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

  const rejectedDocsCount = React.useMemo(() => {
    const documents = Array.isArray(admissionData.documents) ? admissionData.documents : [];
    const latestByType = new Map();
    for (const d of documents) {
      if (!d?.type) continue;
      const key = d.type;
      const current = latestByType.get(key);
      const dTime = new Date(d.uploadedAt || d.createdAt || 0).getTime();
      const cTime = new Date(current?.uploadedAt || current?.createdAt || 0).getTime();
      if (!current || dTime >= cTime) latestByType.set(key, d);
    }
    let count = 0;
    for (const doc of latestByType.values()) {
      if (doc?.status === 'REJECTED') count += 1;
    }
    return count;
  }, [admissionData.documents]);

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
                  { step: 2, label: 'Documents', rejectedCount: rejectedDocsCount },
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
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          {maxStepUnlocked > item.step ? '✓' : item.step}. {item.label}
                        </span>
                        {item.step === 2 && (item.rejectedCount || 0) > 0 && (
                          <span className="text-xs font-semibold bg-danger text-white px-2 py-0.5 rounded-full">
                            Rejected: {item.rejectedCount}
                          </span>
                        )}
                      </div>
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
                onGoToDocuments={() => setCurrentStep(2)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
