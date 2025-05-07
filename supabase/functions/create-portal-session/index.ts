// supabase/functions/create-portal-session/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.15.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:8080/dashboard',
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error("Error in create-portal-session:", err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }  
})
