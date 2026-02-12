import { Linkedin } from "lucide-react";
import Link from "next/link";
import Logo from "../icon/logo";
import { Button } from "../ui/button";
import Container from "../ui/container";

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <Container className="py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Logo className="h-8 w-8" />
              <span className="font-display text-xl font-semibold tracking-tight">
                Khen
              </span>
            </Link>
            <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
              Simplifying the creation of worship presentations
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link
                href="https://www.linkedin.com/in/howard-lim-hl06/"
                target="_blank"
              >
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Khen. Made with care for worship teams
            everywhere.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
