'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/google/url`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL returned from server');
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGoogleLogin} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Login with Google'}
    </Button>
  );
}