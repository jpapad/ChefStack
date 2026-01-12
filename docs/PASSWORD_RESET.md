# Password Reset Configuration

## Overview

ChefStack supports secure password reset functionality via email. This guide explains how to configure it properly for both development and production environments.

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration (required for password reset)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Public URL (IMPORTANT for redirects)
VITE_PUBLIC_URL=https://your-production-domain.com
```

### Development vs Production

#### Development (localhost)
```bash
# Leave VITE_PUBLIC_URL empty or set to localhost
VITE_PUBLIC_URL=http://localhost:3000
```

#### Production (deployed)
```bash
# Set to your actual deployed URL
VITE_PUBLIC_URL=https://chefstack.yourdomain.com
```

## Supabase Configuration

### 1. Email Templates

Go to **Authentication > Email Templates** in your Supabase dashboard:

#### Reset Password Template
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .SiteURL }}">Reset Password</a></p>
<p>Or copy and paste this URL:</p>
<p>{{ .SiteURL }}</p>
<p><small>This link will expire in 60 minutes.</small></p>
```

**Note**: The app automatically detects the recovery token in the URL hash and displays the reset form.

### 2. Site URL Configuration

Go to **Authentication > URL Configuration**:

1. **Site URL**: Set to your `VITE_PUBLIC_URL` value
   - Dev: `http://localhost:3000`
   - Prod: `https://your-domain.com`

2. **Redirect URLs**: Add these patterns:
   - `http://localhost:3000/**` (for development)
   - `https://your-domain.com/**` (for production)

**Important**: Don't add `/reset-password` path - the app is a SPA and handles reset mode automatically by detecting the `type=recovery` parameter in the URL hash.

### 3. PKCE Flow

The app uses **PKCE (Proof Key for Code Exchange)** for enhanced security. This is configured automatically in `supabaseClient.ts`:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: getRedirectUrl()
  }
});
```

## User Flow

### Forgot Password
1. User clicks "Forgot your password?" on login screen
2. Enters their email address
3. Clicks "Send Instructions"
4. Receives email with reset link

### Reset Password
1. User clicks link in email
2. Redirected to app root URL with recovery token in URL hash (e.g., `#access_token=...&type=recovery`)
3. App detects `type=recovery` in hash and shows `ResetPasswordView`
4. User enters new password (minimum 6 characters)
5. Confirms password
6. Clicks "Update Password"
7. Redirected to login screen

## Testing

### Development Testing
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to http://localhost:3000
# 3. Click "Forgot your password?"
# 4. Enter test email
# 5. Check email (or Supabase logs) for reset link
```

### Production Testing
```bash
# 1. Deploy to production
# 2. Set VITE_PUBLIC_URL in environment variables
# 3. Configure Supabase Site URL
# 4. Test full flow with real email
```

## Troubleshooting

### Issue: Email links redirect to localhost
**Solution**: Check `VITE_PUBLIC_URL` is set correctly in production environment variables.

### Issue: "Invalid redirect URL" error
**Solution**: Add your production URL to Supabase redirect URLs whitelist.

### Issue: Recovery token not detected
**Solution**: Ensure Supabase auth is configured with `detectSessionInUrl: true` and `flowType: 'pkce'`.

### Issue: Password reset not working in mock mode
**Solution**: Password reset requires real Supabase configuration. Set up Supabase credentials.

## Security Best Practices

1. ✅ **Always use HTTPS** in production for `VITE_PUBLIC_URL`
2. ✅ **Enable PKCE flow** (already configured)
3. ✅ **Set minimum password length** (6 characters minimum)
4. ✅ **Use secure email templates** (no plain-text tokens)
5. ✅ **Whitelist only known redirect URLs** in Supabase

## API Methods

### `api.resetPassword(email: string)`
Sends password reset email to user.

```typescript
try {
  await api.resetPassword('user@example.com');
  console.log('Reset email sent!');
} catch (error) {
  console.error('Failed:', error.message);
}
```

### `api.updatePassword(newPassword: string)`
Updates user's password after clicking reset link.

```typescript
try {
  await api.updatePassword('newSecurePassword123');
  console.log('Password updated!');
} catch (error) {
  console.error('Failed:', error.message);
}
```

## Deployment Checklist

Before deploying, ensure:

- [ ] `VITE_PUBLIC_URL` set to production domain
- [ ] Supabase Site URL matches production domain
- [ ] Redirect URLs whitelisted in Supabase
- [ ] Email templates configured
- [ ] HTTPS enabled on production domain
- [ ] Test password reset flow end-to-end

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [PKCE Flow Explained](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**Last Updated**: January 2026
