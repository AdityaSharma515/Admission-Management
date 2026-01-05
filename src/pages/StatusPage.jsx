import React from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';

export const StatusPage = ({ admissionId, onSubmit }) => {
  const { admissionData, submitAdmission, loading } = useAdmission();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const admission = admissionData.admission || {};
  const submission = admissionData.submission || {};
  const isSubmitted = submission.submission_status === 'submitted';

  const handleSubmit = async () => {
    if (
      window.confirm(
        'Are you sure you want to submit your admission form? You will not be able to edit details after submission.'
      )
    ) {
      setError('');
      setSuccess('');
      const result = await submitAdmission(admissionId);
      if (result.success) {
        setSuccess('Admission submitted successfully!');
        setTimeout(() => onSubmit?.(), 1500);
      } else {
        setError(result.error);
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Stepper currentStep={4} />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Card>
        <h2 className="text-2xl font-bold text-primary mb-6">Step 4: Submission Status</h2>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-success mb-2">Admission Submitted</h3>
            <p className="text-gray-600 mb-8">Your admission form has been successfully submitted.</p>

            <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Submission Status:</span>
                <span className="text-gray-600">{submission.submission_status}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Admin Status:</span>
                <span className="text-gray-600 capitalize">
                  {submission.admin_status?.replace('_', ' ')}
                </span>
              </div>
              {submission.admin_remarks && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Remarks:</span>
                  <span className="text-gray-600">{submission.admin_remarks}</span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="font-semibold text-gray-700">Submitted On:</span>
                <span className="text-gray-600">
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-primary mb-2">Ready to Submit</h3>
            <p className="text-gray-600 mb-8">
              All your details and documents are complete. Submit your admission form to complete the process.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Admission Form'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 bg-blue-50 border-l-4 border-primary p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>ℹ️ Note:</strong> Your admission status will be updated as your application is reviewed. You can check back here for updates.
        </p>
      </div>
    </div>
  );
};
