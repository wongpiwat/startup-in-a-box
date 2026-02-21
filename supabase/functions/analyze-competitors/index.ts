import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { idea, startupName, category } = await req.json();
    if (!idea) {
      return new Response(JSON.stringify({ error: "idea is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a market research analyst with deep knowledge of startups, tech companies, and competitive landscapes. Given a startup idea, identify REAL existing competitors and similar products in the market. Only mention companies and products that actually exist. Be accurate and factual.`,
          },
          {
            role: "user",
            content: `Analyze the competitive landscape for this startup idea: "${idea}"
Startup name: "${startupName || "N/A"}"
Category: "${category || "N/A"}"

Find 4-6 REAL existing competitors or similar products. For each competitor, provide accurate information.

Respond ONLY with valid JSON in this exact structure:
{
  "competitors": [
    {
      "name": "Real company name",
      "description": "1-2 sentence description of what they do",
      "website": "https://their-actual-website.com",
      "founded": "Year founded (e.g. 2019)",
      "funding": "Known funding info (e.g. '$50M Series B' or 'Bootstrapped' or 'Unknown')",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "similarity": <number 1-100, how similar they are to the proposed startup idea>
    }
  ],
  "marketInsight": "2-3 sentences about the overall competitive landscape, market gaps, and how the proposed startup could differentiate itself",
  "threatLevel": "<low|medium|high> — overall competitive threat assessment"
}`,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required. Please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    let result;
    try {
      const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/) || rawContent.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;
      result = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("JSON parse error:", e, rawContent);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-competitors error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
