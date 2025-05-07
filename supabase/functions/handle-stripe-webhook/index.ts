import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.15.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event
  try {
    // Use the asynchronous version of constructEvent
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    console.log('Event Type:', event.type);
    console.log('Event Data:', JSON.stringify(event.data, null, 2));

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'invoice.paid' ||
      event.type === 'invoice.payment_succeeded' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created'
    ) {
      const subscription = event.data.object

      // Check if current_period_end is present
      const currentPeriodEndTimestamp = subscription.current_period_end
      console.log('current_period_end timestamp:', currentPeriodEndTimestamp)

      if (!currentPeriodEndTimestamp || isNaN(currentPeriodEndTimestamp)) {
        console.warn('No valid current_period_end found, skipping update.')
        return new Response('current_period_end missing or invalid', { status: 200 })
      }

      const currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000).toISOString()

      const customerId = subscription.customer
      const priceId = subscription.items?.data?.[0]?.price?.id

      // Ensure that subscription.items.data exists and is properly formatted
      if (!subscription.items?.data || !subscription.items.data[0]?.price) {
        console.warn('Price ID missing or malformed in subscription items.')
        return new Response('Price ID missing or malformed', { status: 200 })
      }

      // Find the user_id associated with this customer
      const { data: customerMapping, error } = await supabase
        .from('customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single()

      if (error || !customerMapping) {
        console.error('User not found for customer ID:', customerId)
        throw new Error('User not found for customer ID: ' + customerId)
      }

      console.log('Customer Mapping:', customerMapping)

      // Upsert subscription info
      const { error: upsertError } = await supabase.from('subscriptions').upsert({
        user_id: customerMapping.user_id,
        status: subscription.status,
        price_id: priceId,
        current_period_end: currentPeriodEnd,
      })

      if (upsertError) {
        console.error('Error upserting subscription:', upsertError.message)
        return new Response('Error upserting subscription', { status: 500 })
      }

      console.log('Subscription upserted successfully for user:', customerMapping.user_id)
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (err: any) {
    console.error('Error handling webhook:', err)
    return new Response('Internal error', { status: 500 })
  }
})
