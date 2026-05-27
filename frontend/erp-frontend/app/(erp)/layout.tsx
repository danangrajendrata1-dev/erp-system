import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/top-navbar";
import Footer from "@/components/footer";

export default function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />

      <main className="ml-[260px] min-h-screen bg-slate-100 bg-[linear-gradient(180deg,#eef6ff_0%,#f8fafc_280px,#f1f5f9_100%)]">
        <TopNavbar />

        {children}

        <Footer />
      </main>
    </div>
  );
}
