// src/app/booking/manage/@dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CreateShopForm from '@/components/addShopFormFull';
import FileUploadInputTest from '@/components/FileUploadInputTest';

export default async function addShopForAdminPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;
  
    return (
      <main className="bg-slate-500 m-5 p-5 rounded-lg">
        <div className="space-y-5">

          {session.user.role === 'shopOwner' && <FileUploadInputTest />}
          {session.user.role === 'shopOwner' && <CreateShopForm />}
        </div>
      </main>
    );
  }
  