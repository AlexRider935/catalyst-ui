import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
startStatusChecker;


export const metadata = {
  title: "Catalyst",
  description: "Security Intelligence Framework",
};
import { startStatusChecker } from "@/lib/StatusChecker";


startStatusChecker();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>)}