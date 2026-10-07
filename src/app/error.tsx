'use client';

export default function StoreError({ reset }: { reset: () => void }) {
  return <main className="section"><h1>PLEASE TRY AGAIN</h1><p>The store is temporarily unavailable.</p>
    <button className="button" onClick={reset}>RETRY</button></main>;
}
