'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../providers/AuthProvider';

// Tipos para os chamados de assessoria
type StatusChamado = 'aberto' | 'em_andamento' | 'concluido';

type Resposta = {
  id: string;
  texto: string;
  data: Date;
  autorAdmin: boolean;
};

type Chamado = {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusChamado;
  dataAbertura: Date;
  dataAtualizacao: Date;
  usuario: string;
  respostas: Resposta[];
  notaFechamento?: string; // Nota de fechamento opcional
};

export default function AssessoriaPage() {
  // Estado para gerenciar chamados
  const [chamados, setChamados] = useState<Chamado[]>([]);
  
  // Estado para novo chamado
  const [novoChamado, setNovoChamado] = useState({
    titulo: '',
    descricao: '',
  });
  
  // Estado para resposta
  const [novaResposta, setNovaResposta] = useState({
    chamadoId: '',
    texto: '',
  });

  // Estado para nota de fechamento
  const [notaFechamento, setNotaFechamento] = useState('');
  
  // Estado para mostrar formulário de novo chamado
  const [mostrarFormNovoChamado, setMostrarFormNovoChamado] = useState(false);
  
  // Estado para chamado selecionado
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  
  // Estado para filtro de chamados
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'abertos' | 'concluidos'>('todos');
  
  // Estado para mostrar modal de nota de fechamento
  const [mostrarModalFechamento, setMostrarModalFechamento] = useState(false);
  
  // Simulação de usuário logado
  const usuarioAtual = "João Silva";
  
  // Verificar se o usuário tem permissões de administrador com base no contexto de autenticação
  const { user } = useAuth();
  const isAdmin = user?.nivelPermissao === 'admin' || user?.nivelPermissao === 'superadmin';
  
  // Estado para mensagens de notificação
  const [notificacao, setNotificacao] = useState({
    mensagem: '',
    tipo: '',
    mostrar: false,
  });

  // Carregar chamados salvos
  useEffect(() => {
    const chamadosSalvos = localStorage.getItem('suporte-edu-chamados');
    if (chamadosSalvos) {
      try {
        const parsedChamados = JSON.parse(chamadosSalvos).map((chamado: any) => ({
          ...chamado,
          dataAbertura: new Date(chamado.dataAbertura),
          dataAtualizacao: new Date(chamado.dataAtualizacao),
          respostas: chamado.respostas.map((resposta: any) => ({
            ...resposta,
            data: new Date(resposta.data),
          })),
        }));
        setChamados(parsedChamados);
      } catch (e) {
        console.error('Erro ao carregar chamados:', e);
      }
    } else {
      // Dados de exemplo para chamados
      const exemplosChamados: Chamado[] = [
        {
          id: '1',
          titulo: 'Dúvida sobre o IDEB',
          descricao: 'Gostaria de entender melhor como o IDEB é calculado para nossa escola.',
          status: 'concluido',
          dataAbertura: new Date(new Date().setDate(new Date().getDate() - 30)),
          dataAtualizacao: new Date(new Date().setDate(new Date().getDate() - 25)),
          usuario: 'João Silva',
          respostas: [
            {
              id: '1',
              texto: 'Olá! O IDEB é calculado com base no desempenho dos alunos na Prova Brasil e na taxa de aprovação. Posso detalhar mais se precisar.',
              data: new Date(new Date().setDate(new Date().getDate() - 28)),
              autorAdmin: true,
            },
            {
              id: '2',
              texto: 'Sim, gostaria de saber especificamente qual o peso da taxa de aprovação no cálculo.',
              data: new Date(new Date().setDate(new Date().getDate() - 27)),
              autorAdmin: false,
            },
            {
              id: '3',
              texto: 'A taxa de aprovação tem peso igual ao desempenho nas provas. O IDEB é o produto do desempenho pela taxa de aprovação, sendo que ambos são normalizados para variarem de 0 a 10.',
              data: new Date(new Date().setDate(new Date().getDate() - 25)),
              autorAdmin: true,
            },
          ],
          notaFechamento: 'Usuário esclarecido sobre o cálculo do IDEB. Foi explicado como o índice é composto pelo desempenho nas avaliações e taxa de aprovação, ambos com pesos iguais.'
        },
        {
          id: '2',
          titulo: 'Problema com a Plataforma de Gestão Escolar',
          descricao: 'Não estou conseguindo acessar o módulo de frequência na plataforma.',
          status: 'em_andamento',
          dataAbertura: new Date(new Date().setDate(new Date().getDate() - 5)),
          dataAtualizacao: new Date(new Date().setDate(new Date().getDate() - 2)),
          usuario: 'João Silva',
          respostas: [
            {
              id: '1',
              texto: 'Bom dia! Estamos verificando o problema. Pode me informar qual navegador está utilizando?',
              data: new Date(new Date().setDate(new Date().getDate() - 4)),
              autorAdmin: true,
            },
            {
              id: '2',
              texto: 'Estou usando o Chrome na versão mais recente.',
              data: new Date(new Date().setDate(new Date().getDate() - 3)),
              autorAdmin: false,
            },
            {
              id: '3',
              texto: 'Identificamos o problema e estamos trabalhando na correção. Deve ser normalizado em até 48h.',
              data: new Date(new Date().setDate(new Date().getDate() - 2)),
              autorAdmin: true,
            },
          ],
        },
      ];
      setChamados(exemplosChamados);
      localStorage.setItem('suporte-edu-chamados', JSON.stringify(exemplosChamados));
    }
  }, []);

  // Salvar chamados no localStorage sempre que houver alteração
  useEffect(() => {
    if (chamados.length > 0) {
      localStorage.setItem('suporte-edu-chamados', JSON.stringify(chamados));
    }
  }, [chamados]);

  // Função para adicionar novo chamado
  const handleAdicionarChamado = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novoChamado.titulo.trim() === '' || novoChamado.descricao.trim() === '') {
      exibirNotificacao('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    const chamado: Chamado = {
      id: Date.now().toString(),
      titulo: novoChamado.titulo,
      descricao: novoChamado.descricao,
      status: 'aberto',
      dataAbertura: new Date(),
      dataAtualizacao: new Date(),
      usuario: usuarioAtual,
      respostas: [],
    };
    
    setChamados([...chamados, chamado]);
    setNovoChamado({ titulo: '', descricao: '' });
    setMostrarFormNovoChamado(false);
    exibirNotificacao('Chamado aberto com sucesso!', 'success');
  };

  // Função para adicionar resposta a um chamado
  const handleAdicionarResposta = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chamadoSelecionado || novaResposta.texto.trim() === '') {
      exibirNotificacao('Digite uma resposta antes de enviar.', 'error');
      return;
    }
    
    const resposta: Resposta = {
      id: Date.now().toString(),
      texto: novaResposta.texto,
      data: new Date(),
      autorAdmin: isAdmin,
    };
    
    const chamadoAtualizado = {
      ...chamadoSelecionado,
      respostas: [...chamadoSelecionado.respostas, resposta],
      dataAtualizacao: new Date(),
      status: chamadoSelecionado.status === 'aberto' && isAdmin ? 'em_andamento' : chamadoSelecionado.status,
    };
    
    setChamados(chamados.map(c => 
      c.id === chamadoSelecionado.id ? chamadoAtualizado : c
    ));
    
    setChamadoSelecionado(chamadoAtualizado);
    setNovaResposta({ chamadoId: '', texto: '' });
    exibirNotificacao('Resposta adicionada com sucesso!', 'success');
  };

  // Função para iniciar processo de conclusão de chamado
  const handleIniciarConclusao = (chamadoId: string) => {
    if (!isAdmin) return;
    
    setNotaFechamento('');
    setMostrarModalFechamento(true);
  };

  // Função para finalizar conclusão com nota
  const handleConcluirComNota = () => {
    if (!isAdmin || !chamadoSelecionado) return;
    
    if (notaFechamento.trim() === '') {
      exibirNotificacao('Por favor, adicione uma nota de fechamento.', 'error');
      return;
    }
    
    const chamadoAtualizado = {
      ...chamadoSelecionado,
      status: 'concluido' as StatusChamado,
      dataAtualizacao: new Date(),
      notaFechamento: notaFechamento
    };
    
    setChamados(chamados.map(c => 
      c.id === chamadoSelecionado.id ? chamadoAtualizado : c
    ));
    
    setChamadoSelecionado(chamadoAtualizado);
    setMostrarModalFechamento(false);
    
    exibirNotificacao('Chamado concluído com sucesso!', 'success');
  };

  // Função para atualizar status do chamado (apenas admin)
  const handleAtualizarStatus = (chamadoId: string, novoStatus: StatusChamado) => {
    if (!isAdmin) return;
    
    // Se estiver concluindo, abrir modal para nota de fechamento
    if (novoStatus === 'concluido') {
      handleIniciarConclusao(chamadoId);
      return;
    }
    
    setChamados(chamados.map(c => 
      c.id === chamadoId 
        ? { 
            ...c, 
            status: novoStatus, 
            dataAtualizacao: new Date() 
          } 
        : c
    ));
    
    if (chamadoSelecionado && chamadoSelecionado.id === chamadoId) {
      setChamadoSelecionado({
        ...chamadoSelecionado,
        status: novoStatus,
        dataAtualizacao: new Date(),
      });
    }
    
    exibirNotificacao(`Status do chamado atualizado para ${traduzirStatus(novoStatus)}`, 'success');
  };

  // Função para exibir notificação
  const exibirNotificacao = (mensagem: string, tipo: 'success' | 'error' | 'info' | 'warning') => {
    setNotificacao({
      mensagem,
      tipo,
      mostrar: true,
    });
    
    setTimeout(() => {
      setNotificacao(prev => ({ ...prev, mostrar: false }));
    }, 3000);
  };

  // Função para traduzir status
  const traduzirStatus = (status: StatusChamado): string => {
    switch (status) {
      case 'aberto': return 'Aberto';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  // Função para obter cor do status
  const corStatus = (status: StatusChamado): string => {
    switch (status) {
      case 'aberto': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar chamados conforme seleção
  const chamadosFiltrados = chamados.filter(chamado => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'abertos') return chamado.status !== 'concluido';
    if (filtroStatus === 'concluidos') return chamado.status === 'concluido';
    return true;
  });

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800">Assessoria Direta</h1>
      </div>
      
      {/* Notificações */}
      {notificacao.mostrar && (
        <div 
          className={`p-3 mb-4 rounded-lg ${
            notificacao.tipo === 'success' ? 'bg-green-100 text-green-800' :
            notificacao.tipo === 'error' ? 'bg-red-100 text-red-800' :
            notificacao.tipo === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}
        >
          {notificacao.mensagem}
        </div>
      )}
      
      <div className="flex h-full gap-4">
        {/* Lista de chamados */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Meus Chamados</h2>
            <button
              onClick={() => {
                setMostrarFormNovoChamado(true);
                setChamadoSelecionado(null);
              }}
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700"
            >
              Novo Chamado
            </button>
          </div>
          
          {/* Filtros de status */}
          <div className="flex mb-4 gap-2">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1 text-xs rounded-lg ${
                filtroStatus === 'todos'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('abertos')}
              className={`px-3 py-1 text-xs rounded-lg ${
                filtroStatus === 'abertos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Em Aberto
            </button>
            <button
              onClick={() => setFiltroStatus('concluidos')}
              className={`px-3 py-1 text-xs rounded-lg ${
                filtroStatus === 'concluidos'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Concluídos
            </button>
          </div>
          
          {chamadosFiltrados.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Nenhum chamado encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {chamadosFiltrados
                .sort((a, b) => b.dataAtualizacao.getTime() - a.dataAtualizacao.getTime())
                .map((chamado) => (
                  <div 
                    key={chamado.id}
                    onClick={() => {
                      setChamadoSelecionado(chamado);
                      setMostrarFormNovoChamado(false);
                    }}
                    className={`p-3 border-l-4 rounded-r-lg cursor-pointer hover:bg-gray-50 ${
                      chamadoSelecionado?.id === chamado.id 
                        ? 'bg-blue-50 border-blue-500' 
                        : chamado.status === 'concluido'
                          ? 'border-green-500'
                          : 'border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">{chamado.titulo}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${corStatus(chamado.status)}`}>
                        {traduzirStatus(chamado.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(chamado.dataAtualizacao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {chamado.respostas.length > 0 
                        ? `${chamado.respostas.length} resposta(s)` 
                        : 'Sem respostas'}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {/* Detalhe do chamado ou formulário de novo chamado */}
        <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-hidden flex flex-col">
          {mostrarFormNovoChamado ? (
            // Formulário de novo chamado
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Abrir Novo Chamado</h2>
              
              <form onSubmit={handleAdicionarChamado} className="flex-1 flex flex-col">
                <div className="mb-4">
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={novoChamado.titulo}
                    onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Dúvida sobre o sistema de avaliação"
                    required
                  />
                </div>
                
                <div className="mb-4 flex-1">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição detalhada
                  </label>
                  <textarea
                    id="descricao"
                    value={novoChamado.descricao}
                    onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })}
                    className="w-full h-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva sua dúvida ou problema em detalhes..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarFormNovoChamado(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Abrir Chamado
                  </button>
                </div>
              </form>
            </div>
          ) : chamadoSelecionado ? (
            // Detalhes do chamado
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{chamadoSelecionado.titulo}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span>Aberto em: {format(chamadoSelecionado.dataAbertura, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    <span className={`px-2 py-1 rounded-full ${corStatus(chamadoSelecionado.status)}`}>
                      {traduzirStatus(chamadoSelecionado.status)}
                    </span>
                  </div>
                </div>
                
                {isAdmin && chamadoSelecionado.status !== 'concluido' && (
                  <div className="flex gap-2">
                    {chamadoSelecionado.status === 'aberto' && (
                      <button
                        onClick={() => handleAtualizarStatus(chamadoSelecionado.id, 'em_andamento')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Iniciar Atendimento
                      </button>
                    )}
                    <button
                      onClick={() => handleAtualizarStatus(chamadoSelecionado.id, 'concluido')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descrição do problema:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{chamadoSelecionado.descricao}</p>
              </div>
              
              {/* Nota de fechamento (se concluído) */}
              {chamadoSelecionado.status === 'concluido' && chamadoSelecionado.notaFechamento && (
                <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Resolução:</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">{chamadoSelecionado.notaFechamento}</p>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Respostas:</h3>
                
                {chamadoSelecionado.respostas.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Nenhuma resposta ainda. {isAdmin ? 'Responda ao chamado abaixo.' : 'Aguardando resposta da equipe.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chamadoSelecionado.respostas.map((resposta) => (
                      <div 
                        key={resposta.id} 
                        className={`p-4 rounded-lg ${
                          resposta.autorAdmin 
                            ? 'bg-blue-50 ml-8' 
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800">
                            {resposta.autorAdmin ? 'Equipe de Suporte' : chamadoSelecionado.usuario}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(resposta.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{resposta.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {chamadoSelecionado.status !== 'concluido' && (
                <div className="mt-4">
                  <form onSubmit={handleAdicionarResposta} className="flex flex-col">
                    <textarea
                      value={novaResposta.texto}
                      onChange={(e) => setNovaResposta({ ...novaResposta, texto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={isAdmin ? "Digite sua resposta para o usuário..." : "Digite sua resposta..."}
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Enviar Resposta
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            // Nenhum chamado selecionado
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="mb-4">Selecione um chamado para visualizar ou</p>
              <button
                onClick={() => setMostrarFormNovoChamado(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Abra um Novo Chamado
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de nota de fechamento */}
      {mostrarModalFechamento && chamadoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Concluir Atendimento</h2>
            
            <p className="text-gray-600 mb-4">
              Adicione uma nota de fechamento resumindo o problema e como foi solucionado:
            </p>
            
            <textarea
              value={notaFechamento}
              onChange={(e) => setNotaFechamento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={5}
              placeholder="Ex: O usuário estava com dificuldades para acessar o sistema devido a problemas com permissões. Foi feita a correção no perfil de acesso e orientado sobre o procedimento correto."
              required
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarModalFechamento(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConcluirComNota}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Concluir Atendimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 