export function ConfigWarning() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configuration Required
          </h2>
          <div className="text-left space-y-4 text-gray-600">
            <p>
              This Ticket Management System requires Supabase configuration to function properly.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-900 mb-2">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a Supabase account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Create a new project in your Supabase dashboard</li>
                <li>Go to Project Settings → API</li>
                <li>Copy your project URL and anon key</li>
                <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in your project root with:
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here`}
                  </pre>
                </li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Once configured, you'll be able to use authentication, create tickets, and manage users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
