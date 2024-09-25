export function PopupLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">
      {label}
    </div>
  );
}
