# Textile Connect Pro (TEXORDER Management System)

A robust B2B marketplace platform designed for the textile industry to bridge the gap between buyers and manufacturers through a digitized order-to-cash workflow.

## 🚀 Overview

Textile Connect Pro streamlines the complex process of bulk textile procurement. It replaces traditional manual negotiations with a structured digital journey, ensuring transparency, legitimacy, and efficiency for both buyers and administrators.

## ✨ Key Features

### 🏢 Buyer Experience
- **Verified Onboarding**: Business registration with mandatory GST verification.
- **Bulk Ordering**: Request high-volume fabric orders with specific GSM and color requirements.
- **Quotation Feedback**: Receive, review, accept, or reject official quotations with detailed feedback.
- **Secure Payments**: Integrated Razorpay gateway for seamless transactions.
- **Digital Invoicing**: Automated generation and tracking of tax-compliant invoices.

### 🛠 Admin Capabilities
- **Buyer Management**: Review registrations, verify GST details (integrated search), and approve/reject business accounts.
- **Quotation Engine**: Generate detailed quotes (including tax and delivery) for bulk inquiries.
- **Inventory & Order Tracking**: Real-time monitoring of order statuses from "Needs Quote" to "Delivered".
- **Financial Dashboard**: Overview of payments, pending dues, and revenue metrics.

## 🛠 Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Payments**: [Razorpay](https://razorpay.com/)

## 🛠 Local Setup

Follow these steps to run the project locally:

1. **Clone the repository**:
   ```sh
   git clone <YOUR_GIT_URL>
   cd textile-connect-pro
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env` file with your Supabase and Razorpay credentials.
4. **Run the development server**:
   ```sh
   npm run dev
   ```

## 🚀 Deployment (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com/).

### Steps:
1. **Connect GitHub**: Import your repository into Vercel.
2. **Environment Variables**: Add the following keys in Vercel Project Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID` (if applicable)
3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Routing**: The included `vercel.json` ensures that all routes redirect to `index.html` for client-side routing.

## 🔐 Database Security

This project utilizes **Row-Level Security (RLS)** in Supabase to ensure that:
- Buyers can only access and update their own orders and quotations.
- Admins have complete visibility and management rights across all platform data.
- API keys are protected and never exposed in the client-side code where sensitive data is involved.
