import * as React from "react";

export interface PageProps {
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <main className="min-h-screen grid place-items-center bg-white text-black">
      {children}
    </main>
  );
};

export default Page;
