'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export default function ChatInteligente() {
  // Estados para chats e chat atual
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Estados para mensagens e entrada
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Referência para controlar se o componente já foi inicializado
  const isInitializedRef = useRef(false);

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({
    mensagem: '',
    tipo: '',
    mostrar: false,
  });

  // Inicialização - executado apenas uma vez
  useEffect(() => {
    console.log('Efeito de inicialização executado');
    
    // Verifica se já foi inicializado para evitar múltiplas inicializações
    if (isInitializedRef.current) {
      console.log('Componente já inicializado, ignorando...');
      return;
    }
    
    // Marcar como inicializado
    isInitializedRef.current = true;
    
    // Carregar chats do localStorage
    const savedChats = localStorage.getItem('suporte-edu-chats');
    console.log('Chats salvos:', savedChats);
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt)
        }));
        
        if (parsedChats.length > 0) {
          setChats(parsedChats);
          
          // Verificar se há um chat ativo salvo
          const lastActiveChatId = localStorage.getItem('suporte-edu-active-chat');
          console.log('ID do último chat ativo:', lastActiveChatId);
          
          if (lastActiveChatId && parsedChats.some((chat: Chat) => chat.id === lastActiveChatId)) {
            console.log('Chat ativo encontrado, restaurando...');
            // Se o ID do último chat ativo existir na lista de chats, use-o
            setCurrentChatId(lastActiveChatId);
            const activeChat = parsedChats.find((chat: Chat) => chat.id === lastActiveChatId);
            if (activeChat) {
              setMessages(activeChat.messages);
            }
          } else {
            console.log('Chat ativo não encontrado, usando o mais recente');
            // Se não houver um chat ativo salvo ou ele não existir mais, seleciona o mais recente
            const mostRecentChat = parsedChats.sort(
              (a: Chat, b: Chat) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            setCurrentChatId(mostRecentChat.id);
            setMessages(mostRecentChat.messages);
          }
        } else {
          console.log('Array de chats vazio no localStorage');
        }
      } catch (e) {
        console.error('Erro ao carregar chats:', e);
      }
    } else {
      console.log('Nenhum chat salvo encontrado no localStorage');
    }
  }, []);

  // Salvar chats no localStorage sempre que mudar
  useEffect(() => {
    if (chats.length > 0) {
      console.log('Salvando chats no localStorage', chats.length, 'chats');
      localStorage.setItem('suporte-edu-chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Salvar o ID do chat ativo atual no localStorage
  useEffect(() => {
    if (currentChatId) {
      console.log('Salvando chat ativo:', currentChatId);
      localStorage.setItem('suporte-edu-active-chat', currentChatId);
    }
  }, [currentChatId]);

  // Atualizar messages quando mudar de chat
  useEffect(() => {
    if (currentChatId) {
      const chat = chats.find(c => c.id === currentChatId);
      if (chat) {
        setMessages(chat.messages);
      }
    }
  }, [currentChatId, chats]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    const welcomeMessage: Message = { 
      role: 'ai', 
      content: 'Olá! Sou o assistente do Suporte Edu. Como posso ajudar sua secretaria de educação hoje?' 
    };
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Nova conversa',
      messages: [welcomeMessage],
      createdAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([welcomeMessage]);
    setInputMessage('');
    
    exibirNotificacao('Novo chat criado!', 'success');
  };

  // Criar novo chat se não houver nenhum
  useEffect(() => {
    console.log('Verificando se precisa criar novo chat, chats.length:', chats.length);
    
    // Só cria novo chat se não existir chats salvos no localStorage também
    // E apenas se o componente já foi inicializado
    const savedChats = localStorage.getItem('suporte-edu-chats');
    
    if (chats.length === 0 && !savedChats && isInitializedRef.current) {
      console.log('Criando novo chat pois não há nenhum no estado nem no localStorage');
      createNewChat();
    }
  }, [chats]);

  const updateChatTitle = (chatId: string, messages: Message[]) => {
    // Atualiza o título com base na primeira mensagem do usuário
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading || !currentChatId) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = { role: 'user', content: inputMessage.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Atualiza o chat atual com a nova mensagem
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: updatedMessages } 
        : chat
    ));
    
    // Se for a primeira mensagem do usuário, atualiza o título
    if (messages.length === 1 && messages[0].role === 'ai') {
      updateChatTitle(currentChatId, updatedMessages);
    }
    
    setInputMessage('');
    setIsLoading(true);

    try {
      // Envia mensagens para a API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Adiciona resposta da IA
        const aiMessage: Message = { 
          role: 'ai', 
          content: data.aiResponse
        };
        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);
        
        // Atualiza o chat atual com a resposta da IA
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: newMessages } 
            : chat
        ));
      } else {
        // Em caso de erro, adiciona mensagem de erro como resposta da IA
        const errorMessage: Message = { 
          role: 'ai', 
          content: `Desculpe, ocorreu um erro: ${data.error || 'Erro desconhecido'}. Por favor, tente novamente.`
        };
        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        
        // Atualiza o chat atual com a mensagem de erro
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: newMessages } 
            : chat
        ));
        console.error("Erro na comunicação com a API:", data.error);
        exibirNotificacao('Erro ao enviar mensagem. Tente novamente.', 'error');
      }
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
      // Adiciona mensagem de erro como resposta da IA
      const errorMessage: Message = { 
        role: 'ai', 
        content: 'Desculpe, ocorreu um erro na comunicação com o assistente. Por favor, tente novamente.'
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      
      // Atualiza o chat atual com a mensagem de erro
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: newMessages } 
          : chat
      ));
      exibirNotificacao('Erro na comunicação com o servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // Se o chat excluído for o atual, seleciona outro
    if (chatId === currentChatId && chats.length > 1) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
    exibirNotificacao('Chat excluído com sucesso!', 'info');
  };

  const handleClearAllChats = () => {
    if (confirm('Tem certeza que deseja excluir todos os chats?')) {
      setChats([]);
      localStorage.removeItem('suporte-edu-chats');
      createNewChat();
      exibirNotificacao('Todos os chats foram excluídos.', 'info');
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800">Chat Inteligente</h1>
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
        {/* Lista de chats */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Meus Chats</h2>
            <div className="flex gap-2">
              <button
                onClick={createNewChat}
                className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700"
              >
                Novo Chat
              </button>
              <button
                onClick={handleClearAllChats}
                className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-sm rounded-lg hover:bg-red-100"
                title="Limpar todos os chats"
              >
                Limpar
              </button>
            </div>
          </div>
          
          {chats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Nenhum chat disponível
            </div>
          ) : (
            <div className="space-y-3">
              {chats
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => handleSelectChat(chat.id)}
                    className={`p-3 border-l-4 rounded-r-lg cursor-pointer hover:bg-gray-50 ${
                      currentChatId === chat.id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800 text-sm">{chat.title}</h3>
                      <button 
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="text-gray-400 hover:text-red-600 ml-2"
                      >
                        <span className="sr-only">Excluir</span>
                        &times;
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(chat.createdAt)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {chat.messages.length > 1 
                        ? `${chat.messages.length - 1} resposta(s)` 
                        : 'Sem mensagens'}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {/* Área principal do chat */}
        <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-hidden flex flex-col">
          {currentChatId ? (
            <>
              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                          : 'bg-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-lg rounded-tl-none px-4 py-2 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Área de entrada de mensagem */}
              <div className="mt-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex flex-col">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={inputMessage.trim() === '' || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Nenhum chat selecionado
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="mb-4">Selecione um chat para começar ou</p>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Inicie um Novo Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 