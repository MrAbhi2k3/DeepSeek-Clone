import { Inter } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata = {
  title: "DeepSeek Clone - MrAbhi2k3",
  description: "A DeepSeek clone built by MrAbhi2k3 using DeepSeek API and Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Toaster
          toastOptions={{
            success: {
              style: {
                background: 'black',
                color: 'white',
              },
            },
            error: {
              style: {
                background: 'black',
                color: 'white',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
    </AppContextProvider>
    </ClerkProvider>
  );
}
