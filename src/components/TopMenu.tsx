import Image from 'next/image';
import TopMenuItem from './TopMenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Link } from '@mui/material';

export default async function TopMenu() {
  const session = await getServerSession(authOptions);
  if (session) console.log(session);

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-wheat z-30 border-t border-b border-lightblue flex justify-between items-center px-4 space-x-6">
      {/* <Image 
        src="/img/logo.png" 
        alt="logo" 
        width={0} 
        height={0} 
        sizes="100vh" 
        className="h-full w-auto" 
      /> */}

      <div className="flex space-x-6">
        <TopMenuItem title="About" link="/about" />
        <TopMenuItem title="Massage" link="/shops" />
      </div>

      <div className="flex items-center space-x-6">
        {session ? (
          <Link href="/api/auth/signout">
            <div className="flex items-center gap-2 h-full px-4 bg-white rounded-2xl border border-blue-500 hover:bg-blue-500 hover:text-white">Sign-Out</div>
          </Link>
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/api/auth/signin">
              <div className="flex items-center gap-2 h-full px-4 bg-white rounded-2xl border border-blue-500 hover:bg-blue-500 hover:text-white">
                Sign-In
              </div>
            </Link>
            <Link href="/register">
              <div className="flex items-center gap-2 h-full px-4 bg-white rounded-2xl border border-blue-500 hover:bg-blue-500 hover:text-white">
                Get Started
              </div>
            </Link>
          </div>
        )}

        <TopMenuItem title="My Booking" link="/mybooking" />
      </div>
    </div>
  );
}
