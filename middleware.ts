import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não exigem autenticação
const publicRoutes = ['/auth/login', '/auth/cadastro', '/auth/recuperar-senha'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('suporte-edu-token')?.value;
  const { pathname } = request.nextUrl;
  
  console.log('Middleware processando rota:', pathname, 'Token presente:', !!token);
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Ignorar assets e API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/') || 
      pathname === '/favicon.ico' ||
      pathname === '/') {
    return NextResponse.next();
  }
  
  // Redirecionar para login se não estiver autenticado e tentar acessar rota protegida
  if (!token && !isPublicRoute) {
    console.log('Redirecionando para login (não autenticado):', pathname);
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // Redirecionar para dashboard se estiver autenticado e tentar acessar rota pública
  if (token && isPublicRoute) {
    console.log('Redirecionando para home (já autenticado):', pathname);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 