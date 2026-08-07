"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-card">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted hover:text-foreground transition-all"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
}
