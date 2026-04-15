import { Skeleton } from "./Skeleton";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="grow container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <Skeleton className="w-full aspect-video rounded-3xl mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-32 h-24 rounded-2xl shrink-0" />
                <div className="grow flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-video rounded-3xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-16 w-3/4 mb-8" />
          <div className="flex items-center gap-4 mb-12">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="w-full aspect-video rounded-3xl mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow container-custom py-12">
        <Skeleton className="h-16 w-full max-w-xs mb-4" />
        <Skeleton className="h-6 w-full max-w-md mb-12" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-video rounded-3xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="w-[280px] bg-slate-900 h-screen shrink-0 p-6">
        <Skeleton className="h-10 w-full bg-slate-800 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grow p-8">
        <div className="flex justify-between items-center mb-12">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    </div>
  );
}
