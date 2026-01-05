import React, { useEffect, useState } from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';

export const DocumentsPage = ({ admissionId, onNext }) => {
  const { admissionData, uploadDocument, deleteDocument, loading } = useAdmission();
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requiredDocs = [
    { type: 'admit_card', label: 'JEE Admit Card' },
    { type: 'aadhar_card', label: 'Aadhar Card' },
    { type: 'seat_allotment', label: 'Seat Allotment Letter' },
    { type: 'marksheet_10', label: '10th Marksheet' },
    { type: 'marksheet_12', label: '12th Marksheet' },
  ];

  useEffect(() => {
    if (admissionData.documents) {
      setUploadedDocs(admissionData.documents);
    }
  }, [admissionData.documents]);

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, JPG, or PNG.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setError('');
    const result = await uploadDocument(admissionId, docType, file);
    if (result.success) {
      setSuccess(`${docType} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const result = await deleteDocument(admissionId, docId);
      if (result.success) {
        setSuccess('Document deleted successfully!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.error);
      }
    }
  };

  const handleContinue = () => {
    const uploadedTypes = uploadedDocs.map((d) => d.type);
    const missingDocs = requiredDocs.filter((d) => !uploadedTypes.includes(d.type));

    if (missingDocs.length > 0) {
      setError(
        `Please upload all required documents. Missing: ${missingDocs
          .map((d) => d.label)
          .join(', ')}`
      );
      return;
    }

    onNext();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Stepper currentStep={2} />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Card>
        <h2 className="text-2xl font-bold text-primary mb-6">Step 2: Upload Documents</h2>

        <div className="bg-yellow-50 border-l-4 border-warning p-4 mb-6 rounded">
          <p className="text-sm text-gray-700">
            <strong>📌 Required Documents:</strong> Please upload all 5 required documents in PDF or JPG/PNG format (Max 10MB each)
          </p>
        </div>

        <div className="space-y-6">
          {requiredDocs.map((doc) => {
            const uploaded = uploadedDocs.find((d) => d.type === doc.type);
            return (
              <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  {doc.label} <span className="text-danger">*</span>
                </label>

                {!uploaded ? (
                  <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, doc.type)}
                      className="hidden"
                      id={`file-${doc.type}`}
                    />
                    <label htmlFor={`file-${doc.type}`} className="cursor-pointer">
                      <div className="text-4xl mb-2">📤</div>
                      <p className="font-semibold text-gray-700">Click to upload</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">PDF, JPG or PNG (Max 10MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-success">✅ {uploaded.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploaded.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(uploaded.id)}
                      className="px-4 py-2 bg-danger text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <Button variant="primary" onClick={handleContinue} disabled={loading}>
            {loading ? 'Checking...' : 'Continue to Payment'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
