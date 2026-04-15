import { useState, useEffect } from "react";
import { ListOrdered } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector?: string;
  headingSelector?: string;
  title?: string;
  className?: string;
}

export default function TableOfContents({
  contentSelector = ".article-content-body",
  headingSelector = "h2, h3",
  title = "विषयसूची",
  className = ""
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const contentEl = document.querySelector(contentSelector);
    if (!contentEl) return;

    const headingEls = contentEl.querySelectorAll(headingSelector);
    const items: TOCItem[] = [];

    headingEls.forEach((el, idx) => {
      const id = `toc-${idx}`;
      el.id = id;
      items.push({
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName.replace("H", ""))
      });
    });

    setHeadings(items);
  }, [contentSelector, headingSelector]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className={`bg-slate-50 p-6 rounded-3xl border border-slate-100 ${className}`} aria-label={title}>
      <div className="flex items-center gap-3 mb-4">
        <ListOrdered size={18} className="text-primary" />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {headings.map(heading => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block py-1.5 text-sm font-medium transition-colors rounded-lg px-3 -mx-3 ${
                heading.level === 3 ? "ml-4" : ""
              } ${
                activeId === heading.id
                  ? "text-primary font-bold bg-primary/5"
                  : "text-slate-600 hover:text-primary"
              }`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
