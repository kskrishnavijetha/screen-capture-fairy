import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Mock data for demonstration - replace with actual video analysis
    const mockHighlights = [
      { timestamp: 15, emotion: 'excited', confidence: 0.85 },
      { timestamp: 45, emotion: 'happy', confidence: 0.75 },
      { timestamp: 90, emotion: 'neutral', confidence: 0.65 },
      { timestamp: 120, emotion: 'sad', confidence: 0.70 },
    ];

    return new Response(
      JSON.stringify({ highlights: mockHighlights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-emotion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});