'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import Link from 'next/link';
import { Secretaria } from '../../models/tipos';

export default function SecretariasAdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [secretariasPendentes, setSecretariasPendentes] = useState<Secretaria[]>([]);
  const [activeTab, setActiveTab] = useState<'ativas' | 'pendentes'>('ativas');

  // Simulação de dados das secretarias
  const mockSecretarias: Secretaria[] = [
    {
      id: 'sec-1',
      nome: 'Secretaria Municipal de Educação de Exemplo',
      municipio: 'Exemplo',
      estado: 'SP',
      endereco: 'Rua Exemplo, 123',
      telefone: '(11) 1234-5678',
      ativa: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const mockSecretariasPendentes: Secretaria[] = [
    {
      id: 'sec-2',
      nome: 'Secretaria Municipal de Educação de Nova Cidade',
      municipio: 'Nova Cidade',
      estado: 'MG',
      endereco: 'Av. Principal, 500',
      telefone: '(31) 9876-5432',
      ativa: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.nivelPermissao !== 'superadmin' && user?.nivelPermissao !== 'admin') {
        router.push('/');
      } else {
        // Em um sistema real, carregaria do banco de dados
        setSecretarias(mockSecretarias);
        setSecretariasPendentes(mockSecretariasPendentes);
        setLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleAprovarSecretaria = (id: string) => {
    // Em um sistema real, enviaria para a API
    const secretariaAprovada = secretariasPendentes.find(s => s.id === id);
    
    if (secretariaAprovada) {
      secretariaAprovada.ativa = true;
      setSecretarias([...secretarias, secretariaAprovada]);
      setSecretariasPendentes(secretariasPendentes.filter(s => s.id !== id));
    }
  };

  const handleRejeitarSecretaria = (id: string) => {
    // Em um sistema real, enviaria para a API
    setSecretariasPendentes(secretariasPendentes.filter(s => s.id !== id));
  };

  const handleDesativarSecretaria = (id: string) => {
    // Em um sistema real, enviaria para a API
    const secretariaAtualizada = secretarias.find(s => s.id === id);
    
    if (secretariaAtualizada) {
      secretariaAtualizada.ativa = false;
      setSecretarias(secretarias.filter(s => s.id !== id));
      setSecretariasPendentes([...secretariasPendentes, secretariaAtualizada]);
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Gerenciamento de Secretarias</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Voltar ao Painel
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'ativas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('ativas')}
          >
            Secretarias Ativas ({secretarias.length})
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'pendentes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('pendentes')}
          >
            Secretarias Pendentes ({secretariasPendentes.length})
          </button>
        </div>
        
        {/* Conteúdo */}
        <div className="p-6">
          {activeTab === 'ativas' ? (
            <>
              {secretarias.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Município/Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {secretarias.map((secretaria) => (
                        <tr key={secretaria.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{secretaria.nome}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {secretaria.municipio}/{secretaria.estado}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{secretaria.telefone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Ativa
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDesativarSecretaria(secretaria.id)}
                              className="text-red-600 hover:text-red-900 mr-4"
                            >
                              Desativar
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Não há secretarias ativas no momento.
                </div>
              )}
            </>
          ) : (
            <>
              {secretariasPendentes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Município/Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data de Solicitação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {secretariasPendentes.map((secretaria) => (
                        <tr key={secretaria.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{secretaria.nome}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {secretaria.municipio}/{secretaria.estado}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{secretaria.telefone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {secretaria.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleAprovarSecretaria(secretaria.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejeitarSecretaria(secretaria.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Rejeitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Não há secretarias pendentes de aprovação.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 