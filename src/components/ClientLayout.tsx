// components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import VerticalNavbar from '@/components/VerticalNavbar/VerticalNavbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbarRoutes = ['/login'];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <div className="flex">
      {!shouldHideNavbar && <VerticalNavbar />}
      <main className={!shouldHideNavbar ? 'ml-72 flex-1 min-h-screen bg-gray-100' : 'w-full'}>
        {children}
      </main>
    </div>  
  );
}
