'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format as formatDate, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendario.css';
import { useAuth } from '../providers/AuthProvider';

// Configuração do localizador com date-fns
const locales = {
  'pt-BR': ptBR,
};

// Usar o dateFnsLocalizer fornecido pela biblioteca
const localizer = dateFnsLocalizer({
  format: formatDate,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Tipos
type Evento = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  isPersonal: boolean;
  secretariaId: string; // ID da secretaria a que pertence o evento
  createdBy: string; // ID do usuário que criou o evento
};

type Aviso = {
  id: string;
  title: string;
  content: string;
  date: Date;
  isUrgent: boolean;
  secretariaId: string; // ID da secretaria a que pertence o aviso
  createdBy: string; // ID do usuário que criou o aviso
};

// Formatação do calendário
const dayPropGetter = (date: Date, eventos: Evento[], selectedDate?: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const isToday = date.getTime() === today.getTime();
  const isSelected = selectedDate ? date.getTime() === selectedDate.getTime() : false;

  // Verificar se o dia possui múltiplos eventos
  const eventsOnDate = eventos.filter(event => isSameDay(event.start, date));
  const hasMultipleEvents = eventsOnDate.length > 1;
  
  // Verificar se o dia é do mês atual
  const currentMonth = new Date().getMonth();
  const isOtherMonth = date.getMonth() !== currentMonth;

  let className = '';
  if (isToday) className += ' rbc-day-today';
  if (isSelected) className += ' rbc-day-selected';
  if (hasMultipleEvents) className += ' rbc-day-multiple-events';
  if (isOtherMonth) className += ' rbc-day-other-month';

  return {
    className,
    style: {
      backgroundColor: isToday ? '#e6f7ff' : 
                     isSelected ? '#f0f8ff' : 
                     hasMultipleEvents ? '#f1f5fe' : 
                     isOtherMonth ? '#f9f9f9' : 'white',
      border: isSelected ? '1px solid #1a73e8' : '1px solid #ddd',
    },
  };
};

// Componente para exibir múltiplos eventos em um dia
const DayEvents = ({ events, onSelectEvent, onClose }: { 
  events: Evento[], 
  onSelectEvent: (event: Evento) => void,
  onClose: () => void 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Eventos em {formatDate(events[0].start, 'd MMMM', { locale: ptBR })}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            X
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2"
              onClick={() => {
                onSelectEvent(event);
                onClose();
              }}
            >
              <div className="flex items-start">
                <div 
                  className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${
                    event.isPersonal ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                ></div>
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{formatDate(event.start, 'HH:mm')}</span>
                    {!isSameDay(event.start, event.end) && (
                      <span> - {formatDate(event.end, 'd MMM, HH:mm')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CalendarioPage() {
  const { user, secretaria, isAuthenticated, isLoading } = useAuth();
  
  const [events, setEvents] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<Evento[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAvisoForm, setShowAvisoForm] = useState(false);
  
  // Verifica se o usuário tem permissões de administrador
  const isAdmin = user?.nivelPermissao === 'admin' || user?.nivelPermissao === 'superadmin';
  
  // Estado para notificações
  const [notifications, setNotifications] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info',
  });
  
  // Estado para modos de visualização
  const [activeTab, setActiveTab] = useState<'calendario' | 'mural'>('calendario');
  
  // Estado para novos eventos
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    isPersonal: false,
  });
  
  // Estado para novos avisos
  const [newAviso, setNewAviso] = useState({
    title: '',
    content: '',
    date: new Date(),
    isUrgent: false,
  });
  
  // Carregar eventos do localStorage ao inicializar
  useEffect(() => {
    if (!isAuthenticated || !secretaria) {
      setNotifications({
        show: true,
        message: 'Faça login para visualizar o calendário completo',
        type: 'info',
      });
      return;
    }
    
    // Buscar eventos do localStorage
    const storedEvents = localStorage.getItem('calendario-eventos');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        // Filtrar apenas eventos da secretaria atual
        const filteredEvents = parsedEvents.filter((event: Evento) => 
          event.secretariaId === secretaria.id || 
          (event.isPersonal && event.createdBy === user?.id)
        );
        
        setEvents(filteredEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    } else {
      // Dados iniciais de exemplo
      const exemploEventos: Evento[] = [
        {
          id: '1',
          title: 'Prazo para Censo Escolar',
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
          description: 'Último dia para envio dos dados do Censo Escolar',
          isPersonal: false,
          secretariaId: secretaria.id,
          createdBy: 'sistema',
        },
        {
          id: '2',
          title: 'Reunião com Diretores',
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 14, 0),
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 16, 0),
          description: 'Reunião mensal com todos os diretores da rede municipal',
          isPersonal: true,
          secretariaId: secretaria.id,
          createdBy: user?.id || 'sistema',
        },
      ];
      setEvents(exemploEventos);
      localStorage.setItem('calendario-eventos', JSON.stringify(exemploEventos));
    }
    
    // Buscar avisos do localStorage
    const storedAvisos = localStorage.getItem('calendario-avisos');
    if (storedAvisos) {
      try {
        const parsedAvisos = JSON.parse(storedAvisos).map((aviso: any) => ({
          ...aviso,
          date: new Date(aviso.date),
        }));
        
        // Filtrar apenas avisos da secretaria atual
        const filteredAvisos = parsedAvisos.filter((aviso: Aviso) => 
          aviso.secretariaId === secretaria.id
        );
        
        setAvisos(filteredAvisos);
      } catch (error) {
        console.error('Erro ao carregar avisos:', error);
      }
    } else {
      // Dados iniciais de exemplo
      const exemploAvisos: Aviso[] = [
        {
          id: '1',
          title: 'Manutenção no Sistema',
          content: 'O sistema ficará indisponível no próximo sábado para manutenção programada.',
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
          isUrgent: true,
          secretariaId: secretaria.id,
          createdBy: 'sistema',
        },
        {
          id: '2',
          title: 'Novo Módulo Disponível',
          content: 'Um novo módulo de relatórios está disponível para testes.',
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
          isUrgent: false,
          secretariaId: secretaria.id,
          createdBy: 'sistema',
        },
      ];
      setAvisos(exemploAvisos);
      localStorage.setItem('calendario-avisos', JSON.stringify(exemploAvisos));
    }
  }, [isAuthenticated, secretaria, user]);

  // Salvar eventos no localStorage quando mudarem
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendario-eventos', JSON.stringify(events));
    }
  }, [events]);
  
  // Salvar avisos no localStorage quando mudarem
  useEffect(() => {
    if (avisos.length > 0) {
      localStorage.setItem('calendario-avisos', JSON.stringify(avisos));
    }
  }, [avisos]);
  
  // Verifica notificações (eventos próximos)
  useEffect(() => {
    if (events.length > 0) {
      const today = new Date();
      const tomorrowEvents = events.filter(
        (evento) => 
          isSameDay(evento.start, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))
      );
      
      if (tomorrowEvents.length > 0) {
        setNotifications({
          show: true,
          message: `Você tem ${tomorrowEvents.length} evento(s) amanhã.`,
          type: 'info',
        });
        
        // Esconder notificação após 5 segundos
        setTimeout(() => {
          setNotifications(prev => ({ ...prev, show: false }));
        }, 5000);
      }
    }
  }, [events]);
  
  // Funções relacionadas a interface e seleção
  const handleSelectEvent = (event: Evento) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };
  
  // Função para adicionar evento
  const handleAddEvent = () => {
    const evento: Evento = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      description: newEvent.description,
      isPersonal: newEvent.isPersonal,
      secretariaId: secretaria?.id || '',
      createdBy: user?.id || '',
    };
    
    setEvents([...events, evento]);
    setShowEventForm(false);
    
    // Se o evento for público, adicionar ao mural de avisos também
    if (!evento.isPersonal) {
      const novoAviso: Aviso = {
        id: `evento-${evento.id}`,
        title: evento.title,
        content: evento.description,
        date: evento.start,
        isUrgent: false,
        secretariaId: secretaria?.id || '',
        createdBy: user?.id || '',
      };
      
      setAvisos([...avisos, novoAviso]);
      
      setNotifications({
        show: true,
        message: 'Evento adicionado e publicado no mural de avisos',
        type: 'success',
      });
    } else {
      setNotifications({
        show: true,
        message: 'Evento adicionado com sucesso',
        type: 'success',
      });
    }
  };
  
  // Função para adicionar aviso
  const handleAddAviso = () => {
    const aviso: Aviso = {
      id: `aviso-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: newAviso.title,
      content: newAviso.content,
      date: newAviso.date,
      isUrgent: newAviso.isUrgent,
      secretariaId: secretaria?.id || '',
      createdBy: user?.id || '',
    };
    
    setAvisos([...avisos, aviso]);
    setShowAvisoForm(false);
    
    setNotifications({
      show: true,
      message: 'Aviso publicado com sucesso',
      type: 'success',
    });
  };
  
  // Configuração de cores e estilos para eventos
  const eventPropGetter = (event: Evento) => {
    return {
      className: `evento-${event.isPersonal ? 'pessoal' : 'oficial'}`,
      style: {
        backgroundColor: event.isPersonal ? '#3788d8' : '#28a745',
        borderColor: event.isPersonal ? '#2970bf' : '#218838',
        borderRadius: '4px',
        opacity: 0.9,
        color: '#fff',
        border: '1px solid #1a4971',
        display: 'block',
      }
    };
  };
  
  // Função para remover evento
  const handleRemoveEvent = (id: string) => {
    // Procura se existe um aviso correspondente a esse evento
    const eventToRemove = events.find(evento => evento.id === id);
    if (eventToRemove && !eventToRemove.isPersonal) {
      // Procura e remove avisos correspondentes ao evento
      setAvisos(avisos.filter(aviso => aviso.id !== `evento-${id}`));
    }
    
    setEvents(events.filter((evento) => evento.id !== id));
    setShowEventDetail(false);
    
    setNotifications({
      show: true,
      message: 'Evento removido com sucesso',
      type: 'success',
    });
  };
  
  // Função para remover aviso
  const handleRemoveAviso = (id: string) => {
    setAvisos(avisos.filter((aviso) => aviso.id !== id));
    
    setNotifications({
      show: true,
      message: 'Aviso removido com sucesso',
      type: 'success',
    });
  };
  
  // Funções de navegação no calendário
  const goToToday = () => {
    setDate(new Date());
  };
  
  // Função para lidar com a seleção de um slot (dia ou horário)
  const handleSelectSlot = (slotInfo: { start: Date, end: Date, action: string }) => {
    if (slotInfo.action === 'click' || slotInfo.action === 'select') {
      const eventsOnDate = events.filter(event => 
        isSameDay(event.start, slotInfo.start)
      );
      
      // Se temos mais de um evento neste dia
      if (eventsOnDate.length > 1) {
        setEventsOnSelectedDate(eventsOnDate);
        setSelectedDate(slotInfo.start);
        setShowDayEvents(true);
      } 
      // Se temos apenas um evento neste dia
      else if (eventsOnDate.length === 1) {
        setSelectedEvent(eventsOnDate[0]);
        setShowEventDetail(true);
      } 
      // Se não há eventos, abre o formulário para adicionar
      else {
        setNewEvent({
          ...newEvent,
          start: slotInfo.start,
          end: slotInfo.end,
        });
        setShowEventForm(true);
      }
    }
  };
  
  // Tradução de textos do calendário
  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período',
    showMore: (total: number) => `+${total} mais`,
  };

  // Formatar datas para o calendário
  const formats = {
    monthHeaderFormat: (date: Date) => formatDate(date, 'MMMM yyyy', { locale: ptBR }),
    dayHeaderFormat: (date: Date) => formatDate(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${formatDate(start, 'dd/MM')} - ${formatDate(end, 'dd/MM')}`,
  };
  
  // Toolbar customizada
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
    
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
    
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
      setSelectedDate(new Date());
    };
    
    const label = () => {
      const date = toolbar.date;
      return (
        <span className="text-lg font-semibold">
          {formatDate(date, 'MMMM yyyy', { locale: ptBR })}
        </span>
      );
    };
    
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToBack}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={goToCurrent}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            &gt;
          </button>
        </div>
        <div>{label()}</div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg ${
              toolbar.view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => toolbar.onView('month')}
          >
            Mês
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg ${
              toolbar.view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => toolbar.onView('week')}
          >
            Semana
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg ${
              toolbar.view === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => toolbar.onView('day')}
          >
            Dia
          </button>
        </div>
      </div>
    );
  };
  
  // Referência para o calendário
  const calendarRef = useRef<any>(null);
  
  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800">Calendário e Prazos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'calendario'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Calendário
          </button>
          <button
            onClick={() => setActiveTab('mural')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'mural'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mural de Avisos
          </button>
        </div>
      </div>
      
      {/* Notificações */}
      {notifications.show && (
        <div 
          className={`p-3 mb-4 rounded-lg ${
            notifications.type === 'success' ? 'bg-green-100 text-green-800' :
            notifications.type === 'error' ? 'bg-red-100 text-red-800' :
            notifications.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}
        >
          {notifications.message}
        </div>
      )}
      
      {/* Conteúdo do Calendário */}
      {activeTab === 'calendario' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end mb-3">
            <button
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  isPersonal: false
                });
                setShowEventForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adicionar Evento
            </button>
          </div>
          
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventPropGetter}
              dayPropGetter={(date: Date) => dayPropGetter(date, events, selectedDate)}
              onSelectEvent={(event: Evento) => {
                setSelectedEvent(event);
                setShowEventDetail(true);
              }}
              onSelectSlot={handleSelectSlot}
              selectable={true}
              views={['month', 'week', 'day', 'agenda']}
              messages={messages}
              formats={formats}
              culture="pt-BR"
              components={{
                toolbar: CustomToolbar
              }}
              date={selectedDate}
              onNavigate={(newDate) => setSelectedDate(newDate)}
              ref={calendarRef}
              popup={true}
            />
          </div>
        </div>
      )}
      
      {/* Conteúdo do Mural de Avisos */}
      {activeTab === 'mural' && (
        <div className="flex-1 flex flex-col">
          {isAdmin && (
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowAvisoForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Aviso
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            {avisos.length > 0 ? (
              avisos
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((aviso) => (
                  <div 
                    key={aviso.id} 
                    className={`p-4 rounded-lg shadow ${
                      aviso.isUrgent ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{aviso.title}</h3>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveAviso(aviso.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <span className="sr-only">Remover</span>
                          &times;
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(aviso.date, 'dd/MM/yyyy')}
                    </p>
                    <p className="text-gray-700">{aviso.content}</p>
                    {aviso.isUrgent && (
                      <div className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Urgente
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="col-span-2 p-4 text-center text-gray-500">
                Nenhum aviso disponível
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal para adicionar evento */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Adicionar Evento</h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full h-8 w-8 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Título
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicionar título"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                  className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Hora Início
                </label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Data Término
                </label>
                <input
                  type="date"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                  className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Hora Término
                </label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Descrição
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Adicionar descrição"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowEventForm(false)}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para exibir detalhes do evento */}
      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start">
                <div 
                  className="w-3 h-3 mt-2 mr-3 rounded-full" 
                  style={{ backgroundColor: selectedEvent.isPersonal ? '#4285F4' : '#8430CE' }}
                ></div>
                <h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setShowEventDetail(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full h-8 w-8 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            
            <div className="ml-6 mb-6">
              <div className="flex items-center mb-3 text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDate(selectedEvent.start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center mb-4 text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(selectedEvent.start, 'HH:mm')} - {formatDate(selectedEvent.end, 'HH:mm')}</span>
              </div>
              
              {selectedEvent.description && (
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="pt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  selectedEvent.isPersonal ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {selectedEvent.isPersonal ? 'Evento Pessoal' : 'Evento Oficial'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              {(isAdmin || selectedEvent.isPersonal) && (
                <button
                  onClick={() => handleRemoveEvent(selectedEvent.id)}
                  className="bg-white text-red-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Excluir
                </button>
              )}
              <button
                onClick={() => setShowEventDetail(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para adicionar aviso */}
      {showAvisoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Aviso</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Título
              </label>
              <input
                type="text"
                value={newAviso.title}
                onChange={(e) => setNewAviso({ ...newAviso, title: e.target.value })}
                className="border rounded w-full py-2 px-3"
                placeholder="Título do aviso"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Data
              </label>
              <input
                type="date"
                value={newAviso.date}
                onChange={(e) => setNewAviso({ ...newAviso, date: e.target.value })}
                className="border rounded w-full py-2 px-3"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Conteúdo
              </label>
              <textarea
                value={newAviso.content}
                onChange={(e) => setNewAviso({ ...newAviso, content: e.target.value })}
                className="border rounded w-full py-2 px-3"
                rows={4}
                placeholder="Conteúdo do aviso"
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAviso.isUrgent}
                  onChange={(e) => setNewAviso({ ...newAviso, isUrgent: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-gray-700">Marcar como urgente</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAvisoForm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAviso}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para exibir múltiplos eventos do dia */}
      {showDayEvents && eventsOnSelectedDate.length > 0 && (
        <DayEvents 
          events={eventsOnSelectedDate} 
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setShowEventDetail(true);
          }}
          onClose={() => setShowDayEvents(false)}
        />
      )}
    </div>
  );
} 