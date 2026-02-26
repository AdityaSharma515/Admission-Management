import React, { useEffect, useState } from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';
import { API_ORIGIN } from '../api/http';

export const DocumentsPage = ({ onNext }) => {
  const { admissionData, uploadDocument, deleteDocument, loading } = useAdmission();
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [latestDocsByType, setLatestDocsByType] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requiredDocs = [
    { type: 'PASSPORT_PHOTO', label: 'Upload recent passport size photograph' },
    { type: 'PROVISIONAL_ADMISSION_LETTER', label: 'Provisional Admission Letter (Downloaded from JoSAA/CSAB website)' },
    { type: 'X_MARKSHEET', label: 'X Class Pass Certificate / X Marksheet' },
    { type: 'XII_MARKSHEET', label: 'Intermediate / X + 2 Pass Certificate / X + 2 Marksheet' },
    { type: 'JEE_RANK_CARD', label: 'JEE Mains Rank Card (Original/Downloaded) / JEE Main Admit Card (Original/Downloaded)' },
    {
      type: 'CATEGORY_CERTIFICATE',
      label: 'SC/ST/OBC-NCL/PwD/EWS certificate',
      hint: 'As per the format available in JoSAA portal (if applicable)'
    },
    { type: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate as per the JoSAA format' },
    { type: 'UNDERTAKING', label: 'UNDERTAKING BY THE CANDIDATE (Annexure – 1)' },
    {
      type: 'CLASS_XII_ELIGIBILITY_FORM',
      label: 'Performance in Class XII (or equivalent) examination (Annexure – 2)',
      hint: 'Fill this form only if the student does not meet the eligibility criteria'
    },
    { type: 'AADHAR_CARD', label: 'Photo ID Proof - Aadhaar Card' },
  ];

  useEffect(() => {
    const docs = admissionData.documents || [];
    setUploadedDocs(docs);

    // Backend allows multiple uploads per type; show the most recent one.
    const byType = {};
    for (const d of docs) {
      if (!d?.type) continue;
      const prev = byType[d.type];
      const prevTime = prev?.uploadedAt ? new Date(prev.uploadedAt).getTime() : 0;
      const nextTime = d?.uploadedAt ? new Date(d.uploadedAt).getTime() : 0;
      if (!prev || nextTime >= prevTime) {
        byType[d.type] = d;
      }
    }
    setLatestDocsByType(byType);
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

    // Validate file size (5MB max, per backend multer limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setError('');
    const result = await uploadDocument(null, docType, file);
    if (result.success) {
      const label = requiredDocs.find((d) => d.type === docType)?.label || docType;
      setSuccess(`${label} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const result = await deleteDocument(null, docId);
      if (result.success) {
        setSuccess('Document deleted successfully!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.error);
      }
    }
  };

  const handleContinue = () => {
    const uploadedTypes = Object.keys(latestDocsByType || {});
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
            <strong>📌 Required Documents:</strong> Please upload all required documents in PDF or JPG/PNG format (Max 5MB each)
          </p>
        </div>

        <div className="space-y-6">
          {requiredDocs.map((doc) => {
            const uploaded = latestDocsByType?.[doc.type];
            const uploadsOfType = uploadedDocs.filter((d) => d.type === doc.type);
            const rejected = uploaded?.status === 'REJECTED';
            return (
              <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  {doc.label} <span className="text-danger">*</span>
                </label>

                {doc.hint && (
                  <p className="text-xs text-gray-500 mb-3">{doc.hint}</p>
                )}

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
                      <p className="text-xs text-gray-400 mt-2">PDF, JPG or PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div
                    className={`border rounded-lg p-4 flex justify-between items-center gap-4 ${
                      rejected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${rejected ? 'text-danger' : 'text-success'}`}>
                        {rejected ? '❌' : '✅'} {uploaded.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {uploaded.status}
                      </p>
                      {uploadsOfType.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total uploads for this document: {uploadsOfType.length} (showing latest)
                        </p>
                      )}
                      {uploaded.remark && (
                        <p className="text-sm text-gray-600 mt-1">Remark: {uploaded.remark}</p>
                      )}
                      {uploaded.verifiedBy?.email && (
                        <p className="text-xs text-gray-500 mt-1">Verified by: {uploaded.verifiedBy.email}</p>
                      )}
                      {rejected && (
                        <p className="text-sm text-gray-700 mt-2">
                          This document was rejected. Please re-upload the corrected document here.
                        </p>
                      )}
                      {uploaded.fileUrl && (
                        <a
                          href={`${API_ORIGIN}${uploaded.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-semibold hover:underline"
                        >
                          View uploaded file
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, doc.type)}
                        className="hidden"
                        id={`file-reupload-${doc.type}`}
                      />
                      <label
                        htmlFor={`file-reupload-${doc.type}`}
                        className={`px-4 py-2 rounded transition text-center cursor-pointer ${
                          rejected
                            ? 'bg-primary text-white hover:bg-blue-700'
                            : 'bg-secondary text-white hover:bg-red-600'
                        }`}
                      >
                        {rejected ? 'Reupload' : 'Upload New'}
                      </label>
                      <button
                        onClick={() => handleDeleteDocument(uploaded.id)}
                        className="px-4 py-2 bg-danger text-white rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
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
