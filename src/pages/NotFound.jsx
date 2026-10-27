import { Link } from 'react-router-dom';

export default function NotFound({ message = 'This road leads nowhere.' }) {
  return (
    <div className="container-v flex min-h-screen flex-col items-start justify-center pt-20">
      <p className="eyebrow-red">Error 404</p>
      <h1 className="mt-4 text-[22vw] font-black leading-none tracking-tighter text-outline sm:text-[14vw]">404</h1>
      <p className="mt-4 text-lg text-silver">{message}</p>
      <Link to="/" className="btn-primary mt-8">Back to the start</Link>
    </div>
  );
}
