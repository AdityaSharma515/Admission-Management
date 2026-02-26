import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, Alert, Loading, Button, FormGroup } from '../components/FormComponents';
import { useAuth } from '../hooks/useContext';
import { approveAllDocuments, getVerifierStudent, getVerifierStudents, setFinalDecision, verifyDocument } from '../api/verifier';
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

  const [selectedDocIds, setSelectedDocIds] = useState(() => new Set());
  const [bulkRemark, setBulkRemark] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [previewDocId, setPreviewDocId] = useState('');
  const [previewSize, setPreviewSize] = useState('normal'); // normal | large

  const [studentsPaneMode, setStudentsPaneMode] = useState('normal'); // normal | wide | collapsed

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

  useEffect(() => {
    // Reset per-student UI state when switching students.
    setSelectedDocIds(new Set());
    setBulkRemark('');
    setPreviewDocId('');
    setPreviewSize('normal');
  }, [selectedStudentId]);

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

  const handleBulkApproveSelected = async () => {
    if (!token || !selectedStudentId) return;
    setError('');
    setSuccess('');

    const ids = Array.from(selectedDocIds);
    if (ids.length === 0) {
      setError('Please select documents to approve.');
      return;
    }

    setBulkLoading(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    try {
      for (const id of ids) {
        try {
          await verifyDocument(token, id, { status: 'APPROVED', remark: bulkRemark || undefined });
          successCount += 1;
        } catch (err) {
          failCount += 1;
          lastError = getErrorMessage(err);
        }
      }

      const s = await getVerifierStudent(token, selectedStudentId);
      setSelectedStudent(s);

      if (successCount > 0) {
        setSuccess(`Approved ${successCount} document(s).`);
      }
      if (failCount > 0) {
        setError(lastError || `Failed to approve ${failCount} document(s).`);
      }

      setSelectedDocIds(new Set());
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleApproveAllForStudent = async () => {
    if (!token || !selectedStudentId) return;
    setError('');
    setSuccess('');
    setBulkLoading(true);
    try {
      await approveAllDocuments(token, selectedStudentId, bulkRemark || undefined);
      const s = await getVerifierStudent(token, selectedStudentId);
      setSelectedStudent(s);
      setSelectedDocIds(new Set());
      setSuccess('Approved all documents.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBulkLoading(false);
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

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex gap-6 items-start">
            {studentsPaneMode !== 'collapsed' && (
              <div className={studentsPaneMode === 'wide' ? 'w-[420px] shrink-0' : 'w-[320px] shrink-0'}>
                <Card>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-primary">Assigned Students</h2>
                      <p className="text-xs text-gray-500">Total: {students.length}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setStudentsPaneMode((m) => (m === 'wide' ? 'normal' : 'wide'))}
                      >
                        {studentsPaneMode === 'wide' ? 'Narrow' : 'Wider'}
                      </Button>
                      <Button variant="outline" onClick={() => setStudentsPaneMode('collapsed')}>
                        Hide
                      </Button>
                    </div>
                  </div>

                  {students.length === 0 ? (
                    <p className="text-sm text-gray-600">No assigned students found.</p>
                  ) : (
                    <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
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
                          <div className="font-semibold text-gray-800 truncate">{s.fullName || 'Unnamed Student'}</div>
                          <div className="text-xs text-gray-500">Status: {s.status}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <Card>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h2 className="text-lg font-bold text-primary">Student Details</h2>
                  {studentsPaneMode === 'collapsed' && (
                    <Button variant="outline" onClick={() => setStudentsPaneMode('normal')}>
                      Show Students
                    </Button>
                  )}
                </div>

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
                      <div>
                        <div className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
                          <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Bulk remark (optional)</label>
                              <input
                                value={bulkRemark}
                                onChange={(e) => setBulkRemark(e.target.value)}
                                placeholder="Remark applied to approved documents"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const ids = documents.map((d) => d.id).filter(Boolean);
                                  setSelectedDocIds(new Set(ids));
                                }}
                                disabled={bulkLoading}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedDocIds(new Set())}
                                disabled={bulkLoading}
                              >
                                Clear
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleBulkApproveSelected}
                                disabled={bulkLoading || selectedDocIds.size === 0}
                              >
                                {bulkLoading ? 'Approving...' : `Approve Selected (${selectedDocIds.size})`}
                              </Button>
                              <Button
                                variant="success"
                                onClick={handleApproveAllForStudent}
                                disabled={bulkLoading}
                              >
                                {bulkLoading ? 'Approving...' : 'Approve All'}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-auto border border-gray-200 rounded-lg">
                          <table className="min-w-full text-sm">
                            <thead className="bg-white">
                              <tr className="text-left border-b">
                                <th className="py-2 px-3 w-10">
                                  <input
                                    type="checkbox"
                                    checked={documents.length > 0 && selectedDocIds.size === documents.length}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedDocIds(new Set(documents.map((d) => d.id).filter(Boolean)));
                                      } else {
                                        setSelectedDocIds(new Set());
                                      }
                                    }}
                                  />
                                </th>
                                <th className="py-2 px-3">Type</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Uploaded</th>
                                <th className="py-2 px-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documents.map((doc) => (
                                <DocumentTableRow
                                  key={doc.id}
                                  doc={doc}
                                  checked={selectedDocIds.has(doc.id)}
                                  onToggleChecked={() => {
                                    setSelectedDocIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(doc.id)) next.delete(doc.id);
                                      else next.add(doc.id);
                                      return next;
                                    });
                                  }}
                                  onSave={handleVerify}
                                  isPreviewOpen={previewDocId === doc.id}
                                  previewSize={previewSize}
                                  onTogglePreview={() =>
                                    setPreviewDocId((prev) => (prev === doc.id ? '' : doc.id))
                                  }
                                  onClosePreview={() => setPreviewDocId('')}
                                  onTogglePreviewSize={() =>
                                    setPreviewSize((s) => (s === 'normal' ? 'large' : 'normal'))
                                  }
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
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

const DocumentTableRow = ({
  doc,
  checked,
  onToggleChecked,
  onSave,
  isPreviewOpen,
  previewSize,
  onTogglePreview,
  onClosePreview,
  onTogglePreviewSize
}) => {
  const [status, setStatus] = useState(doc.status || 'PENDING');
  const [remark, setRemark] = useState(doc.remark || '');

  useEffect(() => {
    setStatus(doc.status || 'PENDING');
    setRemark(doc.remark || '');
  }, [doc.id, doc.status, doc.remark]);

  return (
    <>
      <tr className="border-b last:border-b-0 align-top">
        <td className="py-2 px-3">
          <input type="checkbox" checked={checked} onChange={onToggleChecked} />
        </td>
        <td className="py-2 px-3">
          <div className="font-semibold text-gray-800">{doc.type}</div>
          {doc.transactionId && (
            <div className="text-xs text-gray-500">Txn: {doc.transactionId}</div>
          )}
          {typeof doc.amount !== 'undefined' && doc.amount !== null && (
            <div className="text-xs text-gray-500">Amount: {doc.amount}</div>
          )}
          {doc.fileUrl && (
            <a
              href={`${API_ORIGIN}${doc.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Open in new tab
            </a>
          )}
        </td>
        <td className="py-2 px-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">Current: {doc.status}</div>
        </td>
        <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">
          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
        </td>
        <td className="py-2 px-3">
          <div className="space-y-2">
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remark"
              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={onTogglePreview} disabled={!doc.fileUrl}>
                {isPreviewOpen ? 'Hide Preview' : 'Preview'}
              </Button>
              <Button variant="primary" onClick={() => onSave(doc.id, status, remark)}>
                Save
              </Button>
            </div>
          </div>
        </td>
      </tr>

      {isPreviewOpen && doc.fileUrl && (
        <tr className="border-b last:border-b-0">
          <td colSpan={5} className="px-3 pb-3">
            <div className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm font-semibold text-gray-800 truncate">Preview: {doc.type}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onTogglePreviewSize}>
                    {previewSize === 'normal' ? 'Bigger' : 'Normal'}
                  </Button>
                  <Button variant="outline" onClick={onClosePreview}>
                    Cancel
                  </Button>
                </div>
              </div>
              <DocumentPreview fileUrl={doc.fileUrl} size={previewSize} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const DocumentPreview = ({ fileUrl, size }) => {
  const url = `${API_ORIGIN}${fileUrl}`;
  const heightClass = size === 'large' ? 'h-[70vh]' : 'h-96';

  const isPdf = String(fileUrl).toLowerCase().endsWith('.pdf');
  const isImage = /\.(png|jpe?g)$/i.test(String(fileUrl));

  if (isImage) {
    return (
      <div className={`w-full ${heightClass} overflow-auto border border-gray-200 rounded-lg bg-white`}>
        <img src={url} alt="Document preview" className="w-full h-auto" />
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        title="Document preview"
        src={url}
        className={`w-full ${heightClass} border border-gray-200 rounded-lg bg-white`}
      />
    );
  }

  return (
    <div className="text-sm text-gray-600">
      Preview not supported for this file type. Use “Open in new tab”.
    </div>
  );
};
