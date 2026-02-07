"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Key, Users, FileText, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Card className="rounded-none border-x-0 border-t-0">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/secrets" className="flex items-center space-x-2">
                <Lock className="h-6 w-6" />
                <span className="text-xl font-bold">OpenBao</span>
              </Link>

              <div className="flex items-center space-x-4">
                <Link href="/secrets">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Secrets</span>
                  </Button>
                </Link>

                <Link href="/users">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </Button>
                </Link>

                <Link href="/policies">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Policies</span>
                  </Button>
                </Link>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </nav>
      </Card>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
