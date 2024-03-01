import { Linkedin, Menu } from "lucide-react";
import Link from "next/link";
import Logo from "../icon/logo";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import { Button } from "../ui/button";
import Container from "../ui/container";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
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
              <KhenNavigationMenu routes={routes} />
            </div>

            <div className="flex items-center space-x-2 pl-2 ">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Contact Me"
                asChild
              >
                <Link
                  href={`https://www.linkedin.com/in/howard-lim-hl06/`}
                  target="_blank"
                >
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">Contact Me</span>
                </Link>
              </Button>
              <ThemeSwitcher />
              {/* TODO: auth to be implemented */}
              {/* <Button
                variant="ghost"
                className="hidden md:inline"
                aria-label="Sign In"
              >
                Sign In
              </Button>
              <Button aria-label="Sign Up" className="hidden md:inline">
                Sign Up
              </Button> */}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
