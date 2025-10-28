import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalStyles } from "@/styles/global";
import ClientLayout from "./client-layout";
import StyledComponentsRegistry from "@/lib/registry";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Door System",
  description: "Control your smart door lock system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={josefinSans.className}>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <GlobalStyles />
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
