import React from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';

export const StatusPage = ({ onSubmit, onGoToDocuments }) => {
  const { admissionData, submitAdmission, loading } = useAdmission();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const profile = admissionData.profile;
  const status = profile?.status || 'DRAFT';
  const isSubmitted = status !== 'DRAFT';

  const rejectedDocs = React.useMemo(() => {
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

    return Array.from(latestByType.values())
      .filter((d) => d?.status === 'REJECTED')
      .sort((a, b) => String(a.type || '').localeCompare(String(b.type || '')));
  }, [admissionData.documents]);

  const handleSubmit = async () => {
    if (
      window.confirm(
        'Are you sure you want to submit your admission form? You will not be able to edit details after submission.'
      )
    ) {
      setError('');
      setSuccess('');
      const result = await submitAdmission(null);
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

        {rejectedDocs.length > 0 && (
          <div className="mb-6">
            <Alert type="error">
              <div className="font-semibold mb-1">Some documents were rejected by the verifier.</div>
              <div className="text-sm">Please reupload the rejected documents from the Documents step.</div>
            </Alert>

            <div className="mt-3 overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-3">Document</th>
                    <th className="py-2 px-3">Remark</th>
                    <th className="py-2 px-3">Rejected By</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedDocs.map((d) => (
                    <tr key={d.id || d.type} className="border-b last:border-b-0">
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-gray-800">{d.type}</td>
                      <td className="py-2 px-3">{d.remark || '-'}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{d.verifiedBy?.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {typeof onGoToDocuments === 'function' && (
              <div className="mt-4 flex justify-end">
                <Button variant="primary" onClick={onGoToDocuments}>
                  Go to Documents (Reupload)
                </Button>
              </div>
            )}
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-success mb-2">Application Status</h3>
            <p className="text-gray-600 mb-8">Your application is currently: <span className="font-semibold">{status}</span></p>

            <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Current Status:</span>
                <span className="text-gray-600">{status}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-semibold text-gray-700">Last Updated:</span>
                <span className="text-gray-600">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '-'}
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
