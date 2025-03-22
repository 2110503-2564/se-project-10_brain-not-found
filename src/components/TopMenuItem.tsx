import Link from 'next/link';
import style from './TopMenu.module.css';

export default function TopMenuItem ({title , link} : { title:string ,link:string}){
    return (
        <Link href={link} className={style.itemcontainer}>
            {title}
        </Link>
    )
}