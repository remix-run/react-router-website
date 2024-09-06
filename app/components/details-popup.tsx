export function DetailsPopup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`absolute right-0 z-20 md:left-0 ${className}`}>
      <div className="relative top-1 rounded-lg border border-gray-100 bg-white py-2 shadow-lg dark:border-gray-400 dark:bg-gray-800 ">
        {children}
      </div>
    </div>
  );
}
