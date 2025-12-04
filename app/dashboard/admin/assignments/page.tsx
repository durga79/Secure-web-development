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
  fileUrl?: string;
  fileName?: string;
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

type Submission = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
};

function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ grade: 0, feedback: '' });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; fileName: string } | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    courseId: '',
    fileUrl: '',
    fileName: ''
  });
  const [editFormData, setEditFormData] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    courseId: '',
    fileUrl: '',
    fileName: ''
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'assignment');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        // Store uploaded file info separately, don't populate the external link field
        setSelectedFile({
          name: file.name,
          url: data.fileUrl,
          fileName: data.fileName,
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to upload file');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use uploaded file data if available, otherwise use external link
      const submissionData = {
        ...formData,
        fileUrl: selectedFile ? selectedFile.url : formData.fileUrl,
        fileName: selectedFile ? selectedFile.fileName : '',
      };

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ title: '', description: '', dueDate: '', courseId: '', fileUrl: '', fileName: '' });
        setSelectedFile(null);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create assignment');
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

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissions(true);
    setLoadingSubmissions(true);

    try {
      const res = await fetch(`/api/submissions?assignmentId=${assignment.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await fetch(`/api/submissions/${gradingSubmission.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });

      if (res.ok) {
        setGradingSubmission(null);
        setGradeData({ grade: 0, feedback: '' });
        if (selectedAssignment) {
          handleViewSubmissions(selectedAssignment);
        }
      }
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split('T')[0],
      courseId: assignment.courseId,
      fileUrl: assignment.fileUrl || '',
      fileName: assignment.fileName || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    try {
      // Use uploaded file data if available, otherwise use form data
      const submissionData = {
        ...editFormData,
        fileUrl: selectedFile ? selectedFile.url : editFormData.fileUrl,
        fileName: selectedFile ? selectedFile.fileName : editFormData.fileName,
      };

      const res = await fetch(`/api/assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingAssignment(null);
        setEditFormData({ title: '', description: '', dueDate: '', courseId: '', fileUrl: '', fileName: '' });
        setSelectedFile(null);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
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
                  {assignment.fileUrl && (
                    <div className="mb-3">
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50 text-sm"
                      >
                        📄 {assignment.fileName || 'Download Assignment File'}
                      </a>
                    </div>
                  )}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewSubmissions(assignment)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50 font-medium"
                  >
                    📋 Submissions
                  </button>
                  <button
                    onClick={() => handleEditAssignment(assignment)}
                    className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/50 font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center py-12 text-purple-300">
              No assignments found. Create one to get started!
            </div>
          )}
        </div>

        {showSubmissions && selectedAssignment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-white/20 my-8">
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-800/95 backdrop-blur-sm rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedAssignment.title}</h2>
                  <p className="text-purple-300 mt-1">Submissions Overview</p>
                </div>
                <button
                  onClick={() => {
                    setShowSubmissions(false);
                    setSelectedAssignment(null);
                    setSubmissions([]);
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50"
                >
                  Close
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {loadingSubmissions ? (
                  <div className="text-center py-8 text-purple-300">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-purple-300 text-lg mb-2">No submissions yet</p>
                    <p className="text-purple-400 text-sm">Students haven&apos;t submitted this assignment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{submission.student.name}</h3>
                            <p className="text-purple-300 text-sm">{submission.student.email}</p>
                            <p className="text-purple-400 text-xs mt-1">
                              Submitted: {new Date(submission.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              submission.status === 'GRADED' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                                : submission.status === 'SUBMITTED'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                            }`}>
                              {submission.status}
                            </span>
                            {submission.grade !== null && (
                              <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-bold border border-purple-500/50">
                                {submission.grade}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
                          <h4 className="text-purple-200 font-semibold mb-2 text-sm">Submission Content:</h4>
                          {submission.content ? (
                            <p className="text-white whitespace-pre-wrap">{submission.content}</p>
                          ) : (
                            <p className="text-purple-400 italic">No text content</p>
                          )}
                          
                          {submission.fileUrl && (
                            <div className="mt-3">
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50 text-sm font-medium"
                              >
                                📎 {submission.fileName || 'View Submitted File'}
                              </a>
                            </div>
                          )}
                        </div>

                        {submission.feedback && (
                          <div className="mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <h4 className="text-green-300 font-semibold mb-2 text-sm">Feedback:</h4>
                            <p className="text-green-200">{submission.feedback}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setGradingSubmission(submission);
                              setGradeData({
                                grade: submission.grade || 0,
                                feedback: submission.feedback || '',
                              });
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                          >
                            {submission.grade !== null ? '📝 Update Score' : '📊 Grade Submission'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {gradingSubmission && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Grade Submission</h2>
                <p className="text-purple-300 mt-1">Student: {gradingSubmission.student.name}</p>
              </div>
              <form onSubmit={handleGradeSubmission} className="p-6 space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Grade (0-100)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={gradeData.grade}
                    onChange={(e) => setGradeData({ ...gradeData, grade: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">Feedback</label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter feedback for the student"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setGradingSubmission(null);
                      setGradeData({ grade: 0, feedback: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    Submit Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingAssignment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20 my-8">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Edit Assignment</h2>
                <p className="text-purple-300 mt-1">Update assignment details</p>
              </div>
              <form onSubmit={handleUpdateAssignment} className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">📋 Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">Course *</label>
                      <select
                        required
                        value={editFormData.courseId}
                        onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white text-sm"
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
                      <label className="block text-purple-200 mb-2 font-medium text-sm">Due Date *</label>
                      <input
                        type="date"
                        required
                        value={editFormData.dueDate}
                        onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium text-sm">Title *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Enter assignment title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium text-sm">Description *</label>
                    <textarea
                      required
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Enter description"
                      rows={2}
                    />
                  </div>
                </div>

                {/* File Attachment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">📎 File Attachment (Optional)</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-4">
                    {/* Current File Display */}
                    {editingAssignment.fileUrl && !selectedFile && (
                      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                        <p className="text-sm text-blue-300 mb-1">Current File:</p>
                        <a 
                          href={editingAssignment.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                        >
                          {editingAssignment.fileName || editingAssignment.fileUrl}
                        </a>
                      </div>
                    )}

                    {/* File Upload Option */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">
                        Upload New File
                        <span className="text-xs text-purple-400 ml-2">(PDF, Word, Excel - Max 10MB)</span>
                      </label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        disabled={uploading || !!editFormData.fileUrl}
                      />
                      {uploading && (
                        <p className="text-xs text-yellow-300 mt-2 flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Uploading file...
                        </p>
                      )}
                      {selectedFile && !uploading && (
                        <div className="mt-2 flex items-center justify-between bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                          <p className="text-xs text-green-300 flex items-center gap-2">
                            <span>✓</span> {selectedFile.name} uploaded (will replace current file)
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-xs text-red-300 hover:text-red-200 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-xs text-purple-300 font-medium">OR</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    
                    {/* External Link Option */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">External File Link</label>
                      <input
                        type="url"
                        value={editFormData.fileUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, fileUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="https://drive.google.com/file/d/..."
                        disabled={!!selectedFile}
                      />
                      <p className="text-xs text-purple-300 mt-1.5">Paste a link from Google Drive, Dropbox, or any file hosting service</p>
                    </div>
                    
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">File Name (Optional)</label>
                      <input
                        type="text"
                        value={editFormData.fileName}
                        onChange={(e) => setEditFormData({ ...editFormData, fileName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="e.g., Assignment1.pdf"
                      />
                      <p className="text-xs text-purple-300 mt-1.5">Display name for the file</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAssignment(null);
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors border border-white/20 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    Update Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20 my-8">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Add New Assignment</h2>
                <p className="text-purple-300 mt-1 text-sm">Create a new assignment for your course</p>
              </div>
              <form onSubmit={handleAddAssignment} className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">📋 Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">Course *</label>
                      <select
                        required
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white text-sm"
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
                      <label className="block text-purple-200 mb-2 font-medium text-sm">Due Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium text-sm">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Enter assignment title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium text-sm">Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Enter assignment description"
                      rows={2}
                    />
                  </div>
                </div>

                {/* File Attachment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">📎 File Attachment (Optional)</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-4">
                    {/* File Upload Option */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">
                        Upload File Directly
                        <span className="text-xs text-purple-400 ml-2">(PDF, Word, Excel - Max 10MB)</span>
                      </label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        disabled={uploading || !!formData.fileUrl}
                      />
                      {uploading && (
                        <p className="text-xs text-yellow-300 mt-2 flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Uploading file...
                        </p>
                      )}
                      {selectedFile && !uploading && (
                        <div className="mt-2 flex items-center justify-between bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                          <p className="text-xs text-green-300 flex items-center gap-2">
                            <span>✓</span> {selectedFile.name} uploaded successfully
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-xs text-red-300 hover:text-red-200 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-xs text-purple-300 font-medium">OR</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    
                    {/* External Link Option */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-medium text-sm">External File Link</label>
                      <input
                        type="url"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="https://drive.google.com/file/d/..."
                        disabled={!!selectedFile}
                      />
                      <p className="text-xs text-purple-300 mt-1.5">Paste a link from Google Drive, Dropbox, or any file hosting service</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ title: '', description: '', dueDate: '', courseId: '', fileUrl: '', fileName: '' });
                      setSelectedFile(null);
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors border border-white/20 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
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

