// supabase/functions/get-subscription-status/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.15.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    console.log("userId: ", userId)

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    )

    const { data, error } = await supabaseClient
      .from("customers")
      .select("customer_id")
      .eq("user_id", userId)
      .single()

    const customerId = data?.customer_id
    console.log("customerId: ", customerId)

    if (!customerId) {
      return new Response(JSON.stringify({
        active: false,
        tier: 'basic',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    })

    console.log("subscriptions: ", subscriptions)

    const activeSub = subscriptions.data.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )

    console.log("activeSub: ", activeSub)

    if (!activeSub) {
      return new Response(JSON.stringify({
        active: false,
        tier: 'basic',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      active: true,
      tier: "premium",
      end: new Date(activeSub.current_period_end * 1000).toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
