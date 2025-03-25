import Link from 'next/link';

export default function TopMenuItem({ title, link }: { title: string; link: string }) {
  return (
    <>
      {
      (title === "Massage")?(
      <Link href={link} 
        className="inline-block text-lg font-semibold text-orange-500 transition-all hover:text-orange-700 active:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300">
            {title}
      </Link>)
      : (
        <Link href={link} 
        className="inline-block text-lg font-semibold text-black transition-all hover:text-gray-700 active:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300">
            {title}
      </Link>)
      }
    </>
  );
}
