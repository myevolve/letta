import Header from "@/components/layout/Header";
import GlobalSidebar from "@/components/layout/GlobalSidebar";
import ProjectSidebar from "@/components/layout/ProjectSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-transparent text-foreground">
      <GlobalSidebar />
      <ProjectSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
