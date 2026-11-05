import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

/** Last-resort error boundary for the router (renders outside the main layout). */
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} — ${error.statusText}` : error?.message || 'Unknown error';
  const isChunkError = /dynamically imported module|Loading chunk/i.test(message);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 text-center text-fg">
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Something broke</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight">{isChunkError ? 'A new version is live' : 'Well, that wasn’t planned.'}</h1>
        <p className="mt-4 text-muted">{isChunkError ? 'Reload to get the latest version of Kexplore.' : message}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="h-11 rounded-full bg-brand px-6 font-semibold text-brand-ink">
            Reload
          </button>
          <Link to="/" reloadDocument className="grid h-11 place-items-center rounded-full border border-line px-6 font-semibold">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
