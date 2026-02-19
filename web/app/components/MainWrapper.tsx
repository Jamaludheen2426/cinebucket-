import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  paddingX?: string;
}

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='max-w-[1120px] px-[20px] mx-auto'>{children}</div>;
};

export default MainWrapper;