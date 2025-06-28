import { serve } from "npm:@supabase/functions-js@2.3.3";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature found in request");
    }

    // Get the raw body
    const body = await req.text();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify the webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    // Construct the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Process the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Get the user ID from the metadata
      const userId = session.metadata?.userId;
      if (!userId) {
        throw new Error("No user ID found in session metadata");
      }

      // Get the app ID from the metadata (if it's an app purchase)
      const appId = session.metadata?.appId;
      
      // Record the transaction
      if (appId) {
        // App purchase
        await fetch(`${supabaseUrl}/rest/v1/transactions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            user_id: userId,
            app_id: appId,
            amount: session.amount_total / 100, // Convert from cents to dollars
            currency: session.currency,
            stripe_payment_intent_id: session.payment_intent,
            status: "completed",
          }),
        });
        
        // Update user's purchased apps
        await fetch(`${supabaseUrl}/rest/v1/app_purchases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            user_id: userId,
            app_id: appId,
            purchase_date: new Date().toISOString(),
          }),
        });
      } else {
        // Subscription purchase
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        
        if (priceId) {
          // Determine subscription tier based on price ID
          let tier = "free";
          if (priceId.includes("pro")) {
            tier = "pro";
          } else if (priceId.includes("enterprise")) {
            tier = "enterprise";
          }
          
          // Update user's subscription tier
          await fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({
              subscription_tier: tier,
            }),
            
          });
          
          // Record subscription
          await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({
              user_id: userId,
              tier: tier,
              stripe_subscription_id: session.subscription,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});