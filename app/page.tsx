'use client';

import { useAuth } from './providers/AuthProvider';
import Link from 'next/link';

export default function Home() {
  const { user, secretaria, isAuthenticated, isLoading } = useAuth();

  // Conteúdo para usuários autenticados
  const conteudoAutenticado = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8 border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          Bem-vindo, {user?.nome}!
        </h1>
        <p className="text-lg mb-2">
          Secretaria de Educação de {secretaria?.municipio} - {secretaria?.estado}
        </p>
        <p className="text-gray-700">
          Acesse as ferramentas e recursos disponíveis para sua Secretaria no menu lateral.
        </p>
      </div>
      
      <h2 className="text-xl font-bold text-blue-800 mb-4">
        Acesso Rápido
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/chat" className="bg-white p-5 rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Chat Inteligente
          </h3>
          <p className="text-gray-600 text-sm">
            Tire dúvidas e obtenha assistência com IA
          </p>
        </Link>
        
        <Link href="/calendario" className="bg-white p-5 rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Calendário
          </h3>
          <p className="text-gray-600 text-sm">
            Gerenciar prazos e eventos importantes
          </p>
        </Link>
        
        <Link href="/assessoria" className="bg-white p-5 rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Assessoria
          </h3>
          <p className="text-gray-600 text-sm">
            Suporte especializado para sua secretaria
          </p>
        </Link>
      </div>
    </div>
  );

  // Conteúdo para visitantes não autenticados
  const conteudoPublico = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        Bem-vindo ao Suporte Edu
      </h1>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
        <p className="text-lg mb-4">
          Plataforma completa para secretarias municipais de educação, 
          oferecendo suporte inteligente e ferramentas para otimizar 
          sua gestão educacional.
        </p>
        
        <p className="text-gray-700">
          Utilize nossos módulos para simplificar processos, cumprir prazos 
          e manter um registro organizado das atividades da secretaria.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <Link 
            href="/auth/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Acessar Plataforma
          </Link>
          <Link 
            href="/auth/cadastro" 
            className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Solicitar Acesso
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Chat Inteligente
          </h2>
          <p className="text-gray-700">
            Assistente de IA para tirar dúvidas sobre gestão educacional
            e processos administrativos.
          </p>
        </div>
        
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Calendário e Prazos
          </h2>
          <p className="text-gray-700">
            Ferramenta para lembrar as secretarias de datas importantes
            e prazos oficiais do setor educacional.
          </p>
        </div>
        
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Assessoria Direta
          </h2>
          <p className="text-gray-700">
            Suporte humano especializado para processos burocráticos
            e orientações personalizadas.
          </p>
        </div>
      </div>
    </div>
  );

  // Exibir loader durante o carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated ? conteudoAutenticado() : conteudoPublico()}
    </div>
  );
}
