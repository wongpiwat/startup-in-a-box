import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_MODEL = "gemini-3-flash-preview";

const SECTION_PROMPTS: Record<string, string> = {
  targetPersona: `Return ONLY this JSON:
{
  "targetPersona": {
    "name": "Persona name",
    "age": "Age range",
    "painPoints": ["pain1", "pain2", "pain3"],
    "goals": ["goal1", "goal2", "goal3"]
  }
}`,
  coreFeatures: `Return ONLY this JSON:
{
  "coreFeatures": [
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"}
  ]
}`,
  pricingModel: `Return ONLY this JSON:
{
  "pricingModel": {
    "type": "Freemium / Subscription / Usage-based / One-time / Marketplace",
    "tiers": [
      {"name": "Tier", "price": "$X/mo", "features": ["f1", "f2", "f3"]},
      {"name": "Tier", "price": "$X/mo", "features": ["f1", "f2", "f3"]},
      {"name": "Tier", "price": "$X/mo", "features": ["f1", "f2", "f3"]}
    ]
  }
}`,
  techStack: `Return ONLY this JSON:
{
  "techStack": {
    "frontend": ["tech1", "tech2"],
    "backend": ["tech1", "tech2"],
    "ai": ["Amazon Bedrock", "tech2"],
    "infrastructure": ["AWS", "tech2"],
    "observability": ["Datadog", "tech2"]
  }
}`,
  launchRoadmap: `Return ONLY this JSON:
{
  "launchRoadmap": [
    {"week": "Week 1-2", "phase": "Phase name", "tasks": ["t1", "t2", "t3"]},
    {"week": "Week 3-4", "phase": "Phase name", "tasks": ["t1", "t2", "t3"]},
    {"week": "Week 5-6", "phase": "Phase name", "tasks": ["t1", "t2", "t3"]},
    {"week": "Week 7-8", "phase": "Phase name", "tasks": ["t1", "t2", "t3"]}
  ]
}`,
  investorPitch: `Return ONLY this JSON:
{
  "investorPitch": {
    "problemStatement": "...",
    "solution": "...",
    "marketSize": "...",
    "traction": "...",
    "ask": "...",
    "uniqueAdvantage": "..."
  }
}`,
};

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userContent: string,
  temperature = 0.9
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
    const { idea, startupName, section } = await req.json();
    if (!idea || !section || !SECTION_PROMPTS[section]) {
      return new Response(JSON.stringify({ error: "idea and valid section are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemInstruction = `You are an expert startup strategist. Given a startup idea and name, regenerate a specific section of their startup blueprint. Be creative, specific, and different from what they had before. Respond ONLY with valid JSON.`;
    const userContent = `Startup idea: "${idea}"\nStartup name: "${startupName}"\n\nRegenerate the ${section} section.\n\n${SECTION_PROMPTS[section]}`;

    const rawContent = await callGemini(GEMINI_API_KEY, systemInstruction, userContent, 0.9);

    let sectionData;
    try {
      const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/) || rawContent.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;
      sectionData = JSON.parse(jsonStr.trim());
    } catch (e) {
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ sectionData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("regenerate-section error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const is429 = msg.includes("429") || msg.toLowerCase().includes("resource has been exhausted");
    return new Response(
      JSON.stringify({
        error: is429 ? "Rate limit exceeded. Please try again." : msg,
      }),
      {
        status: is429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
