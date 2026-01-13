import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, teamId, role } = await req.json()

    // Validation
    if (!email || !name || !teamId || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, teamId, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingAuthUser) {
      userId = existingAuthUser.id
      console.log('[invite-user] User already has auth account:', userId)
    } else {
      // Invite user via Admin API - this creates auth account and sends invite email
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          name: name,
          display_name: name
        },
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}#type=invite`
      })

      if (inviteError) {
        console.error('[invite-user] Error inviting user:', inviteError)
        return new Response(
          JSON.stringify({ error: `Failed to invite user: ${inviteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = inviteData.user.id
      console.log('[invite-user] User invited successfully:', userId)
    }

    // Create or update user in users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    let userData

    if (existingUser) {
      // User exists in users table - add to team
      const currentMemberships = existingUser.memberships || []
      const alreadyInTeam = currentMemberships.some((m: any) => m.teamId === teamId)

      if (alreadyInTeam) {
        return new Response(
          JSON.stringify({ error: 'User already in team' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updatedMemberships = [...currentMemberships, { teamId, role }]

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ memberships: updatedMemberships })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('[invite-user] Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: `Failed to update user: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userData = updated
    } else {
      // Create new user in users table
      const { data: created, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          name: name,
          email: email,
          memberships: [{ teamId, role }]
        })
        .select()
        .single()

      if (createError) {
        console.error('[invite-user] Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userData = created
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData,
        invited: !existingAuthUser // true if new invite was sent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[invite-user] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
