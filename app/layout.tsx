import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./app.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Dream11 Fantasy Tracker",
  description: "Dream11 Fantasy Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>{children}</body>
    </html>
  );
}
