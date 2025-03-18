import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const navLinks: NavLink[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/generate-tasks',
    label: 'Generate Tasks',
  },
  {
    href: '/projects',
    label: 'Projects',
  },
  {
    href: '/analytics',
    label: 'Analytics',
  },
  {
    href: '/settings',
    label: 'Settings',
  },
];

interface NavLinksProps {
  className?: string;
  vertical?: boolean;
}

export default function NavLinks({ className = '', vertical = false }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      <ul className={`flex ${vertical ? 'flex-col space-y-2' : 'space-x-6'}`}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-center">
                  {link.icon && <div className="mr-2">{link.icon}</div>}
                  {link.label}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 