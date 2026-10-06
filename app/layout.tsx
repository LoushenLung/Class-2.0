import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/shared/Sidebar";
import { getCurrentUser } from "@/lib/actions/guards";
import { getPublicProfiles } from "@/actions/profile.actions";
import type { PublicProfile } from "@/actions/profile.actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "RPL 1 - Web Kelas Digital",
  description: "Class management and community hub web application for RPL 1",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let currentUserAuth = null;
  let allUsers: PublicProfile[] = [];

  try {
    [currentUserAuth, allUsers] = await Promise.all([
      getCurrentUser(),
      getPublicProfiles(),
    ]);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.error("RootLayout data fetch error:", err);
  }

  // Map CurrentUser → minimal shape expected by Sidebar
  const currentUser = currentUserAuth
    ? {
        id: currentUserAuth.id,
        email: currentUserAuth.email,
        name: currentUserAuth.name,
        role: currentUserAuth.role,
        avatarUrl: currentUserAuth.avatarUrl,
      }
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B1A] text-white selection:bg-purple-500/30 transition-colors duration-200">
        <Sidebar currentUser={currentUser} allUsers={allUsers} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-6 lg:pl-72 pb-24 lg:pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
