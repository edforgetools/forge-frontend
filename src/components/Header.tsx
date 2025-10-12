import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/app", label: "App" },
    { path: "/api", label: "API" },
    { path: "/pricing", label: "Pricing" },
    { path: "/privacy", label: "Privacy" },
    { path: "/terms", label: "Terms" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto max-w-[760px] px-4 sm:px-6">
        <div className="flex h-16 items-center">
          {/* Left: Brand - 1/3 width */}
          <div className="flex items-center flex-1 justify-start">
            <Link
              to="/"
              className="flex items-center space-x-2 min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity"
            >
              <div className="text-forge">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">Forge</span>
            </Link>
          </div>

          {/* Center: Navigation - 1/3 width */}
          <nav
            role="navigation"
            className="flex items-center justify-center flex-1"
          >
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-2 min-h-[44px] text-sm rounded-lg transition-all ${
                    isActive(item.path)
                      ? "text-foreground bg-accent/50 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/25"
                  }`}
                  {...(isActive(item.path) && { "aria-current": "page" })}
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </nav>

          {/* Right: Utility - 1/3 width */}
          <div className="flex items-center justify-end flex-1 min-h-[44px]">
            {/* Future utility items can go here */}
          </div>
        </div>
      </div>
    </header>
  );
}
