'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  fileUrl?: string;
  fileName?: string;
  course: {
    code: string;
    name: string;
  };
};

type Submission = {
  id: string;
  content: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  grade?: number | null;
  feedback?: string | null;
  status: string;
  createdAt: string;
};

function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({ content: '', fileUrl: '', fileName: '' });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; url: string; fileName: string } | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAssignmentAndSubmission();
  }, [resolvedParams.id]);

  const fetchAssignmentAndSubmission = async () => {
    try {
      const assignmentRes = await fetch(`/api/assignments/${resolvedParams.id}`);
      if (assignmentRes.ok) {
        const data = await assignmentRes.json();
        setAssignment(data.assignment);
      }

      const submissionRes = await fetch(`/api/submissions?assignmentId=${resolvedParams.id}`);
      if (submissionRes.ok) {
        const data = await submissionRes.json();
        if (data.submissions && data.submissions.length > 0) {
          setSubmission(data.submissions[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'submission');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedFile({
          file: file,
          url: data.fileUrl,
          fileName: data.fileName,
        });
        setExternalLink(''); // Clear external link when file is uploaded
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Determine which file data to use
      const submissionData = {
        assignmentId: resolvedParams.id,
        content: formData.content,
        fileUrl: selectedFile ? selectedFile.url : externalLink,
        fileName: selectedFile ? selectedFile.fileName : '',
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setShowSubmitModal(false);
        setFormData({ content: '', fileUrl: '', fileName: '' });
        setSelectedFile(null);
        setExternalLink('');
        fetchAssignmentAndSubmission();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit assignment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Assignment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/student')}
          className="text-purple-300 hover:text-white mb-6 flex items-center gap-2 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/50">
              {assignment.course.code}
            </span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/50">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{assignment.title}</h1>
          <p className="text-lg text-purple-200 mb-6">{assignment.course.name}</p>

          {assignment.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
              <p className="text-purple-200 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          )}

          {assignment.fileUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Assignment File</h2>
              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50"
              >
                <span className="text-2xl">📄</span>
                <span>{assignment.fileName || 'Download Assignment File'}</span>
              </a>
            </div>
          )}

          {!submission && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Submit Assignment
            </button>
          )}
        </div>

        {submission && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Your Submission</h2>

            <div className="space-y-4">
              <div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  submission.status === 'GRADED' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                }`}>
                  {submission.status}
                </span>
              </div>

              {submission.content && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                  <p className="text-purple-200 whitespace-pre-wrap">{submission.content}</p>
                </div>
              )}

              {submission.fileUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Submitted File</h3>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50"
                  >
                    📎 {submission.fileName || 'View Submission File'}
                  </a>
                </div>
              )}

              {submission.grade !== null && submission.grade !== undefined && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span>🎯</span> Grade
                  </h3>
                  <p className="text-4xl font-bold text-green-300">{submission.grade}/100</p>
                </div>
              )}

              {submission.feedback && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>💬</span> Teacher&apos;s Feedback
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-purple-100 whitespace-pre-wrap leading-relaxed">{submission.feedback}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-purple-400">
                Submitted on: {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Submit Assignment</h2>
                <p className="text-purple-300 mt-1">{assignment.title}</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-purple-200 mb-2 font-medium">
                    Submission Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Submitedd assignment"
                    rows={5}
                  />
                </div>

                <div className="bg-white/5 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      Upload File
                      <span className="text-sm text-purple-400 ml-2">PDF, Word, Excel, Images (Max 10MB)</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={uploading || !!externalLink}
                    />
                    {uploading && (
                      <p className="text-xs text-yellow-300 mt-2 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Uploading file...
                      </p>
                    )}
                    {selectedFile && !uploading && (
                      <div className="mt-2 flex items-center justify-between bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                        <p className="text-xs text-green-300 flex items-center gap-2">
                          <span>✓</span> {selectedFile.fileName} uploaded successfully
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

                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      Or External File Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://drive.google.com/file/d/..."
                      disabled={!!selectedFile}
                    />
                    <p className="text-xs text-purple-300 mt-2">
                      Or paste a Google Drive / Dropbox link below
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      setFormData({ content: '', fileUrl: '', fileName: '' });
                      setSelectedFile(null);
                      setExternalLink('');
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    Submit Assignment
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

export default function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <AssignmentDetail params={params} />
    </ProtectedRoute>
  );
}


