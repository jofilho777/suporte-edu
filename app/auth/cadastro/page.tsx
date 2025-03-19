'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Estados brasileiros para o select
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Cadastro() {
  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    nomeSecretaria: '',
    municipio: '',
    estado: '',
    endereco: '',
    telefone: '',
    
    nomeGestor: '',
    email: '',
    cargo: '',
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  
  // Atualizar o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (
      !formData.nomeSecretaria || 
      !formData.municipio || 
      !formData.estado || 
      !formData.nomeGestor || 
      !formData.email || 
      !formData.cargo || 
      !formData.password
    ) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Validar senhas
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Enviar dados para a API
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.message || 'Ocorreu um erro ao processar o cadastro.');
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setError('Ocorreu um erro ao processar o cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-[80px] relative">
                <Image 
                  src="/logose.png" 
                  alt="Suporte Edu Logo" 
                  width={180}
                  height={80}
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Cadastro Enviado com Sucesso!</h2>
            <p className="text-gray-600 mb-4">
              Seu cadastro foi enviado e está em análise pela nossa equipe. 
              Entraremos em contato em breve através do e-mail informado.
            </p>
            <p className="text-gray-600">
              Você será redirecionado para a página de login em alguns segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-[80px] relative">
              <Image 
                src="/logose.png" 
                alt="Suporte Edu Logo" 
                width={180}
                height={80}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-blue-900">
            Cadastro de Secretaria de Educação
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dados da Secretaria</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nomeSecretaria" className="block text-sm font-medium text-gray-700">
                  Nome da Secretaria *
                </label>
                <input
                  id="nomeSecretaria"
                  name="nomeSecretaria"
                  type="text"
                  required
                  value={formData.nomeSecretaria}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Secretaria Municipal de Educação de..."
                />
              </div>
              
              <div>
                <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">
                  Município *
                </label>
                <input
                  id="municipio"
                  name="municipio"
                  type="text"
                  required
                  value={formData.municipio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nome do município"
                />
              </div>
              
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado *
                </label>
                <select
                  id="estado"
                  name="estado"
                  required
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione um estado</option>
                  {estadosBrasileiros.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Rua, número, bairro"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Dados do Gestor Principal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nomeGestor" className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  id="nomeGestor"
                  name="nomeGestor"
                  type="text"
                  required
                  value={formData.nomeGestor}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                  Cargo *
                </label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  required
                  value={formData.cargo}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: Secretário(a) de Educação"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Senha"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Solicitar Cadastro'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              * Campos obrigatórios. Ao solicitar o cadastro, nossa equipe analisará as informações
              e entrará em contato para validar o acesso.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
} 