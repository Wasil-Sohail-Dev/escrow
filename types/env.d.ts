declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_AUTH_KEY: string;
      AUTH_SECRET: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_PUBLISHABLE_KEY: string;
    }
  }
}

export {}; 