import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

    console.log('Analyzing key moments for video:', videoId);
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
            content: 'You are an expert at identifying key moments in video recordings. Focus on detecting actions like mouse clicks, text input, code execution, and important explanations. Return timestamps and descriptions in a structured format.'
          },
          {
            role: 'user',
            content: `Analyze this transcription and identify key moments with timestamps: ${transcription}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    // Parse the response to extract key moments
    const analysis = data.choices[0].message.content;
    console.log('Key moments analysis:', analysis);

    // Convert the analysis into structured moments
    const moments = analysis.split('\n')
      .filter(line => line.includes('timestamp') || line.includes('time:'))
      .map(line => {
        const timestamp = parseFloat(line.match(/\d+(\.\d+)?/)?.[0] || '0');
        const description = line.replace(/.*?:/, '').trim();
        const momentType = line.toLowerCase().includes('click') ? 'mouse_click' :
                         line.toLowerCase().includes('input') ? 'text_input' :
                         line.toLowerCase().includes('code') ? 'code_execution' : 'explanation';
        return {
          timestamp,
          moment_type: momentType,
          description,
          confidence: 0.8
        };
      });

    // Store the moments in the database
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    for (const moment of moments) {
      await supabase
        .from('video_key_moments')
        .insert({
          video_id: videoId,
          ...moment
        });
    }

    return new Response(
      JSON.stringify({ moments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-key-moments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});