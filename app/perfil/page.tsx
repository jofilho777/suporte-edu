'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';

export default function PerfilPage() {
  const { user, secretaria, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do usuário quando disponíveis
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  // Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Salvar alterações
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!formData.nome || !formData.email) {
      setMessage({
        text: 'Por favor, preencha todos os campos obrigatórios.',
        type: 'error',
      });
      return;
    }
    
    // Validar senhas se estiverem sendo alteradas
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setMessage({
          text: 'Por favor, informe sua senha atual para confirmar a alteração.',
          type: 'error',
        });
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({
          text: 'A nova senha e a confirmação não coincidem.',
          type: 'error',
        });
        return;
      }
    }
    
    setIsSaving(true);
    
    // Simular salvamento (em um sistema real, enviaria para a API)
    setTimeout(() => {
      setMessage({
        text: 'Perfil atualizado com sucesso!',
        type: 'success',
      });
      setIsEditing(false);
      setIsSaving(false);
      
      // Limpar campos de senha após salvar
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Limpar mensagem após alguns segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-red-600">Acesso negado. Faça login para visualizar esta página.</p>
      </div>
    );
  }

  const isSuperAdmin = user.nivelPermissao === 'superadmin';

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Meu Perfil</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.nome}</h2>
              <p className="text-gray-600">{user.cargo}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {isSuperAdmin ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Empresa</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Você está logado como Super Administrador do sistema</p>
                <p className="text-gray-600 mt-2">Como super administrador, você tem acesso a todas as funcionalidades do sistema, incluindo o gerenciamento de secretarias de educação e usuários.</p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Secretaria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Nome da Secretaria</p>
                  <p className="font-medium">{secretaria?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Município / Estado</p>
                  <p className="font-medium">{secretaria?.municipio} - {secretaria?.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-medium">{secretaria?.endereco || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{secretaria?.telefone || 'Não informado'}</p>
                </div>
              </div>
            </>
          )}
          
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Meus Dados</h3>
          
          {isEditing ? (
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <h4 className="text-md font-medium text-gray-800 mb-4">Alterar Senha (opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div></div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{user.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cargo</p>
                <p className="font-medium">{user.cargo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nível de Acesso</p>
                <p className="font-medium">
                  {user.nivelPermissao === 'superadmin' ? 'Super Administrador' : 
                   user.nivelPermissao === 'admin' ? 'Administrador' : 
                   user.nivelPermissao === 'gestor' ? 'Gestor' : 'Usuário'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 