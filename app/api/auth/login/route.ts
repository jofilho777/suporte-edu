import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Dados simulados para teste (em um sistema real, isso estaria em um banco de dados)
const usuarios = [
  {
    id: 'user-1',
    nome: 'Administrador',
    email: 'admin@suporteedu.com',
    senha: 'admin123',
    secretariaId: 'sec-1',
    cargo: 'Administrador do Sistema',
    nivelPermissao: 'superadmin',
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
  },
  {
    id: 'user-3',
    nome: 'Super Administrador',
    email: 'super@admin.com',
    senha: 'super123',
    secretariaId: '', // Superadmin não está vinculado a nenhuma secretaria
    cargo: 'Super Administrador do Sistema',
    nivelPermissao: 'superadmin',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const secretarias = [
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
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validar os dados de entrada
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Encontrar o usuário pelo email (em um sistema real, verificaria o hash da senha)
    const usuario = usuarios.find(
      u => u.email === email && u.senha === password && u.ativo
    );
    
    if (!usuario) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }
    
    // Para superadmin, não é necessário verificar a secretaria
    let secretaria = null;
    if (usuario.nivelPermissao === 'superadmin') {
      // Superadmin não precisa estar vinculado a uma secretaria
      console.log('Login de superadmin - sem verificação de secretaria');
    } else {
      // Para outros usuários, encontrar a secretaria do usuário
      secretaria = secretarias.find(s => s.id === usuario.secretariaId);
      
      if (!secretaria || !secretaria.ativa) {
        return NextResponse.json(
          { message: 'Secretaria não encontrada ou desativada' },
          { status: 403 }
        );
      }
    }
    
    // Gerar token JWT
    const token = sign(
      {
        userId: usuario.id,
        email: usuario.email,
        secretariaId: usuario.secretariaId,
        nivelPermissao: usuario.nivelPermissao,
      },
      process.env.JWT_SECRET || 'suporte-edu-secret-key',
      { expiresIn: '24h' }
    );
    
    // Omitir a senha do usuário antes de retornar
    const { senha, ...usuarioSemSenha } = usuario;
    
    // Criar resposta com o cookie
    const response = NextResponse.json({
      user: usuarioSemSenha,
      secretaria,
      token,
    });
    
    // Adicionar cookie diretamente na resposta
    response.cookies.set('suporte-edu-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Erro durante o login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 