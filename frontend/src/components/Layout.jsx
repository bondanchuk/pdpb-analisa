import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-100">
      <Sidebar />

      <div className="ml-64 w-[calc(100%-16rem)] min-h-screen">
        <main className="p-6 w-full">{children}</main>
      </div>
    </div>
  );
}
