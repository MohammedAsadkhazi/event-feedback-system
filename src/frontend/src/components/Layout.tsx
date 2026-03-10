import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, LayoutDashboard, Menu, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const navLinks = [
  { href: "/" as const, label: "Home", icon: Zap, ocid: "nav.home.link" },
  {
    href: "/events" as const,
    label: "Events",
    icon: Calendar,
    ocid: "nav.events.link",
  },
  {
    href: "/admin" as const,
    label: "Admin",
    icon: LayoutDashboard,
    ocid: "nav.admin.link",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center transition-all duration-300 group-hover:glow-teal">
              <Zap size={16} className="text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Event<span className="text-gradient">Pulse</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-ocid={link.ocid}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/50 bg-card/90 backdrop-blur-xl px-4 py-3 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid={link.ocid}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <link.icon size={14} />
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-accent">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
