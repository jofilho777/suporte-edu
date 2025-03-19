import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Usando os mesmos dados simulados (em um sistema real, isso estaria em um banco de dados)
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

export async function GET(request: NextRequest) {
  try {
    // Obter o token do Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar o token
    const decoded = verify(token, process.env.JWT_SECRET || 'suporte-edu-secret-key') as {
      userId: string;
      email: string;
      secretariaId: string;
      nivelPermissao: string;
    };
    
    // Encontrar o usuário pelo ID
    const usuario = usuarios.find(u => u.id === decoded.userId && u.ativo);
    
    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuário não encontrado ou desativado' },
        { status: 404 }
      );
    }
    
    // Para superadmin, não é necessário verificar a secretaria
    if (usuario.nivelPermissao === 'superadmin') {
      // Omitir a senha do usuário antes de retornar
      const { senha, ...usuarioSemSenha } = usuario;
      
      return NextResponse.json({
        user: usuarioSemSenha,
        secretaria: null,
      });
    }
    
    // Para outros usuários, encontrar a secretaria correspondente
    const secretaria = secretarias.find(s => s.id === usuario.secretariaId);
    
    if (!secretaria || !secretaria.ativa) {
      return NextResponse.json(
        { message: 'Secretaria não encontrada ou desativada' },
        { status: 403 }
      );
    }
    
    // Omitir a senha do usuário antes de retornar
    const { senha, ...usuarioSemSenha } = usuario;
    
    return NextResponse.json({
      user: usuarioSemSenha,
      secretaria,
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { message: 'Token inválido ou expirado' },
      { status: 401 }
    );
  }
} 