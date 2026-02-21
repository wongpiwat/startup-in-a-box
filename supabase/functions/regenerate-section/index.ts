import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
            content: `You are an expert startup strategist. Given a startup idea and name, regenerate a specific section of their startup blueprint. Be creative, specific, and different from what they had before. Respond ONLY with valid JSON.`,
          },
          {
            role: "user",
            content: `Startup idea: "${idea}"\nStartup name: "${startupName}"\n\nRegenerate the ${section} section.\n\n${SECTION_PROMPTS[section]}`,
          },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Rate limit exceeded. Please try again.");
      if (response.status === 402) throw new Error("Credits required.");
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
