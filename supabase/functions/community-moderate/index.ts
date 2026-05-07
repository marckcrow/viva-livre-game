import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ ok: false, reason: "Conteúdo inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um moderador de uma comunidade de apoio à recuperação de vícios (álcool/tabaco). Avalie se o texto contém: ódio, ataques pessoais, glorificação do uso de drogas, conteúdo sexual, spam, doxxing ou incentivo a recaída. Conteúdo sobre fé/Deus/Bíblia é PERMITIDO. Desabafos negativos sinceros são PERMITIDOS." },
          { role: "user", content: `Texto: "${content}"` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "moderate",
            description: "Decide se o post pode ser publicado",
            parameters: {
              type: "object",
              properties: {
                allow: { type: "boolean" },
                reason: { type: "string", description: "Motivo curto se rejeitado, vazio se aprovado" },
              },
              required: ["allow", "reason"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "moderate" } },
      }),
    });

    if (!response.ok) {
      // Em caso de falha do gateway, aprovar por padrão para não travar a experiência
      return new Response(JSON.stringify({ ok: true, reason: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await response.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { allow: true, reason: "" };
    return new Response(JSON.stringify({ ok: !!parsed.allow, reason: parsed.reason || "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, reason: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
