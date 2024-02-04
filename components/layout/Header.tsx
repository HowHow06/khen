import { Linkedin, Menu } from "lucide-react";
import Link from "next/link";
import Logo from "../icon/logo";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import { Button } from "../ui/button";
import Container from "../ui/container";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

type Props = {};

const routes = [
  {
    href: "/ppt-generator",
    label: "PPT Generator",
  },
];

const Header = (props: Props) => {
  return (
    <header>
      <Container>
        <div className="flex h-16 w-full items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger>
                <Menu className="h-6 w-6 md:hidden" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {routes.map((route, i) => (
                    <Link
                      key={i}
                      href={route.href}
                      className="block px-2 py-1 text-base"
                    >
                      {route.label}
                    </Link>
                  ))}
                  <Link
                    href="/"
                    className="block px-2 py-1 text-base"
                    aria-label="Sign In"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/"
                    className="block px-2 py-1 text-base"
                    aria-label="Sign Up"
                  >
                    Sign Up
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="ml-4 flex items-center space-x-2 lg:ml-0">
              <Logo />
              <h1 className="text-xl font-bold">Khen</h1>
            </Link>
          </div>

          <div className="flex items-center divide-x">
            <div className="hidden md:block">
              <nav className="flex  items-center space-x-4 pr-2  lg:space-x-6">
                {/* scale-0 so that it is hidden from mobile size to md size */}
                {routes.map((route, i) => (
                  <Button asChild variant="ghost" key={route.label}>
                    <Link
                      key={i}
                      href={route.href}
                      className="text-sm font-medium transition-colors"
                    >
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-2 pl-2 ">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Contact Me"
                asChild
              >
                <Link
                  href={`https://www.linkedin.com/in/howard-lim-3b79a21b8/`}
                  target="_blank"
                >
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">Contact Me</span>
                </Link>
              </Button>
              <ThemeSwitcher />
              {/* auth to be implemented */}
              <Button
                variant="ghost"
                className="hidden md:inline"
                aria-label="Sign In"
              >
                Sign In
              </Button>
              <Button aria-label="Sign Up" className="hidden md:inline">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
