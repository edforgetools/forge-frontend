import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto max-w-[760px] px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Forge. All rights reserved.
          </p>
          <div className="flex items-center space-x-8">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent/25"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent/25"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
