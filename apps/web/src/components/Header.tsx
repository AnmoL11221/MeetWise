'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="p-4 border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="font-extrabold text-2xl tracking-tight text-gray-800">
          MeetWise
        </Link>
        
        <div>
          <SignedOut>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            {/* THIS IS THE ONLY USERBUTTON IN THE ENTIRE APP */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}