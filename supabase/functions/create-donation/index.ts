import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fixed price IDs for one-time suggested amounts
const PRICE_MAP_ONETIME: Record<number, string> = {
  1000: "price_1SysZA4WmG0QaRY4izMOdpOl",
  2500: "price_1SysaP4WmG0QaRY4aDaLFDZz",
  5000: "price_1Sysb54WmG0QaRY4geHHHaMo",
  10000: "price_1SysbF4WmG0QaRY4sjtplwuw",
};

// Fixed price IDs for recurring (monthly) suggested amounts
const PRICE_MAP_RECURRING: Record<number, string> = {
  1000: "price_1T2AX04WmG0QaRY4ovtq3hMw",
  2500: "price_1T2AXK4WmG0QaRY4aw6QcKWi",
  5000: "price_1T2AXi4WmG0QaRY4xVUKcdnx",
  10000: "price_1T2AXv4WmG0QaRY4K9DOFERW",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, recurring } = await req.json();
    if (!amount || amount < 500) {
      throw new Error("Valor mínimo de R$5,00");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://viva-livre-game.lovable.app";
    const isRecurring = recurring === true;
    const priceMap = isRecurring ? PRICE_MAP_RECURRING : PRICE_MAP_ONETIME;
    const priceId = priceMap[amount];

    let lineItems;
    if (priceId) {
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      if (isRecurring) {
        lineItems = [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: `Doação Mensal Viva+ Livre - R$${(amount / 100).toFixed(2)}`,
              },
              unit_amount: amount,
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          },
        ];
      } else {
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
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${origin}/donate?status=success`,
      cancel_url: `${origin}/donate?status=canceled`,
      ...(isRecurring ? {} : { submit_type: "donate" }),
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
