export const config = {
  auth: {
    apiKey: process.env.NEXT_PUBLIC_AUTH_KEY,
    secret: process.env.AUTH_SECRET,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  }
}; 