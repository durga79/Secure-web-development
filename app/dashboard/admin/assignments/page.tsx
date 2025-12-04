'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  course?: {
    code: string;
    name: string;
  };
};

type Course = {
  id: string;
  code: string;
  name: string;
};

function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    courseId: '' 
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/courses')
      ]);

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.assignments);
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

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ title: '', description: '', dueDate: '', courseId: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
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
            <h1 className="text-4xl font-bold text-white">Assignment Management</h1>
            <p className="text-purple-200 mt-2">Manage all assignments across courses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            + Add Assignment
          </button>
        </div>

        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{assignment.title}</h3>
                    {assignment.course && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/50">
                        {assignment.course.code}
                      </span>
                    )}
                  </div>
                  <p className="text-purple-200 mb-3">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-300">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    {assignment.course && (
                      <span className="text-purple-300">
                        Course: {assignment.course.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center py-12 text-purple-300">
              No assignments found. Create one to get started!
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Add New Assignment</h2>
              </div>
              <form onSubmit={handleAddAssignment} className="p-6 space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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
                    Add Assignment
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

export default function AssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AssignmentsManagement />
    </ProtectedRoute>
  );
}

