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
    const { videoId, transcription } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!transcription || !transcription.length) {
      throw new Error('No transcription provided for analysis');
    }

    console.log('Analyzing emotions for video:', videoId);
    console.log('Transcription length:', transcription.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an emotion analysis expert. Analyze the given transcription and identify emotional highlights with timestamps. Focus on excited, happy, neutral, and sad emotions.'
          },
          {
            role: 'user',
            content: `Analyze the emotional content in this transcription and return emotional highlights with timestamps: ${transcription}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    // Parse the response to extract emotional highlights
    const analysis = data.choices[0].message.content;
    console.log('Emotion analysis:', analysis);

    // Convert the analysis into structured highlights
    // This is a simplified example - you might want to improve the parsing logic
    const highlights = analysis.split('\n')
      .filter(line => line.includes('timestamp') || line.includes('time:'))
      .map(line => {
        const timestamp = parseFloat(line.match(/\d+(\.\d+)?/)?.[0] || '0');
        const emotion = line.toLowerCase().includes('excited') ? 'excited' :
                       line.toLowerCase().includes('happy') ? 'happy' :
                       line.toLowerCase().includes('sad') ? 'sad' : 'neutral';
        return {
          timestamp,
          emotion,
          confidence: 0.8 // Simplified confidence score
        };
      });

    return new Response(
      JSON.stringify({ highlights }),
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