'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import Link from 'next/link';

// Tipo para os avisos globais
type AvisoGlobal = {
  id: string;
  titulo: string;
  conteudo: string;
  data: Date;
  urgente: boolean;
  ativo: boolean;
  createdBy: string;
  createdAt: Date;
};

export default function AvisosGlobaisPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avisos, setAvisos] = useState<AvisoGlobal[]>([]);
  const [showFormAviso, setShowFormAviso] = useState(false);
  const [novoAviso, setNovoAviso] = useState({
    titulo: '',
    conteudo: '',
    urgente: false,
  });
  
  // Simulação dos avisos (em um sistema real, viria do banco de dados)
  const mockAvisos: AvisoGlobal[] = [
    {
      id: 'aviso-1',
      titulo: 'Manutenção Programada do Sistema',
      conteudo: 'Informamos que o sistema estará indisponível para manutenção no próximo fim de semana.',
      data: new Date(),
      urgente: false,
      ativo: true,
      createdBy: 'user-1',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      id: 'aviso-2',
      titulo: 'Atualização do Censo Escolar',
      conteudo: 'Lembramos a todas as secretarias que o prazo para atualização dos dados do Censo Escolar termina este mês.',
      data: new Date(),
      urgente: true,
      ativo: true,
      createdBy: 'user-1',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.nivelPermissao !== 'superadmin' && user?.nivelPermissao !== 'admin') {
        router.push('/');
      } else {
        // Em um sistema real, carregaria do banco de dados
        setAvisos(mockAvisos);
        setLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmitAviso = () => {
    // Validar campos
    if (!novoAviso.titulo || !novoAviso.conteudo) {
      return;
    }

    // Criar novo aviso
    const novoAvisoObj: AvisoGlobal = {
      id: `aviso-${Date.now()}`,
      titulo: novoAviso.titulo,
      conteudo: novoAviso.conteudo,
      data: new Date(),
      urgente: novoAviso.urgente,
      ativo: true,
      createdBy: user?.id || '',
      createdAt: new Date(),
    };

    // Adicionar à lista (em um sistema real, enviaria para a API)
    setAvisos([novoAvisoObj, ...avisos]);
    
    // Limpar formulário
    setNovoAviso({
      titulo: '',
      conteudo: '',
      urgente: false,
    });
    
    // Fechar modal
    setShowFormAviso(false);
  };

  const handleDesativarAviso = (id: string) => {
    // Em um sistema real, enviaria para a API
    setAvisos(
      avisos.map(aviso => 
        aviso.id === id 
          ? { ...aviso, ativo: false } 
          : aviso
      )
    );
  };

  const handleAtivarAviso = (id: string) => {
    // Em um sistema real, enviaria para a API
    setAvisos(
      avisos.map(aviso => 
        aviso.id === id 
          ? { ...aviso, ativo: true } 
          : aviso
      )
    );
  };

  const handleRemoverAviso = (id: string) => {
    // Em um sistema real, enviaria para a API
    setAvisos(avisos.filter(aviso => aviso.id !== id));
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
        <h1 className="text-3xl font-bold text-blue-800">Gerenciamento de Avisos Globais</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Voltar ao Painel
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Avisos</h2>
          <button
            onClick={() => setShowFormAviso(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Novo Aviso Global
          </button>
        </div>
        
        {avisos.length > 0 ? (
          <div className="space-y-4">
            {avisos.map((aviso) => (
              <div 
                key={aviso.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  aviso.urgente 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-blue-500 bg-blue-50'
                } ${
                  !aviso.ativo && 'opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{aviso.titulo}</h3>
                      {aviso.urgente && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Urgente
                        </span>
                      )}
                      {!aviso.ativo && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Enviado em {aviso.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {aviso.ativo ? (
                      <button
                        onClick={() => handleDesativarAviso(aviso.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Desativar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAtivarAviso(aviso.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ativar
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoverAviso(aviso.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{aviso.conteudo}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Não há avisos globais no momento.
          </div>
        )}
      </div>
      
      {/* Modal para novo aviso */}
      {showFormAviso && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Novo Aviso Global</h3>
              <button
                onClick={() => setShowFormAviso(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={novoAviso.titulo}
                  onChange={(e) => setNovoAviso({ ...novoAviso, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Título do aviso"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <textarea
                  value={novoAviso.conteudo}
                  onChange={(e) => setNovoAviso({ ...novoAviso, conteudo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Conteúdo do aviso"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgente"
                  checked={novoAviso.urgente}
                  onChange={(e) => setNovoAviso({ ...novoAviso, urgente: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="urgente" className="ml-2 block text-sm text-gray-700">
                  Marcar como urgente
                </label>
              </div>
              
              <div className="mt-2 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowFormAviso(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitAviso}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Enviar Aviso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 