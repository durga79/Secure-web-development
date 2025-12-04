'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalAssignments: number;
  pendingSubmissions: number;
}

interface Submission {
  id: string;
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment: {
    title: string;
    course: {
      code: string;
      name: string;
    };
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || stats);
          setRecentSubmissions(data.recentSubmissions || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage your student portal from here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-blue-100 text-sm font-medium">Total Students</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalStudents}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">👨‍🎓</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-purple-100 text-sm font-medium">Total Courses</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalCourses}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-100 text-sm font-medium">Total Assignments</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalAssignments}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-orange-100 text-sm font-medium">Pending Submissions</h3>
                  <p className="text-4xl font-bold mt-2">{stats.pendingSubmissions}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">⏳</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/admin/users"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Users</h3>
                      <p className="text-blue-100 text-sm">Manage student accounts</p>
                    </div>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/admin/courses"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Courses</h3>
                      <p className="text-purple-100 text-sm">Create and edit courses</p>
                    </div>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/admin/assignments"
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Assignments</h3>
                      <p className="text-green-100 text-sm">Manage assignments</p>
                    </div>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/admin/enrollments"
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Enrollments</h3>
                      <p className="text-orange-100 text-sm">Enroll students</p>
                    </div>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-2">No recent submissions</p>
                  <p className="text-sm text-gray-500">Activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-4 border-blue-500 hover:from-blue-50 hover:to-white transition-colors"
                    >
                      <h3 className="font-bold text-sm text-gray-800">{submission.assignment.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {submission.assignment.course.code} • {submission.student.name}
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {submission.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

