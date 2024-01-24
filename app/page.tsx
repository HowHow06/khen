import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Container className="items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-2 left-0 flex h-14 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          By Hoho
        </div>
      </Container>

      <Container className="mb-36">
        <div className="relative flex flex-col place-items-center space-y-10 text-center">
          <h1 className="text-5xl font-extrabold">
            Welcome to <br /> Khen Ho2 Tool Suite
          </h1>
          <p className="text-base lg:text-xl">
            Hoho&apos;s all in one tool suite!
          </p>
          <Link href="/ppt-generator">
            <Button>PPT Generator</Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
