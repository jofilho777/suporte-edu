// Tipos para usuários e autenticação
export type NivelPermissao = 'superadmin' | 'admin' | 'gestor' | 'usuario';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  secretariaId: string;
  cargo: string;
  nivelPermissao: NivelPermissao;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Secretaria = {
  id: string;
  nome: string;
  municipio: string;
  estado: string;
  endereco?: string;
  telefone?: string;
  logo?: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Tipos para mensagens de chat existentes
export type Message = {
  role: 'user' | 'ai';
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  secretariaId: string; // Adicionando vínculo com a secretaria
  userId: string; // Adicionando vínculo com o usuário que criou
};

// Tipos para eventos de calendário
export type TipoEvento = 'pessoal' | 'oficial';

export type Evento = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tipo: TipoEvento;
  descricao?: string;
  local?: string;
  allDay: boolean;
  secretariaId: string; // Adicionando vínculo com a secretaria
  createdBy: string; // ID do usuário que criou
  createdAt: Date;
  updatedAt: Date;
};

// Tipos para tickets de assessoria
export type StatusTicket = 'aberto' | 'em_andamento' | 'concluido' | 'cancelado';

export type Ticket = {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusTicket;
  prioridade: number;
  secretariaId: string; // Adicionando vínculo com a secretaria
  criadoPor: string; // ID do usuário que criou
  responsavel?: string; // ID do usuário responsável
  createdAt: Date;
  updatedAt: Date;
  respostas: RespostaTicket[];
};

export type RespostaTicket = {
  id: string;
  ticketId: string;
  conteudo: string;
  usuario: string; // ID do usuário que respondeu
  createdAt: Date;
  arquivos?: string[]; // URLs dos arquivos anexados
};

// Tipos para o Memorial de Gestão
export type CategoriaMemorial = 
  | 'administrativa' 
  | 'pedagogica' 
  | 'orcamentaria' 
  | 'alimentacao' 
  | 'transporte' 
  | 'programas';

export type TipoDocumento = 'texto' | 'arquivo';

export type Documento = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaMemorial;
  tipo: TipoDocumento;
  conteudo?: string; // Para documentos de texto
  arquivoUrl?: string; // Para documentos de arquivo
  arquivoNome?: string; // Nome original do arquivo
  arquivoTamanho?: number; // Tamanho em bytes
  arquivoTipo?: string; // MIME type
  secretariaId: string; // Vínculo com a secretaria
  criadoPor: string; // ID do usuário que criou
  createdAt: Date;
  updatedAt: Date;
  tags?: string[]; // Tags para facilitar a busca
}; 