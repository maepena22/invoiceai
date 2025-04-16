import '../styles/globals.css'
import Link from 'next/link';
import 'rsuite/dist/rsuite-no-reset.min.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <nav className="bg-[#fff8f7] shadow-md px-8 py-4 flex items-center justify-between">
        <Link href="/" passHref legacyBehavior>
          <a className="text-2xl font-bold text-red-700 tracking-tight hover:text-red-900 transition-colors duration-200" style={{ textDecoration: 'none' }}>
            Invoice OCR
          </a>
        </Link>
        <div className="flex gap-6 ml-8">
          <Link href="/" passHref legacyBehavior>
            <a className="text-red-700 hover:text-red-900 font-medium px-3 py-2 rounded transition-colors duration-200 hover:bg-red-50">Home</a>
          </Link>
          <Link href="/invoices" passHref legacyBehavior>
            <a className="text-red-700 hover:text-red-900 font-medium px-3 py-2 rounded transition-colors duration-200 hover:bg-red-50">Invoices</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  );
}