'use client';

import { useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';

export default function PaddleProvider() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') ?? 'sandbox',
      token,
    }).then((paddle) => {
      if (paddle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Paddle = paddle;
      }
    });
  }, []);

  return null;
}
