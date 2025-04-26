// src/app/booking/manage/@dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CreateShopRequestForm from '@/components/addShopFormFull';
import UserProfile from '@/components/UserProfile';

export default async function addShopForAdminPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;
  
    return (
      <main className="bg-slate-500 m-5 p-5 rounded-lg">
        <div className="space-y-5">
          <UserProfile />
          {session.user.role === 'admin' && <CreateShopRequestForm />}
        </div>
      </main>
    );
  }
  