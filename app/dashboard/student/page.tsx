'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  course: {
    id: string;
    code: string;
    name: string;
  };
  submission: {
    id: string;
    status: string;
    grade: number | null;
  } | null;
}

interface Submission {
  id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  assignment: {
    title: string;
    course: {
      code: string;
      name: string;
    };
  };
}

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<{ course: Course }[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.enrollments || []);
          setUpcomingAssignments(data.upcomingAssignments || []);
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
      <ProtectedRoute requiredRole="STUDENT">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            {enrollments.length === 0 ? (
              <p className="text-gray-500">No courses enrolled yet</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.course.id}
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <h3 className="font-semibold">{enrollment.course.code}</h3>
                    <p className="text-sm text-gray-600">{enrollment.course.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
            {upcomingAssignments.length === 0 ? (
              <p className="text-gray-500">No upcoming assignments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      {assignment.course.code} - {assignment.course.name}
                    </p>
                    {assignment.dueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {assignment.submission ? (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Submitted
                      </span>
                    ) : (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.assignment.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.assignment.course.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            submission.status === 'GRADED'
                              ? 'bg-green-100 text-green-800'
                              : submission.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.grade !== null ? `${submission.grade}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

