import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";
import FloatingChat from "@/components/FloatingChat";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hive | AI + Human Workforce Platform",
  description: "Hire human freelancers and launch AI digital employees in one unified SaaS dashboard. Describe your task and get smart suggestions.",
  keywords: ["freelance", "AI workforce", "AI employee", "digital employees", "SaaS", "Gemini", "developer agents"],
  authors: [{ name: "Antigravity Dev Team" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full">
            {children}
          </main>
          <FloatingChat />
        </AuthProvider>
      </body>
    </html>
  );
}
