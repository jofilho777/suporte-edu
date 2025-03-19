import { NextRequest, NextResponse } from 'next/server';

// Usando os mesmos dados simulados
const usuarios = [
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
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário existe
    const usuario = usuarios.find(u => u.email === email && u.ativo);
    
    // Mesmo se o usuário não existir, retornamos sucesso por questões de segurança
    // (não queremos informar quais e-mails estão cadastrados)
    
    if (usuario) {
      // Em um sistema real, geraríamos um token de recuperação de senha
      // e enviaríamos um email com um link para redefinição
      console.log(`Email de recuperação de senha enviado para ${email}`);
    } else {
      console.log(`Tentativa de recuperação para email não cadastrado: ${email}`);
    }
    
    return NextResponse.json({
      message: 'Se o email estiver cadastrado, enviaremos instruções para recuperação de senha',
      success: true,
    });
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 