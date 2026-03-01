import "./globals.css";

export const metadata = {
  title: "KPanel – Website health & content",
  description: "Multi-tenant website health monitoring and content management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
