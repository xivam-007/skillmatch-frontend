import { redirect } from 'next/navigation';

// The root "/" always redirects — auth state is managed client-side
// so we send users to /discover (the auth guard there will redirect to /auth/login if needed)
export default function RootPage() {
  redirect('/discover');
}
