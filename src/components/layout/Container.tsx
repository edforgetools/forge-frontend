import * as React from "react";

export interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto max-w-[760px] px-4 sm:px-6 py-8 space-y-6">
      {children}
    </div>
  );
};

export default Container;
