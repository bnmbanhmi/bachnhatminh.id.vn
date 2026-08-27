import type { Metadata } from "next";
import { Public_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bach Nhat Minh",
  description: "Personal portfolio of Bach Nhat Minh (@bnmbanhmi).",
  keywords: [
    "Bach Nhat Minh",
    "bnmbanhmi",
    "Product Design",
    "AI",
    "Software Engineering",
  ],
  authors: [{ name: "Bach Nhat Minh", url: "https://bachnhatminh.id.vn" }],
  creator: "Bach Nhat Minh",
  openGraph: {
    title: "Bach Nhat Minh",
    description: "Personal portfolio of Bach Nhat Minh (@bnmbanhmi).",
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
      lang="en"
      className={`${publicSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral text-primary">
        {children}
      </body>
    </html>
  );
}

