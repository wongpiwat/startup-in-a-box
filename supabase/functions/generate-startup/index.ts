import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { idea } = await req.json();
    if (!idea || typeof idea !== "string") {
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
            content: `You are an expert startup strategist, product designer, and venture capitalist. 
When given a startup idea, you generate a comprehensive, realistic, and exciting startup blueprint.
Always respond with valid JSON matching the exact schema provided. Be specific, creative, and make it feel like a real company.`,
          },
          {
            role: "user",
            content: `Generate a complete startup blueprint for this idea: "${idea}"

Respond ONLY with valid JSON in this exact structure:
{
  "name": "Startup name (creative, memorable, 1-2 words)",
  "tagline": "One punchy sentence that captures the value proposition",
  "category": "One of: Health & Fitness, EdTech, FinTech, DevTools, MarketingTech, HR & Recruiting, Logistics, Climate, B2B SaaS, Consumer App, E-commerce, Social, Healthcare, LegalTech, Real Estate",
  "targetPersona": {
    "name": "Persona name (e.g. 'Sarah, the Busy Entrepreneur')",
    "age": "Age range",
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "goals": ["goal 1", "goal 2", "goal 3"]
  },
  "coreFeatures": [
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"},
    {"name": "Feature name", "description": "1-2 sentence description", "icon": "emoji"}
  ],
  "pricingModel": {
    "type": "Freemium / Subscription / Usage-based / One-time / Marketplace",
    "tiers": [
      {"name": "Tier name", "price": "$X/mo", "features": ["feature 1", "feature 2", "feature 3"]},
      {"name": "Tier name", "price": "$X/mo", "features": ["feature 1", "feature 2", "feature 3"]},
      {"name": "Tier name", "price": "$X/mo", "features": ["feature 1", "feature 2", "feature 3"]}
    ]
  },
  "techStack": {
    "frontend": ["tech 1", "tech 2", "tech 3", "tech 4"],
    "backend": ["tech 1", "tech 2", "tech 3"],
    "database": ["tech 1", "tech 2"],
    "ai": ["Amazon Bedrock", "tech 2", "tech 3"],
    "devops": ["tech 1", "tech 2", "tech 3"],
    "infrastructure": ["AWS", "tech 2", "tech 3"],
    "apis": ["tech 1", "tech 2"],
    "observability": ["Datadog", "tech 2"]
  },
  "launchRoadmap": [
    {"week": "Week 1-2", "phase": "Phase name", "tasks": ["task 1", "task 2", "task 3"]},
    {"week": "Week 3-4", "phase": "Phase name", "tasks": ["task 1", "task 2", "task 3"]},
    {"week": "Week 5-6", "phase": "Phase name", "tasks": ["task 1", "task 2", "task 3"]},
    {"week": "Week 7-8", "phase": "Phase name", "tasks": ["task 1", "task 2", "task 3"]}
  ],
  "investorPitch": {
    "problemStatement": "2-3 sentences describing the market problem",
    "solution": "2-3 sentences describing your unique solution",
    "marketSize": "TAM estimate with reasoning",
    "traction": "What early traction or validation signals would look like",
    "ask": "Funding ask and use of funds",
    "uniqueAdvantage": "The key moat or defensibility factor"
  },
  "confidenceScore": "<number 1-100, your honest assessment of overall viability — DO NOT default to 87, evaluate each idea uniquely>",
  "evaluationScores": {
    "solution": "<number 1-10, how well the solution addresses the problem>",
    "problem": "<number 1-10, how significant and painful the problem is>",
    "features": "<number 1-10, how compelling and differentiated the features are>",
    "market": "<number 1-10, market size and growth potential>",
    "revenue": "<number 1-10, clarity and scalability of revenue model>",
    "competition": "<number 1-10, competitive landscape favorability>",
    "risk": "<number 1-10, lower means higher risk — 10 means very low risk>"
  }
}`,
          },
        ],
        temperature: 0.85,
      }),
    });

    const generationTime = Date.now() - startTime;

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
    const usage = aiData.usage ?? {};

    // Parse JSON from the response (handle markdown code blocks)
    let startup;
    try {
      const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/) || rawContent.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;
      startup = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("JSON parse error:", e, rawContent);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save metrics + full result to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let savedId: string | null = null;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: inserted } = await supabase.from("generation_metrics").insert({
        idea: idea,
        startup_name: startup.name,
        category: startup.category,
        generation_time_ms: generationTime,
        prompt_tokens: usage.prompt_tokens ?? 0,
        completion_tokens: usage.completion_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0,
        output_length: rawContent.length,
        confidence_score: startup.confidenceScore ?? 0,
        result_json: startup,
      }).select("id").single();
      if (inserted) savedId = inserted.id;
    }

    return new Response(
      JSON.stringify({
        id: savedId,
        startup,
        metrics: {
          generationTimeMs: generationTime,
          promptTokens: usage.prompt_tokens ?? 0,
          completionTokens: usage.completion_tokens ?? 0,
          totalTokens: usage.total_tokens ?? 0,
          outputLength: rawContent.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-startup error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
