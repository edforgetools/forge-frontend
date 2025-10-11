import * as React from "react";

export interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-[720px] p-6 sm:p-8">{children}</div>
  );
};

export default Container;
