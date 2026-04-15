import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeLabel?: string;
  homePath?: string;
}

export default function Breadcrumb({ items, homeLabel = "गृहपृष्ठ", homePath = "/" }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xxs font-black text-slate-400 uppercase tracking-[0.3em] mb-10" aria-label="ब्रेडक्रम्ब">
      <Link to={homePath} className="hover:text-primary transition-colors flex items-center gap-1">
        <Home size={12} />
        {homeLabel}
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-slate-300" />
          {item.path && idx < items.length - 1 ? (
            <Link to={item.path} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
