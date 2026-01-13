# Invite User Flow Documentation

## Overview

ChefStack uses Supabase's Admin API to create user accounts and send invite emails. Admins can add users who will receive an email to confirm their account and set their password.

## Architecture

```
Admin clicks "Add User" → UserManagement.tsx
                              ↓
                    api.inviteUserToTeam()
                              ↓
            Supabase Edge Function: invite-user
                              ↓
                    Supabase Admin API
                              ↓
                ┌─────────────┴─────────────┐
                ↓                           ↓
        Create Auth Account         Send Invite Email
                ↓                           ↓
        Insert/Update users table     User receives email
                ↓                           ↓
        Return user object          Click confirmation link
                                            ↓
                                    Set password & login
```

## Step-by-Step Flow

### 1. Admin Invites User

**Location:** `components/settings/UserManagement.tsx`

```tsx
// Admin fills form and clicks "Προσθήκη"
const result = await api.inviteUserToTeam(
  name,      // "Γιώργος Παπαδόπουλος"
  email,     // "george@restaurant.gr"
  teamId,    // Current team ID
  role       // "Cook"
);
```

### 2. API Calls Edge Function

**Location:** `services/api.ts`

```tsx
// Calls Supabase Edge Function
const { data, error } = await supabase.functions.invoke('invite-user', {
  body: { name, email, teamId, role }
});
```

### 3. Edge Function Creates Account

**Location:** `supabase/functions/invite-user/index.ts`

```typescript
// Uses Admin API with service role key
const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  data: { name, display_name: name },
  redirectTo: 'http://yourapp.com#type=invite'
});

// Creates record in users table
await supabaseAdmin.from('users').insert({
  id: userId,  // Same as auth.users id
  name,
  email,
  memberships: [{ teamId, role }]
});
```

### 4. User Receives Email

Supabase automatically sends an email with:
- Subject: "You have been invited"
- Confirmation link with token
- Link redirects to: `yourapp.com#type=invite&token=...`

### 5. User Confirms & Sets Password

**Location:** `App.tsx` (needs to be added)

```tsx
// Detect invite confirmation
useEffect(() => {
  const hash = window.location.hash;
  if (hash.includes('type=invite')) {
    // Show password setup form
    setIsInviteConfirmMode(true);
  }
}, []);
```

**Location:** `components/auth/InviteConfirmView.tsx` (needs to be created)

```tsx
// User sets password
const { error } = await supabase.auth.updateUser({
  password: newPassword
});

// Redirect to app
if (!error) {
  window.location.hash = '';
  // User is now logged in
}
```

### 6. User Can Login

After setting password, user can login normally:
```tsx
await supabase.auth.signInWithPassword({
  email: 'george@restaurant.gr',
  password: 'their-chosen-password'
});
```

## Email Template Customization

### Default Supabase Template

```html
<h2>You have been invited</h2>
<p>You have been invited to create a user on {{ .SiteURL }}. Follow this link to accept the invite:</p>
<p><a href="{{ .ConfirmationURL }}">Accept the invite</a></p>
```

### Recommended Custom Template

Go to: **Supabase Dashboard > Authentication > Email Templates > Invite user**

```html
<h2>Καλωσήρθατε στο ChefStack! 🍳</h2>

<p>Γεια σας!</p>

<p>Προσκληθήκατε να συμμετάσχετε στην ομάδα της κουζίνας στο ChefStack.</p>

<p>Κάντε κλικ στο παρακάτω κουμπί για να επιβεβαιώσετε τον λογαριασμό σας και να ορίσετε τον κωδικό σας:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background: #FFD700; color: #1a1a1a; padding: 12px 30px; 
            text-decoration: none; border-radius: 25px; font-weight: bold;">
    Επιβεβαίωση Λογαριασμού
  </a>
</p>

<p>Ή αντιγράψτε αυτόν τον σύνδεσμο στον περιηγητή σας:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Αν δεν περιμένατε αυτό το email, μπορείτε να το αγνοήσετε.</p>

<p>Καλή επιτυχία!</p>
<p>Η Ομάδα ChefStack</p>
```

## Implementation Checklist

- [x] Create `invite-user` Edge Function
- [x] Add `api.inviteUserToTeam()` method
- [x] Update `UserManagement.tsx` to use invite flow
- [ ] Create `InviteConfirmView.tsx` component
- [ ] Add invite detection in `App.tsx`
- [ ] Deploy Edge Function to Supabase
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` secret
- [ ] Customize email template in Supabase dashboard
- [ ] Test end-to-end flow

## Deployment

```bash
# 1. Deploy function
supabase functions deploy invite-user

# 2. Set secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. Verify deployment
supabase functions list
```

## Testing

### Local Testing

```bash
# Start Supabase locally
supabase start

# Serve function
supabase functions serve invite-user --env-file supabase/.env.local

# Test
curl -X POST http://localhost:54321/functions/v1/invite-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","teamId":"team1","role":"Cook"}'
```

### Production Testing

1. Add user through UI
2. Check Supabase Dashboard > Authentication > Users
3. Check email inbox for invite
4. Click confirmation link
5. Set password
6. Login with email + password

## Security Considerations

- ✅ Edge Function uses service role key (full admin access)
- ✅ Only admins can access User Management UI
- ✅ Email validation in both frontend and function
- ⚠️ Consider adding rate limiting for invites
- ⚠️ Consider RLS policy to verify caller's role

## Troubleshooting

### Email not sending
- Check Supabase Dashboard > Authentication > Email Templates
- Verify SMTP settings (or use Supabase's default)
- Check function logs: `supabase functions logs invite-user`

### User not created
- Check Edge Function logs for errors
- Verify service role key is set correctly
- Check users table permissions

### Confirmation link not working
- Verify `redirectTo` URL matches your app's URL
- Check if URL is in Supabase allowed redirect URLs
- Test with `http://localhost:3000` for development
