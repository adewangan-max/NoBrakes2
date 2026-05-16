import type { Metadata } from "next";
import { Geist_Mono, Quantico } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const quantico = Quantico({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quantico",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | NoBrakes",
    default: "NoBrakes - Exclusive & Valuable Insights",
  },
  description: "A specialized publication providing deep, valuable content for a dedicated audience. We ignore generic trends to focus purely on high-signal, expert insights.",
  keywords: ["exclusive insights", "specialized content", "deep dives", "private publication", "expert analysis", "high-signal"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          quantico.className,
          geistMono.variable,
          "min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed inset-0 hidden dark:block bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)0%,rgba(3,7,18,1)100%)] -z-10" />
          <div className="fixed inset-0 block dark:hidden bg-slate-100 -z-10" />
          <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent)] opacity-10 dark:opacity-20 -z-10" />

          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/50 mt-20">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">NoBrakes</h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    An exclusive publication dedicated to specialized, high-signal content. We ignore the noise and trending fads to bring our select audience pure, undiluted value.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Links</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">Terms of Service</a></li>
                    <li><a href="/sitemap.xml" className="text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">Sitemap</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                      <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-white/5 mt-12 pt-8 text-center text-slate-500 dark:text-slate-500 text-xs">
                &copy; {new Date().getFullYear()} NoBrakes. All rights reserved.
              </div>
            </div>
          </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
