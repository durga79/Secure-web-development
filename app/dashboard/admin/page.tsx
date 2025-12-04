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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Assignments</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalAssignments}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending Submissions</h3>
            <p className="text-3xl font-bold mt-2">{stats.pendingSubmissions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/admin/users"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Manage Users
              </Link>
              <Link
                href="/dashboard/admin/courses"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Manage Courses
              </Link>
              <Link
                href="/dashboard/admin/assignments"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Manage Assignments
              </Link>
              <Link
                href="/dashboard/admin/enrollments"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Manage Enrollments
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-500">No recent submissions</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentSubmissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-sm">{submission.assignment.title}</h3>
                    <p className="text-xs text-gray-600">
                      {submission.assignment.course.code} - {submission.student.name}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {submission.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

