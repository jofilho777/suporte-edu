import { NextRequest, NextResponse } from 'next/server';

// Em um sistema real, isso seria um banco de dados
let secretarias = [
  {
    id: 'sec-1',
    nome: 'Secretaria Municipal de Educação de Exemplo',
    municipio: 'Exemplo',
    estado: 'SP',
    endereco: 'Rua Exemplo, 123',
    telefone: '(11) 1234-5678',
    logo: '',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

let usuarios = [
  {
    id: 'user-1',
    nome: 'Administrador',
    email: 'admin@suporteedu.com',
    senha: 'admin123',
    secretariaId: 'sec-1',
    cargo: 'Administrador do Sistema',
    nivelPermissao: 'admin',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    nome: 'Gestor Municipal',
    email: 'gestor@exemplo.com',
    senha: 'gestor123',
    secretariaId: 'sec-1',
    cargo: 'Secretário de Educação',
    nivelPermissao: 'gestor',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export async function POST(request: NextRequest) {
  try {
    const {
      nomeSecretaria,
      municipio,
      estado,
      endereco,
      telefone,
      nomeGestor,
      email,
      cargo,
      password
    } = await request.json();
    
    // Validar campos obrigatórios
    if (!nomeSecretaria || !municipio || !estado || !nomeGestor || !email || !cargo || !password) {
      return NextResponse.json(
        { message: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }
    
    // Verificar se o email já está cadastrado
    if (usuarios.some(u => u.email === email)) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado no sistema' },
        { status: 409 }
      );
    }
    
    // Gerar IDs (em um sistema real, seria automático pelo banco de dados)
    const secretariaId = `sec-${Date.now()}`;
    const usuarioId = `user-${Date.now()}`;
    
    // Criar nova secretaria
    const novaSecretaria = {
      id: secretariaId,
      nome: nomeSecretaria,
      municipio,
      estado,
      endereco: endereco || '',
      telefone: telefone || '',
      logo: '',
      ativa: false, // Começa inativa até aprovação
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Criar novo usuário gestor
    const novoGestor = {
      id: usuarioId,
      nome: nomeGestor,
      email,
      senha: password, // Em um sistema real, seria hashado
      secretariaId,
      cargo,
      nivelPermissao: 'gestor',
      ativo: false, // Começa inativo até aprovação
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Em um sistema real, isso seria uma transação em banco de dados
    secretarias.push(novaSecretaria);
    usuarios.push(novoGestor);
    
    // Em um sistema real, enviaríamos um email para o gestor
    console.log(`Email de confirmação enviado para ${email}`);
    
    return NextResponse.json({
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação.',
      success: true,
    });
  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 