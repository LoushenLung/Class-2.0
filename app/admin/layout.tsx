import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/guards';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If not logged in, redirect to login page with return destination
  if (!user) {
    redirect('/login?next=/admin/dashboard');
  }

  // If logged in but does not possess admin or bendahara privileges, redirect to home
  if (user.role !== 'admin' && user.role !== 'bendahara') {
    redirect('/');
  }

  return <>{children}</>;
}
