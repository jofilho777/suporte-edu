'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import { CategoriaMemorial, Documento, TipoDocumento } from '../models/tipos';

// Componente para o formulário de upload de documentos
const DocumentoForm = ({ 
  isOpen, 
  onClose, 
  onSave,
  categorias 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt' | 'secretariaId' | 'criadoPor'>) => void;
  categorias: { valor: CategoriaMemorial; label: string }[]
}) => {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'administrativa' as CategoriaMemorial,
    tipo: 'texto' as TipoDocumento,
    conteudo: '',
    arquivo: null as File | null,
    tags: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm(prev => ({ ...prev, arquivo: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar documento para salvar
    const newDoc: any = {
      titulo: form.titulo,
      descricao: form.descricao,
      categoria: form.categoria,
      tipo: form.tipo,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    // Adicionar conteúdo específico baseado no tipo
    if (form.tipo === 'texto') {
      newDoc.conteudo = form.conteudo;
    } else if (form.tipo === 'arquivo' && form.arquivo) {
      // Em uma implementação real, aqui faríamos o upload do arquivo
      // e usaríamos a URL retornada
      newDoc.arquivoUrl = URL.createObjectURL(form.arquivo);
      newDoc.arquivoNome = form.arquivo.name;
      newDoc.arquivoTamanho = form.arquivo.size;
      newDoc.arquivoTipo = form.arquivo.type;
    }

    onSave(newDoc);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      titulo: '',
      descricao: '',
      categoria: 'administrativa',
      tipo: 'texto',
      conteudo: '',
      arquivo: null,
      tags: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">Adicionar Documento</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-gray-700 font-medium mb-1">
              Título*
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="descricao" className="block text-gray-700 font-medium mb-1">
              Descrição*
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="categoria" className="block text-gray-700 font-medium mb-1">
              Categoria*
            </label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categorias.map((cat) => (
                <option key={cat.valor} value={cat.valor}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="tipo" className="block text-gray-700 font-medium mb-1">
              Tipo de Documento*
            </label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="texto">Texto</option>
              <option value="arquivo">Arquivo</option>
            </select>
          </div>

          {form.tipo === 'texto' ? (
            <div className="mb-4">
              <label htmlFor="conteudo" className="block text-gray-700 font-medium mb-1">
                Conteúdo*
              </label>
              <textarea
                id="conteudo"
                name="conteudo"
                value={form.conteudo}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="arquivo" className="block text-gray-700 font-medium mb-1">
                Arquivo*
              </label>
              <input
                type="file"
                id="arquivo"
                name="arquivo"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="tags" className="block text-gray-700 font-medium mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Ex: relatório, orçamento, 2023"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para exibir detalhes de um documento
const DocumentoDetalhes = ({ 
  documento, 
  isOpen, 
  onClose 
}: { 
  documento: Documento | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen || !documento) return null;

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar o tamanho do arquivo
  const formatarTamanho = (bytes: number | undefined) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">{documento.titulo}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 text-gray-600">
          <p><span className="font-semibold">Adicionado em:</span> {formatarData(documento.createdAt)}</p>
          <p><span className="font-semibold">Última atualização:</span> {formatarData(documento.updatedAt)}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Descrição:</h3>
          <p className="mt-1 text-gray-800">{documento.descricao}</p>
        </div>

        {documento.tipo === 'texto' ? (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Conteúdo:</h3>
            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-800 whitespace-pre-wrap">
              {documento.conteudo}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Arquivo:</h3>
            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p><span className="font-medium">Nome:</span> {documento.arquivoNome}</p>
              <p><span className="font-medium">Tamanho:</span> {formatarTamanho(documento.arquivoTamanho)}</p>
              <p><span className="font-medium">Tipo:</span> {documento.arquivoTipo}</p>
              <div className="mt-3">
                <a 
                  href={documento.arquivoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        )}

        {documento.tags && documento.tags.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Tags:</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {documento.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal do Memorial de Gestão
export default function MemorialGestaoPage() {
  const { user, secretaria, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaMemorial | 'todas'>('todas');
  const [termoBusca, setTermoBusca] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);

  // Mapeamento de categorias para exibição
  const categorias = [
    { valor: 'administrativa' as CategoriaMemorial, label: 'Administrativa' },
    { valor: 'pedagogica' as CategoriaMemorial, label: 'Pedagógica' },
    { valor: 'orcamentaria' as CategoriaMemorial, label: 'Orçamentária e Financeira' },
    { valor: 'alimentacao' as CategoriaMemorial, label: 'Alimentação Escolar' },
    { valor: 'transporte' as CategoriaMemorial, label: 'Transporte Escolar' },
    { valor: 'programas' as CategoriaMemorial, label: 'Programas e Projetos' },
  ];

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/memorial');
    }
  }, [isLoading, isAuthenticated, router]);

  // Carregar documentos (simulado - em um sistema real, viria da API)
  useEffect(() => {
    if (isAuthenticated && secretaria) {
      // Verificar se existem documentos no localStorage
      const storedDocs = localStorage.getItem('memorial-documentos');
      
      if (storedDocs) {
        try {
          // Parsear e converter as datas para objetos Date
          const docs = JSON.parse(storedDocs).map((doc: any) => ({
            ...doc,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt)
          }));
          
          // Filtrar apenas documentos da secretaria atual
          const filteredDocs = docs.filter((doc: Documento) => 
            doc.secretariaId === secretaria.id
          );
          
          setDocumentos(filteredDocs);
        } catch (error) {
          console.error('Erro ao carregar documentos:', error);
          setDocumentos([]);
        }
      } else {
        // Dados de exemplo
        const exemploDocumentos: Documento[] = [
          {
            id: '1',
            titulo: 'Plano Municipal de Educação',
            descricao: 'Documento orientador da política educacional do município para os próximos 10 anos.',
            categoria: 'administrativa',
            tipo: 'texto',
            conteudo: 'Este documento apresenta as metas e estratégias para a educação municipal no período de 2023 a 2033, alinhadas com o Plano Nacional de Educação e as necessidades locais.',
            secretariaId: secretaria.id,
            criadoPor: user?.id || 'sistema',
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(2023, 0, 15),
            tags: ['pme', 'planejamento', 'metas']
          },
          {
            id: '2',
            titulo: 'Relatório de Gestão Financeira - 1º Trimestre',
            descricao: 'Relatório detalhado da execução financeira da Secretaria de Educação no primeiro trimestre.',
            categoria: 'orcamentaria',
            tipo: 'arquivo',
            arquivoUrl: '/documentos/relatorio-financeiro.pdf', // Simulado
            arquivoNome: 'relatorio-financeiro-1-trim-2023.pdf',
            arquivoTamanho: 2457000, // ~2.4 MB
            arquivoTipo: 'application/pdf',
            secretariaId: secretaria.id,
            criadoPor: user?.id || 'sistema',
            createdAt: new Date(2023, 3, 10),
            updatedAt: new Date(2023, 3, 10),
            tags: ['financeiro', 'trimestral', 'prestação de contas']
          },
        ];
        
        setDocumentos(exemploDocumentos);
        localStorage.setItem('memorial-documentos', JSON.stringify(exemploDocumentos));
      }
    }
  }, [isAuthenticated, secretaria, user]);

  // Filtrar documentos por categoria e termo de busca
  useEffect(() => {
    let resultado = [...documentos];
    
    // Filtrar por categoria
    if (categoriaAtiva !== 'todas') {
      resultado = resultado.filter(doc => doc.categoria === categoriaAtiva);
    }
    
    // Filtrar por termo de busca
    if (termoBusca.trim() !== '') {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(doc => {
        // Dividir o título em palavras individuais e verificar se alguma contém o termo
        const palavrasDoTitulo = doc.titulo.toLowerCase().split(/\s+/);
        const tituloContemTermo = palavrasDoTitulo.some(palavra => 
          palavra.includes(termo)
        ) || doc.titulo.toLowerCase().includes(termo);
        
        return tituloContemTermo || 
          doc.descricao.toLowerCase().includes(termo) || 
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(termo)));
      });
    }
    
    setFilteredDocumentos(resultado);
  }, [documentos, categoriaAtiva, termoBusca]);

  // Adicionar novo documento
  const handleSaveDocumento = (novoDoc: Omit<Documento, 'id' | 'createdAt' | 'updatedAt' | 'secretariaId' | 'criadoPor'>) => {
    const newDocumento: Documento = {
      ...novoDoc,
      id: `doc-${Date.now()}`,
      secretariaId: secretaria?.id || '',
      criadoPor: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedDocumentos = [...documentos, newDocumento];
    setDocumentos(updatedDocumentos);
    localStorage.setItem('memorial-documentos', JSON.stringify(updatedDocumentos));
    setShowForm(false);
  };

  // Renderizar carregamento
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

  // Renderizar acesso negado
  if (!isAuthenticated || !secretaria) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-red-600">Acesso negado. Faça login para visualizar esta página.</p>
      </div>
    );
  }

  // Função para formatar a data
  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Memorial de Gestão</h1>
          <p className="text-gray-600 mt-2">
            Gerencie documentos e informações importantes da sua Secretaria de Educação
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Adicionar Documento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <label htmlFor="busca" className="block text-gray-700 font-medium mb-2">
              Buscar Documentos
            </label>
            <input
              type="text"
              id="busca"
              placeholder="Digite para buscar por título, descrição ou tags..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoriaAtiva('todas')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  categoriaAtiva === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.valor}
                  onClick={() => setCategoriaAtiva(cat.valor as CategoriaMemorial)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    categoriaAtiva === cat.valor
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredDocumentos.length === 0 ? (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">Nenhum documento encontrado</p>
              {termoBusca || categoriaAtiva !== 'todas' ? (
                <button
                  onClick={() => {
                    setTermoBusca('');
                    setCategoriaAtiva('todas');
                  }}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Limpar filtros
                </button>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar seu primeiro documento
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocumentos.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setDocumentoSelecionado(doc);
                    setShowDetalhes(true);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start mb-2">
                      <div className={`p-2 rounded-md mr-3 ${
                        doc.tipo === 'texto' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {doc.tipo === 'texto' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{doc.titulo}</h3>
                        <p className="text-sm text-gray-500">{formatarData(doc.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{doc.descricao}</p>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{doc.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      doc.categoria === 'administrativa' ? 'bg-blue-100 text-blue-800' :
                      doc.categoria === 'pedagogica' ? 'bg-purple-100 text-purple-800' :
                      doc.categoria === 'orcamentaria' ? 'bg-green-100 text-green-800' :
                      doc.categoria === 'alimentacao' ? 'bg-orange-100 text-orange-800' :
                      doc.categoria === 'transporte' ? 'bg-red-100 text-red-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {categorias.find(cat => cat.valor === doc.categoria)?.label || doc.categoria}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Componentes de modal */}
      <DocumentoForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveDocumento}
        categorias={categorias}
      />
      
      <DocumentoDetalhes 
        documento={documentoSelecionado} 
        isOpen={showDetalhes} 
        onClose={() => setShowDetalhes(false)} 
      />
    </div>
  );
} 