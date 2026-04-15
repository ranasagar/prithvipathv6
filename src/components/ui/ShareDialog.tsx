import { useState, useCallback, useEffect } from "react";
import { Facebook, Twitter, Mail, Link2, Check } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

export default function ShareDialog({ isOpen, onClose, title, url, description = "" }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled
      }
    }
  }, [title, description, url]);

  useEffect(() => {
    if (isOpen && navigator.share) {
      handleNativeShare();
    }
  }, [isOpen, handleNativeShare]);

  if (!isOpen) return null;

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">साझा गर्नुहोस्</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-1">{title}</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-[#1877F2]/10 rounded-2xl hover:bg-[#1877F2]/20 transition-colors group"
          >
            <Facebook size={24} className="text-[#1877F2]" />
            <span className="text-xxs font-bold text-[#1877F2]">Facebook</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-[#1DA1F2]/10 rounded-2xl hover:bg-[#1DA1F2]/20 transition-colors group"
          >
            <Twitter size={24} className="text-[#1DA1F2]" />
            <span className="text-xxs font-bold text-[#1DA1F2]">Twitter</span>
          </a>
          <a
            href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors group"
          >
            <Mail size={24} className="text-green-600" />
            <span className="text-xxs font-bold text-green-600">Email</span>
          </a>
          <button
            onClick={handleCopy}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors group ${
              copied ? "bg-primary/10" : "bg-slate-50 hover:bg-slate-100"
            }`}
          >
            {copied ? (
              <Check size={24} className="text-primary" />
            ) : (
              <Link2 size={24} className="text-slate-500" />
            )}
            <span className={`text-xxs font-bold ${copied ? "text-primary" : "text-slate-500"}`}>
              {copied ? "कपि भयो!" : "कपि"}
            </span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          बन्द गर्नुहोस्
        </button>
      </div>
    </div>
  );
}
