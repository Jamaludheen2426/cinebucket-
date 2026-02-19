import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import RouteTracker from "@/app/components/RouteTracker";
import Script from 'next/script';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "CineBucket – Stream & Download Movies in HD | Latest Films Online",
  description:
    "CineBucket is your ultimate destination to stream and download the latest movies and TV shows in high quality. Explore a vast collection of genres, from action to drama, all available for instant viewing or download.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Adsterra Popunder Script */}
{/*         <Script
          strategy="beforeInteractive"
          id="adsterra-popunder"
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = '//knotbachelor.com/b3/81/10/b381100aec11230327507c4e6b8bb002.js';
                s.async = true;
                document.head.appendChild(s);
              })();
            `
          }}
        /> */}
      </head>
      <body className={`${poppins.variable} font-sans bg-black`}>
        <Header />
        <GoogleAnalytics />
        <RouteTracker />
        {/* ✅ Native Banner Ad */}
        <Script
          strategy="afterInteractive"
          src="//knotbachelor.com/202743dc642e973462a21160b3e5a196/invoke.js"
          data-cfasync="false"
        />
        <div id="container-202743dc642e973462a21160b3e5a196" className="my-4" />
        {children}
        <Footer />
        {/* ✅ Adsterra Social Bar script – right before </body> */}
{/*         <Script
          id="adsterra-social-bar"
          strategy="afterInteractive"
          src="//pl26998013.profitableratecpm.com/9b/c6/e4/9bc6e4df64531c1b668f984e1c28b80a.js"
          data-cfasync="false"
        /> */}
      </body>
    </html>
  );
}
