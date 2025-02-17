import React from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <BarChart2 className="w-12 h-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            SMM Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}