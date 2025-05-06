// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.15.0'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:8080/dashboard',
      cancel_url: 'http://localhost:8080/',
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: 'price_1RLmav4gK3rGwcKR7ST4oxqY', // Replace with the real Stripe Price ID
          quantity: 1,
        },
      ],
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
