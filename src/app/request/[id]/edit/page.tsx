// src/app/items/[itemId]/edit/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import EditRequestForm from '@/components/EditRequestForm';
import FileUploadInputTest from '@/components/FileUploadInputTest';

interface PageProps {
    params: {
      id: string;
    };
  }

export default async function editShopForAdminPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;

    // const id = params.id;
    // console.log(id);

    return (
      <main className="bg-slate-500 m-5 p-5 rounded-lg">
        <div className="space-y-5">
          {session.user.role === 'shopOwner' && <EditRequestForm requestId={params.id}/>}
        </div>
      </main>
    );
  }