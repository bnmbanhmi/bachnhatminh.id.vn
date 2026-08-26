import type { Metadata } from "next";
import { Lexend, Space_Grotesk } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bach Nhat Minh | Product Designer & AI-Native Builder",
  description: "Personal portfolio of Bach Nhat Minh. Product Designer & Engineer specializing in AI-native interfaces, information architecture, and telemetry-driven UX optimization.",
  keywords: [
    "Bach Nhat Minh",
    "Product Designer",
    "UI/UX",
    "AI Product Engineer",
    "Information Architecture",
    "Telemetry UX",
    "PostHog",
    "Next.js",
  ],
  authors: [{ name: "Bach Nhat Minh", url: "https://bachnhatminh.id.vn" }],
  creator: "Bach Nhat Minh",
  openGraph: {
    title: "Bach Nhat Minh | Product Designer & AI-Native Builder",
    description: "Product Designer & AI-native interface builder specializing in telemetry-driven UX and information architecture.",
    url: "https://bachnhatminh.id.vn",
    siteName: "Bach Nhat Minh",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col selection:bg-[#FFE5D9] selection:text-[#B3543D]">
        {children}
      </body>
    </html>
  );
}

