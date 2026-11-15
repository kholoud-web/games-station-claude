import Link from 'next/link';

// Reached for URLs outside any locale segment. Locale pages use their own layout.
export default function NotFound() {
  return (
    <html lang="en" dir="ltr">
      <body style={{ background: '#050d19', color: '#f5f8ff', fontFamily: 'sans-serif', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1>404</h1>
        <p>This page could not be found.</p>
        <Link href="/en" style={{ color: '#47d6ff' }}>Games Station</Link>
      </body>
    </html>
  );
}
