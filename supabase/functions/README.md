# ChefStack Edge Functions

## Invite User Function

### Setup

1. **Deploy the function:**
```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy invite-user
```

2. **Set environment variables:**
```bash
# The function needs access to the service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Usage

The `invite-user` function is called automatically when an admin adds a new user through the User Management interface.

**What it does:**
1. Creates an auth account using Supabase Admin API
2. Sends an invite email to the user with a confirmation link
3. Creates/updates the user record in the `users` table with team membership
4. Returns the user object and whether a new invite was sent

**Email flow:**
1. User receives invite email from Supabase
2. Clicks confirmation link in email
3. Gets redirected to app with `#type=invite` hash
4. Sets their own password
5. Can now login with their email and chosen password

### Testing Locally

```bash
# Serve functions locally
supabase functions serve invite-user --env-file ./supabase/.env.local

# Create .env.local with:
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Test with curl:
curl -i --location --request POST 'http://localhost:54321/functions/v1/invite-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","name":"Test User","teamId":"team1","role":"Cook"}'
```

### Email Customization

To customize the invite email template:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Edit the "Invite user" template
3. Use variables like `{{ .SiteURL }}`, `{{ .Token }}`, `{{ .ConfirmationURL }}`

### Security

- ✅ Function uses service role key (has full admin access)
- ✅ Should only be called by authenticated users with Admin role
- ✅ Frontend checks user role before showing add user UI
- ⚠️ Consider adding RLS policy to verify caller is admin in future versions
