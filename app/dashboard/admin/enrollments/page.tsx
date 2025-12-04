'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  course?: {
    code: string;
    name: string;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

function EnrollmentsManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ userId: '', courseId: '' });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, usersRes, coursesRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/users'),
        fetch('/api/courses')
      ]);

      if (enrollmentsRes.ok) {
        const data = await enrollmentsRes.json();
        setEnrollments(data.enrollments);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users.filter((u: User & { role: string }) => u.role === 'STUDENT'));
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ userId: '', courseId: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding enrollment:', error);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="text-purple-300 hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white">Enrollment Management</h1>
            <p className="text-purple-200 mt-2">Manage student course enrollments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            + Add Enrollment
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Enrolled On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">
                      {enrollment.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-purple-200">
                      {enrollment.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.course && (
                        <div>
                          <div className="text-white font-medium">{enrollment.course.code}</div>
                          <div className="text-purple-300 text-sm">{enrollment.course.name}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-purple-200">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {enrollments.length === 0 && (
            <div className="text-center py-12 text-purple-300">
              No enrollments found. Create one to get started!
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Add New Enrollment</h2>
              </div>
              <form onSubmit={handleAddEnrollment} className="p-6 space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Student</label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-slate-800 text-white">Select a student</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="bg-slate-800 text-white">
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-slate-800 text-white">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="bg-slate-800 text-white">
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Add Enrollment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EnrollmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <EnrollmentsManagement />
    </ProtectedRoute>
  );
}


