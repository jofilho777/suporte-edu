'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import Link from 'next/link';
import { NivelPermissao, Usuario } from '../../models/tipos';

export default function UsuariosAdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosPendentes, setUsuariosPendentes] = useState<Usuario[]>([]);
  const [activeTab, setActiveTab] = useState<'ativos' | 'pendentes'>('ativos');
  const [editandoUsuario, setEditandoUsuario] = useState<string | null>(null);
  const [nivelPermissao, setNivelPermissao] = useState<NivelPermissao>('usuario');

  // Simulação de dados dos usuários
  const mockUsuarios: Usuario[] = [
    {
      id: 'user-1',
      nome: 'Administrador',
      email: 'admin@suporteedu.com',
      secretariaId: 'sec-1',
      cargo: 'Administrador do Sistema',
      nivelPermissao: 'superadmin',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-2',
      nome: 'Gestor Municipal',
      email: 'gestor@exemplo.com',
      secretariaId: 'sec-1',
      cargo: 'Secretário de Educação',
      nivelPermissao: 'gestor',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-3',
      nome: 'Analista Educacional',
      email: 'analista@exemplo.com',
      secretariaId: 'sec-1',
      cargo: 'Analista',
      nivelPermissao: 'usuario',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const mockUsuariosPendentes: Usuario[] = [
    {
      id: 'user-4',
      nome: 'Novo Coordenador',
      email: 'coordenador@novacidade.com',
      secretariaId: 'sec-2',
      cargo: 'Coordenador Pedagógico',
      nivelPermissao: 'usuario',
      ativo: false,
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
        setUsuarios(mockUsuarios);
        setUsuariosPendentes(mockUsuariosPendentes);
        setLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);
  
  // Função para aprovar um usuário pendente
  const handleAprovarUsuario = (id: string) => {
    // Em um sistema real, enviaria para a API
    const usuarioAprovado = usuariosPendentes.find(u => u.id === id);
    
    if (usuarioAprovado) {
      usuarioAprovado.ativo = true;
      setUsuarios([...usuarios, usuarioAprovado]);
      setUsuariosPendentes(usuariosPendentes.filter(u => u.id !== id));
    }
  };
  
  // Função para rejeitar um usuário pendente
  const handleRejeitarUsuario = (id: string) => {
    // Em um sistema real, enviaria para a API
    setUsuariosPendentes(usuariosPendentes.filter(u => u.id !== id));
  };
  
  // Função para desativar um usuário ativo
  const handleDesativarUsuario = (id: string) => {
    // Em um sistema real, enviaria para a API
    setUsuarios(
      usuarios.map(u => 
        u.id === id 
          ? { ...u, ativo: false } 
          : u
      )
    );
  };
  
  // Função para ativar um usuário inativo
  const handleAtivarUsuario = (id: string) => {
    // Em um sistema real, enviaria para a API
    setUsuarios(
      usuarios.map(u => 
        u.id === id 
          ? { ...u, ativo: true } 
          : u
      )
    );
  };
  
  // Função para iniciar a edição do nível de permissão
  const handleEditarPermissao = (id: string, permissaoAtual: NivelPermissao) => {
    setEditandoUsuario(id);
    setNivelPermissao(permissaoAtual);
  };
  
  // Função para salvar o nível de permissão
  const handleSalvarPermissao = (id: string) => {
    // Em um sistema real, enviaria para a API
    setUsuarios(
      usuarios.map(u => 
        u.id === id 
          ? { ...u, nivelPermissao: nivelPermissao } 
          : u
      )
    );
    setEditandoUsuario(null);
  };
  
  // Função para cancelar a edição
  const handleCancelarEdicao = () => {
    setEditandoUsuario(null);
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
        <h1 className="text-3xl font-bold text-blue-800">Gerenciamento de Usuários</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Voltar ao Painel
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'ativos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('ativos')}
          >
            Usuários Ativos ({usuarios.filter(u => u.ativo).length})
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'pendentes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('pendentes')}
          >
            Usuários Pendentes ({usuariosPendentes.length})
          </button>
        </div>
        
        {/* Conteúdo */}
        <div className="p-6">
          {activeTab === 'ativos' ? (
            <>
              {usuarios.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cargo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nível
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
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{usuario.cargo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editandoUsuario === usuario.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={nivelPermissao}
                                  onChange={(e) => setNivelPermissao(e.target.value as NivelPermissao)}
                                  className="text-sm border rounded p-1"
                                >
                                  <option value="superadmin">Super Admin</option>
                                  <option value="admin">Admin</option>
                                  <option value="gestor">Gestor</option>
                                  <option value="usuario">Usuário</option>
                                </select>
                                <button
                                  onClick={() => handleSalvarPermissao(usuario.id)}
                                  className="text-green-600 hover:text-green-800 text-sm"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelarEdicao}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="text-sm" 
                                onClick={() => handleEditarPermissao(usuario.id, usuario.nivelPermissao)}
                              >
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  usuario.nivelPermissao === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                  usuario.nivelPermissao === 'admin' ? 'bg-red-100 text-red-800' :
                                  usuario.nivelPermissao === 'gestor' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {usuario.nivelPermissao === 'superadmin' ? 'Super Admin' :
                                   usuario.nivelPermissao === 'admin' ? 'Admin' :
                                   usuario.nivelPermissao === 'gestor' ? 'Gestor' : 'Usuário'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {usuario.ativo ? (
                              <button
                                onClick={() => handleDesativarUsuario(usuario.id)}
                                className="text-red-600 hover:text-red-900 mr-2"
                              >
                                Desativar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAtivarUsuario(usuario.id)}
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Ativar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Não há usuários ativos no momento.
                </div>
              )}
            </>
          ) : (
            <>
              {usuariosPendentes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Secretaria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cargo
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
                      {usuariosPendentes.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">ID: {usuario.secretariaId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{usuario.cargo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {usuario.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleAprovarUsuario(usuario.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejeitarUsuario(usuario.id)}
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
                  Não há usuários pendentes de aprovação.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 