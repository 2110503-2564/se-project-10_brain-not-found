import style from './TopMenu.module.css';
import Image from 'next/image';
import TopMenuItem from './TopMenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Link } from '@mui/material'

export default async function TopMenu(){

    const session = await getServerSession(authOptions);
    if(session)console.log(session);
    return (
        <div className={style.menucontainer}>
            <Image src={'/img/logo.png'} className={style.logoimg} alt="logo"
            width={0} height={0} sizes="100vh"/>

            <TopMenuItem title="about" link="/about"/>
            <TopMenuItem title="Booking" link="/booking"/>
            <TopMenuItem title="select Massage Shop" link="/shops"/>

            <div className='absolute left-0 h-full flex flex-row'>
            
            {
                session? <Link href="/api/auth/signout">
                    <div className='flex items-center gap-2 h-full px-4'>
                        Sign-Out
                    </div></Link>
                : 
                <div className='flex flex-row'>
                    <Link href="/api/auth/signin">
                    <div className='flex items-center gap-2 h-full px-4 bg-white rounded-2xl border border-blue-500 hover:bg-blue-500 hover:text-white'>
                        Sign-In
                    </div>
                    </Link>
                    <Link href="/register">
                    <div className='flex items-center gap-2 h-full px-4 bg-white rounded-2xl border border-blue-500 hover:bg-blue-500 hover:text-white'>
                        Get Started
                    </div>
                    </Link>
                </div>
            }
            
            <TopMenuItem title="My Booking" link="/mybooking"/>
            </div>
        </div>
    )
}