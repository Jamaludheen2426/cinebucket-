"use client";
import { useState } from "react";
import { NavigationMenu } from "./NavigationMenu"; 

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="font-sans bg-[#1e2939] p-6">
      <nav className="bg-slate-900 fixed w-full z-30 top-0 start-0 border-b border-slate-700/50 shadow-lg">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between p-3">
          <NavigationMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
      </nav>
    </div>
  );
}
