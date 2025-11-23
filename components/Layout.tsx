import { ReactNode, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = (session?.user as any)?.role;
  const user = session?.user as any;
  const displayName =
    userRole === 'retailer' || userRole === 'wholesaler'
      ? user?.businessName || user?.name
      : user?.name;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 selection:bg-primary-500/30">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group relative">
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 group-hover:from-primary-500 group-hover:to-secondary-400 transition-all duration-300">
                  LiveMart
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <NavLink href="/products">Products</NavLink>
                <NavLink href="/shops">Shops</NavLink>
                {session && (
                  <>
                    <NavLink href="/cart">Cart</NavLink>
                    <NavLink href="/orders">Orders</NavLink>
                    {(userRole === 'retailer' || userRole === 'wholesaler') && (
                      <NavLink href="/dashboard">Dashboard</NavLink>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block animate-fade-in">
                    <p className="text-sm font-medium text-slate-900">{displayName}</p>
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                      <span className="text-slate-300">|</span>
                      <Link href="/profile" className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline">
                        Profile
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:block bg-white/50 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3 animate-fade-in">
                  <Link
                    href="/auth/signin"
                    className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink href="/products">Products</MobileNavLink>
              <MobileNavLink href="/shops">Shops</MobileNavLink>
              {session && (
                <>
                  <MobileNavLink href="/cart">Cart</MobileNavLink>
                  <MobileNavLink href="/orders">Orders</MobileNavLink>
                  <MobileNavLink href="/profile">Profile</MobileNavLink>
                  {(userRole === 'retailer' || userRole === 'wholesaler') && (
                    <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                  )}
                </>
              )}
              {!session && (
                <>
                  <MobileNavLink href="/auth/signin">Sign In</MobileNavLink>
                  <MobileNavLink href="/auth/signup">Sign Up</MobileNavLink>
                </>
              )}
              {session && (
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow animate-fade-in">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">LiveMart</span>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                Connecting Customers, Retailers & Wholesalers with a modern shopping experience.
              </p>
            </div>
            <div className="flex space-x-8 text-slate-500 text-sm font-medium">
              <Link href="#" className="hover:text-primary-600 transition-colors hover:underline decoration-2 underline-offset-4">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary-600 transition-colors hover:underline decoration-2 underline-offset-4">Terms of Service</Link>
              <Link href="#" className="hover:text-primary-600 transition-colors hover:underline decoration-2 underline-offset-4">Contact Us</Link>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} LiveMart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive
        ? 'border-primary-500 text-slate-900'
        : 'border-transparent text-slate-500 hover:text-primary-600 hover:border-slate-300'
        }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
        }`}
    >
      {children}
    </Link>
  );
}


