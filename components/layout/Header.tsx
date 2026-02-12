import { Linkedin, Menu } from "lucide-react";
import Link from "next/link";
import Logo from "../icon/logo";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import { Button } from "../ui/button";
import Container from "../ui/container";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import KhenNavigationMenu from "./KhenNavigationMenu";

type Props = {};

const routes = [
  {
    href: "/ppt-generator",
    label: "PPT Generator",
    description: "A tool to generate PPT Slides for your songs at ease.",
  },
];

const Header = (props: Props) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex items-center gap-2 pb-6 pt-2">
                  <Logo className="h-7 w-7" />
                  <span className="font-display text-xl font-semibold">
                    Khen
                  </span>
                </div>
                <nav className="flex flex-col gap-1">
                  {routes.map((route, i) => (
                    <Link
                      key={i}
                      href={route.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Logo className="h-8 w-8" />
              <span className="font-display text-xl font-semibold tracking-tight">
                Khen
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <nav className="hidden md:block">
              <KhenNavigationMenu routes={routes} />
            </nav>

            <div className="flex items-center gap-1 border-l pl-3 ml-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Contact Me"
                className="h-9 w-9 rounded-full"
                asChild
              >
                <Link
                  href="https://www.linkedin.com/in/howard-lim-hl06/"
                  target="_blank"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">Contact Me</span>
                </Link>
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
