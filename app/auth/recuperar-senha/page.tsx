'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Ocorreu um erro ao processar a solicitação.');
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setError('Ocorreu um erro ao processar a solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-[80px] relative">
                <Image 
                  src="/logose.png" 
                  alt="Suporte Edu Logo" 
                  width={180}
                  height={80}
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Solicitação Enviada!</h2>
            <p className="text-gray-600 mb-4">
              Enviamos um e-mail com instruções para recuperar sua senha. 
              Por favor, verifique sua caixa de entrada e também a pasta de spam.
            </p>
            <div className="mt-6">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-[80px] relative">
              <Image 
                src="/logose.png" 
                alt="Suporte Edu Logo" 
                width={180}
                height={80}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-blue-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Informe seu e-mail para receber instruções de recuperação
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 