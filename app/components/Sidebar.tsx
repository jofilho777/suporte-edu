'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, secretaria, isAuthenticated, logout } = useAuth();
  
  // Itens do menu principal
  const menuItems = [
    {
      title: 'Início',
      icon: 'home',
      href: '/',
      requireAuth: false
    },
    {
      title: 'Calendário',
      icon: 'calendar',
      href: '/calendario',
      requireAuth: true
    },
    {
      title: 'Assessoria',
      icon: 'headset',
      href: '/assessoria',
      requireAuth: true
    },
    {
      title: 'Chat Inteligente',
      icon: 'message',
      href: '/chat',
      requireAuth: true
    },
    {
      title: 'Memorial de Gestão',
      icon: 'folder',
      href: '/memorial',
      requireAuth: true
    },
    {
      title: 'Painel Administrativo',
      icon: 'shield',
      href: '/admin',
      requireAuth: true,
      adminOnly: true
    }
  ];

  // Itens de autenticação para o rodapé do sidebar
  const authItems = isAuthenticated
    ? [
        { href: '/perfil', label: 'Meu Perfil' },
        { href: '#', label: 'Sair', onClick: logout },
      ]
    : [
        { href: '/auth/login', label: 'Entrar' },
        { href: '/auth/cadastro', label: 'Solicitar Acesso' },
      ];

  // Filtrar itens com base na autenticação
  const filteredMenuItems = menuItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (item.adminOnly && (!user || (user.nivelPermissao !== 'admin' && user.nivelPermissao !== 'superadmin'))) return false;
    return true;
  });
  
  // Filtrar itens de autenticação com base no nível de permissão
  const filteredAuthItems = authItems;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-blue-900 text-white shadow-lg flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-center mb-6">
          <div className="h-[60px] relative">
            <Image 
              src="/logose.png" 
              alt="Suporte Edu Logo" 
              width={0}
              height={0}
              sizes="100vw"
              className="h-full w-auto object-contain"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
        
        {isAuthenticated && secretaria && (
          <div className="mb-4 p-3 bg-blue-800 rounded-lg">
            <h3 className="text-xs text-blue-300 font-medium uppercase">Secretaria</h3>
            <p className="text-sm font-semibold truncate">{secretaria.nome}</p>
            <p className="text-xs text-blue-200">{secretaria.municipio} - {secretaria.estado}</p>
          </div>
        )}
        
        <nav>
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`block py-2 px-4 rounded transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-200 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Rodapé com informações do usuário e opções de auth */}
      <div className="p-4 border-t border-blue-800">
        {isAuthenticated && user ? (
          <div className="mb-4">
            <p className="font-medium text-sm">{user.nome}</p>
            <p className="text-xs text-blue-300">{user.cargo}</p>
          </div>
        ) : null}
        
        <ul className="space-y-2">
          {filteredAuthItems.map((item, index) => (
            <li key={index}>
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="w-full text-left block py-2 px-4 rounded transition-colors duration-200 text-gray-200 hover:bg-blue-800 hover:text-white"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="block py-2 px-4 rounded transition-colors duration-200 text-gray-200 hover:bg-blue-800 hover:text-white"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 