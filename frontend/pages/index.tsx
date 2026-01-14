import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';

export default function HomePage() {
  return (
    <MainLayout title="Todo App - Home">
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Todo App - Home</title>
        </Head>

        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Secure Todo Management</span>
              <span className="block text-indigo-600 mt-2">Multi-User Application</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A secure, JWT-authenticated todo application where each user can manage their own tasks in isolation.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Secure Authentication</h3>
                    <p className="mt-2 text-base text-gray-500">
                      JWT-based authentication ensures that users can only access their own data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Full CRUD Operations</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Create, read, update, and delete your tasks with ease.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Responsive UI</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Works seamlessly on desktop, tablet, and mobile devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}