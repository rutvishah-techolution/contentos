import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import { listPersonas } from "@/lib/brain";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "ContentOS",
  description:
    "Autonomous research → storyline → drafting pipeline for B2B campaign content.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const personas = session ? await listPersonas() : [];

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          {session ? (
            <div className="flex min-h-screen">
              <Sidebar
                personaCount={personas.length}
                userName={session.user?.name || session.user?.email || "You"}
              />
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
