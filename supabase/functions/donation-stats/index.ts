import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Fetch successful payments (one-time donations)
    const charges = await stripe.charges.list({
      limit: 100,
      expand: ["data.balance_transaction"],
    });

    const successfulCharges = charges.data.filter(
      (c) => c.status === "succeeded" && c.currency === "brl"
    );

    const totalAmount = successfulCharges.reduce(
      (sum, c) => sum + c.amount,
      0
    );
    const totalDonors = new Set(
      successfulCharges.map((c) => c.customer || c.billing_details?.email || c.id)
    ).size;

    // Active subscriptions count
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    return new Response(
      JSON.stringify({
        totalAmountCents: totalAmount,
        totalDonations: successfulCharges.length,
        totalDonors,
        activeSubscriptions: subscriptions.data.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
