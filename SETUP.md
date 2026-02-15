# Frontend Setup Instructions

## Environment Configuration

1. Copy the environment variables file:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon public key
4. Replace the placeholder values in your `.env` file

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Authentication Flow

- **Registration**: Users can register as buyers (admin accounts need to be created manually in Supabase)
- **Login**: Users login with email/password and are automatically redirected to their appropriate dashboard
- **Role-based Access**: 
  - Buyers get access to `/buyer/*` routes
  - Admins get access to `/admin/*` routes
  - Routes are protected and users cannot access areas outside their role

## Next Steps

After setting up the frontend:

1. Test registration and login functionality
2. Create an admin user manually in Supabase (set role to 'admin' in profiles table)
3. Implement the buyer workflow components
4. Implement the admin workflow components
5. Add payment gateway integration
