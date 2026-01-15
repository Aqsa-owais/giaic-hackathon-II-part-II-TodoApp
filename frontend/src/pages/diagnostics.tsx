'use client';

import { useState, useEffect } from 'react';

export default function Diagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiBaseUrl) {
          setDiagnostics({
            error: 'NEXT_PUBLIC_API_URL environment variable is not set'
          });
          setLoading(false);
          return;
        }

        const results: any = {
          apiBaseUrl: apiBaseUrl,
          timestamp: new Date().toISOString(),
          tests: {}
        };

        // Test 1: Check if backend URL is accessible
        try {
          const healthResponse = await fetch(`${apiBaseUrl}/health`);
          results.tests.healthCheck = {
            status: healthResponse.status,
            ok: healthResponse.ok,
            response: await healthResponse.json().catch(() => 'non-JSON response')
          };
        } catch (healthError) {
          results.tests.healthCheck = {
            error: healthError instanceof Error ? healthError.message : String(healthError),
            ok: false
          };
        }

        // Test 2: Check register endpoint
        try {
          const registerResponse = await fetch(`${apiBaseUrl}/api/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com', password: 'TestPass123!' })
          });

          results.tests.registerEndpoint = {
            status: registerResponse.status,
            ok: registerResponse.ok,
            // Don't log the full response as it may contain sensitive info
            responseOk: registerResponse.ok
          };
        } catch (regError) {
          results.tests.registerEndpoint = {
            error: regError instanceof Error ? regError.message : String(regError),
            ok: false
          };
        }

        // Test 3: Check login endpoint
        try {
          const loginResponse = await fetch(`${apiBaseUrl}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
          });

          results.tests.loginEndpoint = {
            status: loginResponse.status,
            ok: loginResponse.ok,
            responseOk: loginResponse.ok
          };
        } catch (loginError) {
          results.tests.loginEndpoint = {
            error: loginError instanceof Error ? loginError.message : String(loginError),
            ok: false
          };
        }

        setDiagnostics(results);
      } catch (error) {
        setDiagnostics({
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">System Diagnostics</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Environment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <strong>API Base URL:</strong> {diagnostics.apiBaseUrl || 'Not set'}
            </div>
            <div className="border rounded p-3">
              <strong>Timestamp:</strong> {diagnostics.timestamp || 'N/A'}
            </div>
          </div>
        </div>

        {diagnostics.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{diagnostics.error}</p>
          </div>
        )}

        {diagnostics.tests && (
          <div className="space-y-6">
            <div className={`bg-white shadow rounded-lg p-6 ${diagnostics.tests.healthCheck?.ok ? 'border border-green-200' : 'border border-red-200'}`}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Health Check</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.tests.healthCheck, null, 2)}
              </pre>
            </div>

            <div className={`bg-white shadow rounded-lg p-6 ${diagnostics.tests.registerEndpoint?.ok ? 'border border-green-200' : 'border border-red-200'}`}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Register Endpoint</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.tests.registerEndpoint, null, 2)}
              </pre>
            </div>

            <div className={`bg-white shadow rounded-lg p-6 ${diagnostics.tests.loginEndpoint?.ok ? 'border border-green-200' : 'border border-red-200'}`}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Login Endpoint</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.tests.loginEndpoint, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Troubleshooting Tips</h2>
          <ul className="list-disc pl-5 space-y-2 text-blue-700">
            <li>Make sure your backend is running and accessible at the configured URL</li>
            <li>Check that CORS settings allow requests from your frontend domain</li>
            <li>Verify that all environment variables are properly set in your deployment</li>
            <li>Check browser console for additional error details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}