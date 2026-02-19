import Image from "next/image";
import Link from 'next/link';

interface NavigationMenuProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export function NavigationMenu({ isMenuOpen, toggleMenu }: NavigationMenuProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/movies", label: "Movies" },
    { href: "/series", label: "Series" },
    { href: "/kids", label: "Kids" },
  ];

  return (
    <>
      <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
        <Image 
          src="/group_118.svg" 
          className="h-8 w-auto" 
          width={32}
          height={32} 
          alt="CineBucket Logo" 
        />
        <span className="self-center text-2xl font-semibold whitespace-nowrap text-yellow-400">
          CineBucket
        </span>
      </Link>

      {/* Mobile menu button */}
      <div className="flex lg:order-2 space-x-3 rtl:space-x-reverse">
        <button
          onClick={toggleMenu}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-sticky"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
      </div>

      {/* Desktop menu */}
      <div className="hidden lg:flex items-center justify-center w-auto lg:order-1 bg-slate-800 rounded-full px-4 py-1.5 shadow-md" id="navbar-desktop">
        <ul className="flex flex-row items-center space-x-6 rtl:space-x-reverse font-medium text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className="block text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden w-full mt-3 lg:order-1" id="navbar-mobile">
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <ul className="flex flex-col space-y-2 font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-slate-300 hover:text-sky-400 hover:bg-slate-700 px-3 py-2 rounded-md transition-colors"
                    onClick={toggleMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}