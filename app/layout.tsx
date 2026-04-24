import type { Metadata } from "next";
import { QueryProvider } from "./providers/QueryProvider";
import { AppAuthProvider } from "./providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Moeys Sports",
    default: "Moeys Sports - Event Management",
  },
  description: "Professional sports event and registration platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased light"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppAuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AppAuthProvider>
      </body>
    </html>
  );
}
