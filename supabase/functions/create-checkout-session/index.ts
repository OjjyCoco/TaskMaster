import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.15.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // NEVER expose this in frontend
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    console.log("authHeader: ", authHeader)
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { userEmail } = await req.json()
    console.log("userEmail: ", userEmail)

    // First, check if a customer already exists
    const existingCustomers = await stripe.customers.search({
      query: `email:"${userEmail}"`
    })

    let customer

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log("Existing customer found:", customer.id)
    } else {
      customer = await stripe.customers.create({
        email: userEmail
      })
      console.log("New customer created:", customer.id)

      // Store customer_id <-> user_id in Supabase only if new
      await supabase.from('customers').upsert({
        user_id: user.id,
        customer_id: customer.id,
      })
    }


    const session = await stripe.checkout.sessions.create({
      success_url: 'https://task-master-blond-five.vercel.app/success',
      cancel_url: 'https://task-master-blond-five.vercel.app/cancel',
      // success_url: 'http://localhost:8080/success',
      // cancel_url: 'http://localhost:8080/cancel',
      mode: 'subscription',
      customer: customer.id,
      customer_update: {
        name: 'auto',
        // address: 'auto'
      },
      line_items: [
        {
          price: 'price_1RLmav4gK3rGwcKR7ST4oxqY',
          quantity: 1,
        },
      ],
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Error in create-checkout-session:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
