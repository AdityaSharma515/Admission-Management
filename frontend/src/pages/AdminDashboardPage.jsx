import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, Alert, Loading, Button } from '../components/FormComponents';
import { useAuth } from '../hooks/useContext';
import { getAllStudents, getAdminDashboard } from '../api/admin';
import { getErrorMessage } from '../api/http';

export const AdminDashboardPage = () => {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const [dashboard, allStudents] = await Promise.all([
          getAdminDashboard(token),
          getAllStudents(token)
        ]);
        if (cancelled) return;
        setStats(dashboard);
        setStudents(Array.isArray(allStudents) ? allStudents : []);
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

            <Card>
              <h2 className="text-lg font-bold text-primary mb-4">Students</h2>
              {students.length === 0 ? (
                <p className="text-sm text-gray-600">No students found.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Seat Source</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-4 whitespace-nowrap">{s.fullName || '-'}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{s.user?.email || '-'}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{s.status || '-'}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{s.seatSource || '-'}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{s.allottedCategory || '-'}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{s.allottedBranch || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
