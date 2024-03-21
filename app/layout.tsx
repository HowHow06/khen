import { AlertDialogProvider } from "@/components/context/AlertDialogContext";
import { OptionsDialogProvider } from "@/components/context/OptionsDialogContext";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { InterFont } from "@/lib/utils/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Khen Ho2 Tool Suite",
    template: "%s | Khen Ho2 Tool Suite",
  },
  description:
    "A web-based tool suite designed for efficiency and ease of use, featuring a standout PPT Generator tool aimed at simplifying the creation of PowerPoint presentations for church praise and worship songs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={InterFont.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AlertDialogProvider>
            <OptionsDialogProvider>
              <Header />
              {children}
              <Toaster expand={true} />
              <Footer />
            </OptionsDialogProvider>
          </AlertDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
