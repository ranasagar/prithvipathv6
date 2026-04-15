import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSafeDate(date: any): Date {
  if (!date) return new Date();
  // Handle Firestore Timestamp
  if (typeof date.toDate === 'function') {
    return date.toDate();
  }
  // Handle seconds/nanoseconds object (sometimes happens in plain objects)
  if (date.seconds !== undefined) {
    return new Date(date.seconds * 1000);
  }
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatDate(date: any) {
  try {
    return new Intl.DateTimeFormat("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(toSafeDate(date));
  } catch (e) {
    return "अज्ञात मिति";
  }
}

export function getCategoryColor(categoryId: string) {
  const colors: Record<string, string> = {
    politics: "bg-blue-600",
    desh: "bg-red-600",
    pradesh: "bg-green-600",
    bishwo: "bg-indigo-600",
    sports: "bg-orange-600",
    entertainment: "bg-pink-600",
    economy: "bg-emerald-600",
    tech: "bg-slate-800",
    health: "bg-cyan-600",
    education: "bg-amber-600",
    opinion: "bg-violet-600",
    interview: "bg-rose-600",
    literature: "bg-yellow-600",
    video: "bg-red-700",
  };
  return colors[categoryId] || "bg-primary";
}
