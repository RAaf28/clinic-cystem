import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-margin-edge py-4 bg-pure-surface/80 backdrop-blur-md border-b border-whisper-border shadow-sm">
      <div>
        <Link to="/" className="text-headline-lg tracking-tighter text-primary hover:opacity-80 transition-opacity">
          Clynic
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-label-md text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-bold">
          Contact Us
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
