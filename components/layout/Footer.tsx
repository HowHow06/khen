import Link from "next/link";
import Logo from "../icon/logo";
import Container from "../ui/container";

type Props = {};

const Footer = (props: Props) => {
  return (
    <>
      <Container>
        <footer className="bg-background-900 my-4">
          <div className="mx-auto w-full max-w-screen-xl py-4 md:py-8">
            <hr className="border-primary-200 my-6 sm:mx-auto lg:my-8" />
            <div className="sm:flex sm:items-center sm:justify-between">
              <Link
                href="/"
                className="mb-4 flex items-center space-x-3 sm:mb-0 rtl:space-x-reverse"
              >
                <Logo className="h-8" />
                <span className="self-center whitespace-nowrap text-2xl font-semibold ">
                  Khen
                </span>
              </Link>
              <ul className="text-secondary-500 mb-6 flex flex-wrap items-center text-sm font-medium sm:mb-0">
                <li>
                  <a href="#" className="me-4 hover:underline md:me-6">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="me-4 hover:underline md:me-6">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="me-4 hover:underline md:me-6">
                    Licensing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <hr className="border-primary-200 my-6 sm:mx-auto lg:my-8" />
            <span className="block text-sm text-muted-foreground sm:text-center">
              © {new Date().getFullYear()}{" "}
              <a href="https://flowbite.com/" className="hover:underline">
                Khen
              </a>
              . All Rights Reserved.
            </span>
          </div>
        </footer>
      </Container>
    </>
  );
};

export default Footer;
