import React from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLang } from "@/lib/i18n";
import useMe from "@/hooks/useMe";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { auth } from "@/api/auth";

const CLIN_NAV = [["/", "nav_dashboard"], ["/problem-types", "nav_problems"], ["/questionnaires", "nav_questionnaires"], ["/tasks", "nav_tasks"]];
const PAT_NAV = [["/", "nav_home"], ["/notes", "nav_notes"]];

export default function AppHeader() {
  const { t } = useLang();
  const { data: me } = useMe();
  const nav = me?.role === "admin" ? CLIN_NAV : PAT_NAV;
  const links = nav.map(([to, key]) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-all ${
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`
      }
    >
      {t(key)}
    </NavLink>
  ));

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="font-heading text-2xl tracking-tight">
          EmoCogni<span className="italic text-primary/60">track</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button
            onClick={() => auth.logout()}
            title={t("logout")}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-5 pb-3 md:hidden">{links}</nav>
    </header>
  );
}