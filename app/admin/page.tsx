import { redirect } from 'next/navigation';

// /admin → always go to dashboard (middleware handles auth redirect to login)
export default function AdminRoot() {
  redirect('/admin/dashboard');
}
