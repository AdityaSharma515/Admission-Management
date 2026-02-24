import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, Alert, Loading, Button, FormGroup } from '../components/FormComponents';
import { useAuth } from '../hooks/useContext';
import { getVerifierStudent, getVerifierStudents, setFinalDecision, verifyDocument } from '../api/verifier';
import { API_ORIGIN, getErrorMessage } from '../api/http';

const statusOptions = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'REJECTED', label: 'REJECTED' }
];

export const VerifierDashboardPage = () => {
  const { token, user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canAccess = user?.role === 'VERIFIER' || user?.role === 'ADMIN';

  useEffect(() => {
    let cancelled = false;

    async function loadList() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const list = await getVerifierStudents(token);
        if (cancelled) return;
        setStudents(Array.isArray(list) ? list : []);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadList();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (!token || !selectedStudentId) {
        setSelectedStudent(null);
        return;
      }
      setDetailsLoading(true);
      setError('');
      try {
        const s = await getVerifierStudent(token, selectedStudentId);
        if (cancelled) return;
        setSelectedStudent(s);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [token, selectedStudentId]);

  const documents = useMemo(() => {
    const docs = selectedStudent?.documents;
    return Array.isArray(docs) ? docs : [];
  }, [selectedStudent]);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Alert type="error">Access denied: Verifier/Admin role required.</Alert>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
    );
  }

  const handleVerify = async (docId, status, remark) => {
    if (!token) return;
    setError('');
    setSuccess('');
    try {
      await verifyDocument(token, docId, { status, remark });
      setSuccess('Document updated.');
      const s = await getVerifierStudent(token, selectedStudentId);
      setSelectedStudent(s);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleFinalDecision = async (decision) => {
    if (!token || !selectedStudentId) return;
    setError('');
    setSuccess('');
    try {
      await setFinalDecision(token, selectedStudentId, decision);
      setSuccess(`Final decision submitted: ${decision}`);
      const s = await getVerifierStudent(token, selectedStudentId);
      setSelectedStudent(s);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Verifier Dashboard</h1>
            <p className="text-sm text-gray-600">Verify submitted student documents</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
        </div>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-lg font-bold text-primary mb-4">Submitted Students</h2>
                {students.length === 0 ? (
                  <p className="text-sm text-gray-600">No submitted applications found.</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className={`w-full text-left px-3 py-2 rounded border transition ${
                          selectedStudentId === s.id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{s.fullName || 'Unnamed Student'}</div>
                        <div className="text-xs text-gray-500">Status: {s.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-lg font-bold text-primary mb-4">Student Details</h2>

                {!selectedStudentId ? (
                  <p className="text-sm text-gray-600">Select a student to review documents.</p>
                ) : detailsLoading ? (
                  <Loading />
                ) : !selectedStudent ? (
                  <Alert type="warning">Unable to load student details.</Alert>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.fullName}</div>
                      <div className="text-sm text-gray-500 mt-2">Current Status</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.status}</div>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <Button variant="success" onClick={() => handleFinalDecision('APPROVE')}>Approve</Button>
                      <Button variant="secondary" onClick={() => handleFinalDecision('REJECT')}>Reject</Button>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-3">Documents</h3>
                    {documents.length === 0 ? (
                      <p className="text-sm text-gray-600">No documents uploaded.</p>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <DocumentRow
                            key={doc.id}
                            doc={doc}
                            onSave={handleVerify}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentRow = ({ doc, onSave }) => {
  const [status, setStatus] = useState(doc.status || 'PENDING');
  const [remark, setRemark] = useState(doc.remark || '');

  useEffect(() => {
    setStatus(doc.status || 'PENDING');
    setRemark(doc.remark || '');
  }, [doc.id, doc.status, doc.remark]);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-gray-800">{doc.type}</div>
          <div className="text-xs text-gray-500">Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '-'}</div>
          {doc.fileUrl && (
            <a
              href={`${API_ORIGIN}${doc.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-semibold hover:underline"
            >
              View file
            </a>
          )}
        </div>
        <div className="text-xs text-gray-600">Current: {doc.status}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormGroup label="Status" name={`status-${doc.id}`} required>
          <select
            id={`status-${doc.id}`}
            name={`status-${doc.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup
          label="Remark"
          name={`remark-${doc.id}`}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Optional remark"
        />
      </div>

      <div className="flex justify-end mt-3">
        <Button variant="primary" onClick={() => onSave(doc.id, status, remark)}>
          Save
        </Button>
      </div>
    </div>
  );
};
