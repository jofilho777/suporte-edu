'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Secretaria } from '../models/tipos';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: Usuario | null;
  secretaria: Secretaria | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Interface para as propriedades do provedor
interface AuthProviderProps {
  children: ReactNode;
}

// Provedor de autenticação
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [secretaria, setSecretaria] = useState<Secretaria | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação quando o componente montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há um token no localStorage
        const token = localStorage.getItem('suporte-edu-token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Verificar o token com o servidor
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setSecretaria(data.secretaria);
        } else {
          // Token inválido, remover do localStorage
          localStorage.removeItem('suporte-edu-token');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função para fazer login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando tentativa de login para:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Resposta do servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login bem-sucedido, dados recebidos:', { 
          token: data.token ? 'Presente' : 'Ausente',
          user: data.user ? 'Presente' : 'Ausente', 
          secretaria: data.secretaria ? 'Presente' : 'Ausente' 
        });
        
        localStorage.setItem('suporte-edu-token', data.token);
        setUser(data.user);
        setSecretaria(data.secretaria);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        console.error('Erro no login:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Exceção ao fazer login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para fazer logout
  const logout = () => {
    localStorage.removeItem('suporte-edu-token');
    setUser(null);
    setSecretaria(null);
  };

  // Calculando se o usuário está autenticado
  const isAuthenticated = !!user;

  // Valor do contexto
  const value: AuthContextType = {
    user,
    secretaria,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 