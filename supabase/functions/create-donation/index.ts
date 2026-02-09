import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fixed price IDs for suggested amounts
const PRICE_MAP: Record<number, string> = {
  1000: "price_1SysZA4WmG0QaRY4izMOdpOl",   // R$10
  2500: "price_1SysaP4WmG0QaRY4aDaLFDZz",   // R$25
  5000: "price_1Sysb54WmG0QaRY4geHHHaMo",   // R$50
  10000: "price_1SysbF4WmG0QaRY4sjtplwuw",  // R$100
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();
    if (!amount || amount < 500) {
      throw new Error("Valor mínimo de R$5,00");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://viva-livre-game.lovable.app";

    // Use fixed price for known amounts, otherwise create ad-hoc price
    const priceId = PRICE_MAP[amount];

    let lineItems;
    if (priceId) {
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      // Custom amount - use price_data for flexibility
      lineItems = [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Doação Viva+ Livre - R$${(amount / 100).toFixed(2)}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/donate?status=success`,
      cancel_url: `${origin}/donate?status=canceled`,
      submit_type: "donate",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
