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
    console.log('Event Type:', event.type)
    console.log('Event Data:', JSON.stringify(event.data, null, 2))

    switch (event.type) {

      case 'customer.subscription.updated': {

        const subscription = event.data.object
        if (!subscription.items?.data?.length) {
          return new Response('No items in subscription', { status: 400 })
        }
        const customerId = subscription.customer

        const { data: customerMapping, error } = await supabase
          .from('customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .single()

        if (error || !customerMapping) {
          console.error('User not found for customer ID:', customerId)
          throw new Error('User not found for customer ID: ' + customerId)
        }

        const userId = customerMapping.user_id
        const priceId = subscription.items?.data?.[0]?.price?.id

        const currentPeriodEndTimestamp = subscription.items?.data?.[0]?.current_period_end
        const currentPeriodEnd = currentPeriodEndTimestamp
          ? new Date(currentPeriodEndTimestamp * 1000).toISOString()
          : null

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          price_id: priceId,
          status: subscription.status,
          current_period_end: currentPeriodEnd,
        })

        console.log('Subscription updated.')
        break
      }

      case 'customer.deleted': {

        const customer = event.data.object
        const customerId = customer.id

        const { data: customerMapping, errorMapping } = await supabase
          .from('customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .single()

        if (errorMapping || !customerMapping) {
          console.error('User not found for customer ID:', customerId)
          throw new Error('User not found for customer ID: ' + customerId)
        }

        const userId = customerMapping.user_id

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)

        const { errorDeletion } = await supabase
          .from('customers')
          .delete()
          .eq('customer_id', customerId)

        if (errorDeletion) {
          console.error('Failed to delete customer from Supabase:', errorDeletion)
          throw new Error('Error deleting customer: ' + errorDeletion.message)
        }
        else{
          console.log('Customer deleted, subscriptions marked as canceled.')
        }

        break
      }

      default: {
        console.log('Unhandled event type:', event.type)
      }
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (err: any) {
    console.error('Error handling webhook:', err)
    return new Response('Internal error', { status: 500 })
  }
})


