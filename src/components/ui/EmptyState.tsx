import { Link } from "react-router-dom";
import { ArrowLeft, Home, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  variant?: "default" | "search" | "not-found";
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionLink,
  onAction,
  variant = "default"
}: EmptyStateProps) {
  const iconMap = {
    search: (
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
    ),
    "not-found": (
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
        <Home size={40} />
      </div>
    ),
    default: (
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
        {icon || <Plus size={40} />}
      </div>
    )
  };

  return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      {iconMap[variant]}
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
      {description && (
        <p className="text-slate-400 font-medium text-sm max-w-sm">{description}</p>
      )}
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-2 bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
