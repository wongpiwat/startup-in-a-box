import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_MODEL = "gemini-3-flash-preview";

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userContent: string,
  temperature = 0.5
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: { temperature, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemInstruction = `You are a market research analyst with deep knowledge of startups, tech companies, and competitive landscapes. Given a startup idea, identify REAL existing competitors and similar products in the market. Only mention companies and products that actually exist. Be accurate and factual.`;

    const userContent = `Analyze the competitive landscape for this startup idea: "${idea}"
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
}`;

    const rawContent = await callGemini(GEMINI_API_KEY, systemInstruction, userContent, 0.5);

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
    const msg = e instanceof Error ? e.message : "Unknown error";
    const is429 = msg.includes("429") || msg.toLowerCase().includes("resource has been exhausted");
    return new Response(
      JSON.stringify({
        error: is429 ? "Rate limit exceeded. Please try again in a moment." : msg,
      }),
      {
        status: is429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
