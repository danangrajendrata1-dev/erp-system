"use client";

export default function TopNavbar() {
  return (
    <header className="h-[70px] bg-white border-b px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-semibold">
          Internal ERP System
        </h2>
        <p className="text-sm text-slate-500">
          Private company server
        </p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-4 py-2 w-[260px]"
        />

        <div className="text-right">
          <p className="text-sm font-semibold">
            Admin
          </p>
          <p className="text-xs text-slate-500">
            ERP User
          </p>
        </div>
      </div>
    </header>
  );
}