'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600">Welcome back! Here&apos;s your learning overview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
              </div>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-2">No courses enrolled yet</p>
                  <p className="text-sm text-gray-500">Contact your administrator to get enrolled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.course.id}
                      className="p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg hover:from-blue-100 transition-colors"
                    >
                      <h3 className="font-bold text-gray-800">{enrollment.course.code}</h3>
                      <p className="text-sm text-gray-600 mt-1">{enrollment.course.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Assignments</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📝</span>
                </div>
              </div>
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-2">No upcoming assignments</p>
                  <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.slice(0, 5).map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => router.push(`/dashboard/student/assignments/${assignment.id}`)}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.course.code} - {assignment.course.name}
                          </p>
                          {assignment.dueDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {assignment.submission ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            ✓ Submitted
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Submissions</h2>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No submissions yet</p>
                <p className="text-sm text-gray-500">Start by submitting your first assignment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {submission.assignment.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {submission.assignment.course.code}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              submission.status === 'GRADED'
                                ? 'bg-green-100 text-green-700'
                                : submission.status === 'SUBMITTED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {submission.grade !== null ? (
                            <span className="font-bold text-indigo-600">{submission.grade}%</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {submission.feedback ? (
                            <div className="group relative inline-block">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium cursor-help">
                                💬 View
                              </span>
                              <div className="invisible group-hover:visible absolute z-10 left-0 top-8 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
                                <div className="font-semibold mb-1">Feedback:</div>
                                <div className="max-h-32 overflow-y-auto">{submission.feedback}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No feedback</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

