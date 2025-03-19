'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.nivelPermissao !== 'superadmin' && user?.nivelPermissao !== 'admin') {
        router.push('/');
      } else {
        setLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gerenciamento de Secretarias */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-xl font-bold">Secretarias</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">Gerencie as secretarias de educação, aprove novos registros e monitore atividades.</p>
            <Link href="/admin/secretarias" className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Gerenciar Secretarias
            </Link>
          </div>
        </div>
        
        {/* Gerenciamento de Usuários */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 text-white p-4">
            <h2 className="text-xl font-bold">Usuários</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">Gerencie usuários, defina permissões e controle acessos ao sistema.</p>
            <Link href="/admin/usuarios" className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Gerenciar Usuários
            </Link>
          </div>
        </div>
        
        {/* Avisos Globais */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-600 text-white p-4">
            <h2 className="text-xl font-bold">Avisos Globais</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">Envie avisos e notificações para todas as secretarias simultaneamente.</p>
            <Link href="/admin/avisos" className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Gerenciar Avisos
            </Link>
          </div>
        </div>
      </div>
      
      {/* Estatísticas Gerais */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Estatísticas Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total de Secretarias</p>
            <p className="text-3xl font-bold text-blue-800">1</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total de Usuários</p>
            <p className="text-3xl font-bold text-green-800">2</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Secretarias Pendentes</p>
            <p className="text-3xl font-bold text-yellow-800">0</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Avisos Ativos</p>
            <p className="text-3xl font-bold text-purple-800">0</p>
          </div>
        </div>
      </div>
    </div>
  );
} 