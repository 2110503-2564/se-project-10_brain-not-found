// src/app/booking/manage/@dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CreateShopRequestForm from '@/components/addShopFormFull';
import FileUploadInputTest from '@/components/FileUploadInputTest';
import { Suspense } from 'react';
import { LinearProgress } from '@mui/material';

export default async function addShopForAdminPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;
  
    return (
      <main className="bg-slate-500 m-5 p-5 rounded-lg">
        <div className="space-y-5">
          
        <Suspense fallback={<LinearProgress/>}>
          {session.user.role === 'shopOwner' && <CreateShopRequestForm />}
        </Suspense>
        </div>
      </main>
    );
  }
  