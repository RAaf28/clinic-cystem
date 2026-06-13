const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="clinical-spinner"></div>
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest animate-pulse">
          Memuat Modul...
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
