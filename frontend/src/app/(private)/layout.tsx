"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";
  return (
    <ProtectedRoute>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}>
          <AppHeader />
          <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}