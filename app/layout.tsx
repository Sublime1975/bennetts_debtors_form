import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";
import { FormProvider } from "@/lib/form-context";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Bennett's Engineering — Debtor Application",
  description: "Customer credit account application for Bennett's Engineering (Pty) Ltd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${poppins.variable} font-body bg-bg text-ink antialiased`}>
        <FormProvider>{children}</FormProvider>
      </body>
    </html>
  );
}
