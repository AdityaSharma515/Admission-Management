import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, Alert, Loading, Button } from '../components/FormComponents';
import { useAuth } from '../hooks/useContext';
import {
  assignVerifier,
  createVerifier,
  getAllStudents,
  getAdminDashboard,
  getStudentDetails,
  listAssignments
} from '../api/admin';
import { API_ORIGIN, getErrorMessage } from '../api/http';

export const AdminDashboardPage = () => {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [createdVerifiers, setCreatedVerifiers] = useState([]);
  const [selectedVerifierId, setSelectedVerifierId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => new Set());
  const [selectionAnchorIndex, setSelectionAnchorIndex] = useState(null);

  const [showCreateVerifierModal, setShowCreateVerifierModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createResult, setCreateResult] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  const [rejectedStudent, setRejectedStudent] = useState(null);
  const [rejectedDocs, setRejectedDocs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const [dashboard, allStudents, assignmentRows] = await Promise.all([
          getAdminDashboard(token),
          getAllStudents(token),
          listAssignments(token)
        ]);
        if (cancelled) return;
        setStats(dashboard);
        setStudents(Array.isArray(allStudents) ? allStudents : []);
        setAssignments(Array.isArray(assignmentRows) ? assignmentRows : []);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const assignmentVerifierByStudentId = new Map(
    (Array.isArray(assignments) ? assignments : [])
      .filter((row) => row && row.id)
      .map((row) => [row.id, row.verifier || null])
  );

  const assignmentDocsByStudentId = new Map(
    (Array.isArray(assignments) ? assignments : [])
      .filter((row) => row && row.id)
      .map((row) => [row.id, Array.isArray(row.documents) ? row.documents : []])
  );

  const verifiers = React.useMemo(() => {
    const fromAssignments = (Array.isArray(assignments) ? assignments : [])
      .map((row) => row?.verifier)
      .filter(Boolean);

    const all = [...fromAssignments, ...(Array.isArray(createdVerifiers) ? createdVerifiers : [])];
    const seen = new Set();
    const unique = [];

    for (const v of all) {
      if (!v?.id || seen.has(v.id)) continue;
      seen.add(v.id);
      unique.push(v);
    }

    unique.sort((a, b) => String(a.email || '').localeCompare(String(b.email || '')));
    return unique;
  }, [assignments, createdVerifiers]);

  const clearSelection = () => {
    setSelectedStudentIds(new Set());
    setSelectionAnchorIndex(null);
  };

  const handleStudentClick = (index, studentId) => {
    setError('');
    setSuccess('');
    setCreateResult(null);

    if (selectionAnchorIndex === null) {
      setSelectionAnchorIndex(index);
      setSelectedStudentIds(new Set([studentId]));
      return;
    }

    const start = Math.min(selectionAnchorIndex, index);
    const end = Math.max(selectionAnchorIndex, index);
    const ids = students.slice(start, end + 1).map((s) => s.id).filter(Boolean);
    setSelectedStudentIds(new Set(ids));
    setSelectionAnchorIndex(null);
  };

  const handleCreateVerifier = async () => {
    setError('');
    setSuccess('');
    setCreateResult(null);

    if (!token) {
      setError('Not authenticated');
      return;
    }

    if (!createEmail) {
      setError('Verifier email is required');
      return;
    }

    setActionLoading(true);
    try {
      const result = await createVerifier(token, {
        email: createEmail,
        password: createPassword || undefined
      });

      const created = {
        id: result?.userId,
        email: createEmail
      };

      setCreatedVerifiers((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        if (created.id && !next.some((v) => v.id === created.id)) {
          next.push(created);
        }
        return next;
      });

      setSelectedVerifierId(result?.userId || '');
      setCreateResult({
        email: createEmail,
        userId: result?.userId,
        password: result?.password
      });
      setSuccess('Verifier created successfully');
      setCreateEmail('');
      setCreatePassword('');
      setShowCreateVerifierModal(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSelected = async () => {
    setError('');
    setSuccess('');
    setCreateResult(null);

    if (!token) {
      setError('Not authenticated');
      return;
    }

    if (!selectedVerifierId) {
      setError('Please select a verifier');
      return;
    }

    const studentIds = Array.from(selectedStudentIds);
    if (studentIds.length === 0) {
      setError('Please select students');
      return;
    }

    const alreadyAssignedToOther = studentIds
      .map((id) => ({ id, verifier: assignmentVerifierByStudentId.get(id) }))
      .filter((row) => row.verifier?.id && row.verifier.id !== selectedVerifierId);

    if (alreadyAssignedToOther.length > 0) {
      const ok = window.confirm(
        `${alreadyAssignedToOther.length} selected student(s) are already assigned to another verifier.\n\nClick OK to reassign to the selected verifier, or Cancel to stop.`
      );
      if (!ok) return;
    }

    setActionLoading(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    try {
      for (const studentId of studentIds) {
        try {
          await assignVerifier(token, { studentId, verifierId: selectedVerifierId });
          successCount += 1;
        } catch (err) {
          failCount += 1;
          lastError = getErrorMessage(err);
        }
      }

      if (successCount > 0) {
        setSuccess(`Assigned verifier to ${successCount} student(s).`);
      }
      if (failCount > 0) {
        setError(lastError || `Failed to assign ${failCount} student(s).`);
      }

      // Refresh assignment data so the right panel stays accurate.
      const assignmentRows = await listAssignments(token);
      setAssignments(Array.isArray(assignmentRows) ? assignmentRows : []);
      clearSelection();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectedModal = async (studentId) => {
    if (!token || !studentId) return;
    setError('');
    setSuccess('');
    setRejectedDocs([]);
    setRejectedStudent(null);
    setShowRejectedModal(true);
    setRejectedLoading(true);
    try {
      const details = await getStudentDetails(token, studentId);
      setRejectedStudent(details);
      const docs = Array.isArray(details?.documents) ? details.documents : [];
      setRejectedDocs(docs.filter((d) => d?.status === 'REJECTED'));
    } catch (err) {
      setError(getErrorMessage(err));
      setShowRejectedModal(false);
    } finally {
      setRejectedLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Alert type="error">Access denied: Admin role required.</Alert>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage students and track admission status</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
        </div>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-primary">{stats?.total ?? '-'}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Approved</div>
                <div className="text-2xl font-bold text-success">{stats?.approved ?? '-'}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Rejected</div>
                <div className="text-2xl font-bold text-danger">{stats?.rejected ?? '-'}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Pending</div>
                <div className="text-2xl font-bold text-warning">{stats?.pending ?? '-'}</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-primary">Students</h2>
                    <p className="text-xs text-gray-600">
                      Click student no. 2 then 10 to auto-select 2–10.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-600">Selected: {selectedStudentIds.size}</div>
                    <Button variant="outline" onClick={clearSelection} disabled={actionLoading}>
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAssignSelected}
                      disabled={actionLoading || !selectedVerifierId || selectedStudentIds.size === 0}
                    >
                      {actionLoading ? 'Assigning...' : 'Assign Verifier'}
                    </Button>
                  </div>
                </div>

                {students.length === 0 ? (
                  <p className="text-sm text-gray-600">No students found.</p>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2 pr-4">No.</th>
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Assigned Verifier</th>
                          <th className="py-2 pr-4">Rejected Docs</th>
                          <th className="py-2 pr-4">Branch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const isSelected = selectedStudentIds.has(s.id);
                          const verifier = assignmentVerifierByStudentId.get(s.id);
                          const docs = assignmentDocsByStudentId.get(s.id) || [];
                          const rejectedCount = docs.filter((d) => d?.status === 'REJECTED').length;
                          return (
                            <tr
                              key={s.id}
                              className={`border-b last:border-b-0 cursor-pointer ${
                                isSelected ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handleStudentClick(idx, s.id)}
                            >
                              <td className="py-2 pr-4 whitespace-nowrap font-semibold text-gray-700">{idx + 1}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{s.fullName || '-'}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{s.user?.email || '-'}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{s.status || '-'}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{verifier?.email || '-'}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">
                                {rejectedCount > 0 ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRejectedModal(s.id);
                                    }}
                                    className="text-danger font-semibold hover:underline"
                                  >
                                    {rejectedCount} (view)
                                  </button>
                                ) : (
                                  <span className="text-gray-500">0</span>
                                )}
                              </td>
                              <td className="py-2 pr-4 whitespace-nowrap">{s.allottedBranch || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-primary mb-4">Verifiers</h2>

                <div className="mb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-gray-800">Create Verifier</div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setCreateResult(null);
                        setCreateEmail('');
                        setCreatePassword('');
                        setShowCreateVerifierModal(true);
                      }}
                      disabled={actionLoading}
                    >
                      New
                    </Button>
                  </div>

                  {createResult && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <div className="font-semibold text-gray-800 mb-1">Created</div>
                      <div className="text-gray-700">Email: {createResult.email}</div>
                      <div className="text-gray-700">User ID: {createResult.userId || '-'}</div>
                      <div className="text-gray-700">Temp Password: {createResult.password || '-'}</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-800">Verifier List</div>
                    <div className="text-xs text-gray-600">Selected: {selectedVerifierId ? 'Yes' : 'No'}</div>
                  </div>

                  {verifiers.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No verifiers found yet. Create one above.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                      {verifiers.map((v) => {
                        const selected = v.id === selectedVerifierId;
                        return (
                          <button
                            key={v.id}
                            onClick={() =>
                              setSelectedVerifierId((prev) => (prev === v.id ? '' : v.id))
                            }
                            className={`w-full text-left border rounded-lg p-3 transition ${
                              selected
                                ? 'border-primary bg-blue-50'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-sm font-semibold text-gray-800 truncate">{v.email || v.id}</div>
                            <div className="text-xs text-gray-500 truncate">{v.id}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {showCreateVerifierModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => {
                    if (actionLoading) return;
                    setShowCreateVerifierModal(false);
                  }}
                />

                <div className="relative w-full max-w-lg">
                  <Card>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary">Create Verifier</h3>
                        <p className="text-xs text-gray-600">Admin-only action</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateVerifierModal(false)}
                        disabled={actionLoading}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                          value={createEmail}
                          onChange={(e) => setCreateEmail(e.target.value)}
                          placeholder="verifier@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password (optional)</label>
                        <input
                          value={createPassword}
                          onChange={(e) => setCreatePassword(e.target.value)}
                          placeholder="Leave empty to auto-generate"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateVerifierModal(false)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleCreateVerifier}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {showRejectedModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => {
                    if (rejectedLoading) return;
                    setShowRejectedModal(false);
                  }}
                />

                <div className="relative w-full max-w-3xl">
                  <Card>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary">Rejected Documents</h3>
                        <p className="text-xs text-gray-600">
                          {rejectedStudent?.fullName || '-'} ({rejectedStudent?.user?.email || '-'})
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectedModal(false)}
                        disabled={rejectedLoading}
                      >
                        Close
                      </Button>
                    </div>

                    {rejectedLoading ? (
                      <Loading />
                    ) : rejectedDocs.length === 0 ? (
                      <Alert type="warning">No rejected documents found for this student.</Alert>
                    ) : (
                      <div className="overflow-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="py-2 px-3">Type</th>
                              <th className="py-2 px-3">Remark</th>
                              <th className="py-2 px-3">Rejected By</th>
                              <th className="py-2 px-3">Document</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rejectedDocs.map((d) => (
                              <tr key={d.id} className="border-b last:border-b-0">
                                <td className="py-2 px-3 whitespace-nowrap font-semibold text-gray-800">{d.type}</td>
                                <td className="py-2 px-3">{d.remark || '-'}</td>
                                <td className="py-2 px-3 whitespace-nowrap">{d.verifiedBy?.email || '-'}</td>
                                <td className="py-2 px-3 whitespace-nowrap">
                                  {d.fileUrl ? (
                                    <a
                                      href={`${API_ORIGIN}${d.fileUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary font-semibold hover:underline"
                                    >
                                      View
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
