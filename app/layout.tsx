import type { Metadata } from "next";
import { Kantumruy_Pro, Work_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { AppAuthProvider } from "./providers/AuthProvider";
import { ConfirmDialogProvider } from "@/shared/ui/ConfirmDialog";
import "./globals.css";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Moeys Sports",
    default: "Moeys Sports - Event Management",
  },
  description: "Professional sports event and registration platform",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`h-full antialiased light ${kantumruyPro.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <AppAuthProvider>
            <QueryProvider>
              <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
            </QueryProvider>
          </AppAuthProvider>
        </NextIntlClientProvider>
        <Toaster
          position="top-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            className:
              "font-sans leading-relaxed rounded-md border border-border",
          }}
        />
      </body>
    </html>
  );
}
