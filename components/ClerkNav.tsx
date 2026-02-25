'use client';

import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function ClerkNav() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (!user) {
    return (
      <>
        <SignInButton mode="modal">
          <button style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 16px', cursor: 'pointer' }}>
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '999px', padding: '6px 18px', cursor: 'pointer' }}>
            Sign Up Free
          </button>
        </SignUpButton>
      </>
    );
  }

  return (
    <>
      <a
        href="/dashboard"
        style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px' }}
      >
        Dashboard
      </a>
      <UserButton afterSignOutUrl="/" />
    </>
  );
}
