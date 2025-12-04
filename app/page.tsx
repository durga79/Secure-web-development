import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Secure Student Portal
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          A secure web application for managing student courses, assignments, and submissions
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Register
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-bold mb-4">Key Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-lg mb-2">🔐 Authentication & Authorization</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Secure password hashing with bcrypt</li>
                <li>• Role-based access control (Student/Admin)</li>
                <li>• HTTP-only secure session cookies</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">✅ Input Validation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zod schema validation on all inputs</li>
                <li>• SQL injection prevention via Prisma ORM</li>
                <li>• XSS protection through sanitization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🛡️ Security Headers</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• X-Frame-Options, X-XSS-Protection</li>
                <li>• Content Security Policy</li>
                <li>• Strict-Transport-Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📊 Auditing & Logging</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Comprehensive security event logging</li>
                <li>• Failed login attempt tracking</li>
                <li>• Admin action auditing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
