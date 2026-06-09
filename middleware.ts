import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Definisikan rute yang butuh proteksi (hindari rute halaman login itu sendiri)
  const isAdminPath = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/register');
  const isEmployeePath = pathname.startsWith('/employee') && !pathname.startsWith('/employee/login');

  if (isAdminPath || isEmployeePath) {
    // 1. Jika tidak ada sesi (sudah logout), redirect ke halaman login masing-masing
    if (!token) {
      if (isAdminPath) return NextResponse.redirect(new URL('/admin/login', req.url));
      if (isEmployeePath) return NextResponse.redirect(new URL('/employee/login', req.url));
    }

    // 2. Jika perannya salah (Admin memaksa masuk ke Employee atau sebaliknya)
    if (isAdminPath && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (isEmployeePath && token?.role !== 'employee') {
      return NextResponse.redirect(new URL('/employee/login', req.url));
    }

    // 3. Modifikasi Header untuk "Membunuh" Cache Browser (bfcache)
    // Ini memastikan bahwa jika user memencet tombol "Back" setelah logout,
    // browser DILARANG mengambil halaman dari history cache, melainkan 
    // dipaksa me-load ulang dari server, lalu dicegat oleh script redirect di atas.
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Khusus untuk Next.js App Router agar tidak melakukan soft-cache di client
    response.headers.set('x-middleware-cache', 'no-cache');
    
    return response;
  }

  return NextResponse.next();
}

// Hanya jalankan middleware ini pada route /admin/* dan /employee/*
export const config = {
  matcher: ['/admin/:path*', '/employee/:path*'],
};
