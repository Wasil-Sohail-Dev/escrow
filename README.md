# Third Party LLC - Escrow & Contract Management Platform

## Introduction

The **Third Party LLC** project aims to build a secure, scalable, and efficient contract management platform that streamlines interactions between clients and contractors. This platform ensures transparency, efficient contract execution, secure payments, and dispute resolution, offering a trusted environment for project-based work.

The key goal is to simplify the contract management process, including milestone tracking, payment management, real-time communication, and dispute resolution, while adhering to security standards like KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance.

## Major Features

- **Efficient Contract Management**: Easy-to-use interface for creating, managing, and executing contracts, including milestone tracking and deadline management.
- **Milestone & Payment Transparency**: Both clients and contractors can view contract progress and ensure payments are only released upon mutual agreement. Escrow payment system integrated.
- **Secure User Authentication & Compliance**: Robust user authentication with KYC/AML verification, OAuth 2.0 login options (Google, Facebook), and Two-Factor Authentication (2FA).
- **Real-Time Communication**: Push notifications, emails, and SMS to keep clients and contractors informed about contract updates, approvals, payments, and disputes.
- **Dispute Resolution System**: In-platform system to raise disputes, upload supporting documents, and resolve issues with admin intervention.
- **Financial Reporting & Analytics**: Real-time generation of financial reports, including transaction histories, income summaries, and system-wide performance metrics.
- **Scalability & Security**: Designed to handle increased user activity, with high levels of security for transactions and personal data protection.
- **Mobile App Integration**: Access all key features (contract management, payments, notifications) from a dedicated iOS and Android mobile app.
- **Comprehensive User Management**: Admin features for managing user roles, including clients, contractors, and system-wide settings.
- **User-Friendly Interface**: An intuitive, responsive web interface that makes contract creation, payment processing, and milestone tracking simple and efficient.

## Tech Stack

- **Frontend**: React (MERN stack)
- **Backend**: Node.js, Express.js (MERN stack)
- **Database**: MongoDB (MERN stack)
- **Authentication**: OAuth 2.0, JWT, Two-Factor Authentication (2FA)
- **Real-time Communication**: WebSockets, Email/SMS/Push notifications
- **Payment Gateway**: Stripe, PayPal, Bank Transfer Integration

## Getting Started

To get started with the project, clone the repository:

`git clone https://github.com/Paklogics/third-party-llc.git`

### Prerequisites

- Node.js
- MongoDB
- Stripe and PayPal API Keys for payment integration

### Installation

1. Install the dependencies:

`npm install`

2. Set up environment variables:

- `MONGODB_URI` - MongoDB database URI
- `STRIPE_API_KEY` - Stripe API key
- `PAYPAL_API_KEY` - PayPal API key
- Other required variables for email/SMS integration

3. Start the development server:

`npm start`

## user flow

### Customer Status Flow:

`pendingVerification → verified → active ↔ userInactive ↔ adminInactive`

### Contract Status Flow:

`draft → onboarding → funding_pending → funded → active → working → in_review ↔ cancelled ↔ disputed → in_process → resolved → completed`

## Support

For any inquiries, please reach out to us at:  
**Paklogics**  
Email: [contact@paklogics.com](mailto:contact@paklogics.com)
