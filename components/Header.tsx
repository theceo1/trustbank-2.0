// components/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/supabase/client";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { href: "/market", label: "Market" },
    ...(user
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/trade", label: "Trade" },
          { href: "/profile", label: "Profile" },
          { href: "/profile/wallet", label: "Wallet" },
        ]
      : []),
    { href: "/calculator", label: "Calculator" },
  ];

  const aboutItems = [
    { href: "/about/vision", label: "Vision" },
    { href: "/about/mission", label: "Mission" },
    { href: "/about/blog", label: "Blog" },
    { href: "/about/faq", label: "FAQ" },
    { href: "/about/contact", label: "Contact Us" },
  ];

  return (
    <header className="bg-background border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
        <Link href="/" className="text-xl md:text-2xl font-bold">
          trustBank
        </Link>
        <nav className="hidden md:flex space-x-4 items-center">
          {!loading && (
            <>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm ${pathname === item.href ? "font-bold" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">About</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[100px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                        {aboutItems.map((item) => (
                          <li key={item.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="block select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:text-green-600 focus:text-green-600"
                              >
                                {item.label}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              {user ? (
                <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
              )}
              <ThemeToggle />
            </>
          )}
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-y-0 right-0 w-64 bg-background shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
          style={{
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          <nav className="flex flex-col p-4 space-y-4">
            <Button variant="ghost" size="sm" className="self-end" onClick={() => setIsMenuOpen(false)}>
              <X size={20} />
            </Button>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname === item.href ? "font-bold" : ""
                } transition-colors duration-200 hover:text-primary`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <NavigationMenu orientation="vertical">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">About</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-full gap-3 p-4">
                      {aboutItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink
                            href={item.href}
                            className="block select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            {!loading && (
              <>
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      supabase.auth.signOut();
                      setIsMenuOpen(false);
                    }}
                    className="mt-4"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/auth/login">Login</Link>
                  </Button>
                )}
              </>
            )}
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
