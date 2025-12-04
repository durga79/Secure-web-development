import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10">
        <nav className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SH</span>
              </div>
              <span className="text-white font-bold text-xl">ScholarHub</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="text-white hover:text-blue-200 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              ScholarHub
            </h1>
            <p className="text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              A modern, secure platform for managing courses, assignments, and academic progress
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
              >
                Start Learning Today
              </Link>
              <Link
                href="/auth/login"
                className="bg-white/10 backdrop-blur-lg text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Course Management</h3>
              <p className="text-blue-100">
                Access all your enrolled courses, track progress, and stay organized with our intuitive interface
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Submit Assignments</h3>
              <p className="text-blue-100">
                Submit your work, track deadlines, and receive feedback all in one secure platform
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Enterprise Security</h3>
              <p className="text-blue-100">
                Your data is protected with industry-leading security practices and encryption
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Encrypted Authentication</h4>
                    <p className="text-blue-100 text-sm">Bcrypt password hashing with 12 salt rounds</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Role-Based Access Control</h4>
                    <p className="text-blue-100 text-sm">Separate permissions for students and administrators</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">SQL Injection Prevention</h4>
                    <p className="text-blue-100 text-sm">Prisma ORM with parameterized queries</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">XSS & CSRF Protection</h4>
                    <p className="text-blue-100 text-sm">Multiple layers of defense against common attacks</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Comprehensive Logging</h4>
                    <p className="text-blue-100 text-sm">Security event tracking and audit trails</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Security Headers</h4>
                    <p className="text-blue-100 text-sm">HTTP security headers for additional protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center text-blue-200 py-8 mt-16">
          <p>© 2025 ScholarHub. Built with security in mind.</p>
        </footer>
      </div>
    </div>
  );
}
