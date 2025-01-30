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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { videoId, transcription, frameData } = await req.json();

    if (!videoId) {
      throw new Error('Video ID is required');
    }

    console.log('Processing request for video:', videoId);
    console.log('Transcription available:', !!transcription);
    console.log('Frame data available:', !!frameData);

    // Analyze both text and visual data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in multimodal emotion analysis. Analyze both the transcription and visual data to identify emotional highlights with high confidence.'
          },
          {
            role: 'user',
            content: `Analyze the emotional content in this data:
              Transcription: ${transcription || 'No transcription available'}
              Visual Data: ${frameData ? `${frameData.length} frames available` : 'No visual data available'}`
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    // Parse the response to extract emotional highlights
    const analysis = data.choices[0].message.content;
    console.log('Enhanced emotion analysis:', analysis);

    // Convert the analysis into structured highlights
    const highlights = analysis.split('\n')
      .filter(line => line.includes('timestamp') || line.includes('time:'))
      .map(line => {
        const timestamp = parseFloat(line.match(/\d+(\.\d+)?/)?.[0] || '0');
        const emotion = line.toLowerCase().includes('excited') ? 'excited' :
                       line.toLowerCase().includes('happy') ? 'happy' :
                       line.toLowerCase().includes('sad') ? 'sad' : 'neutral';
        
        const confidence = line.toLowerCase().includes('high') ? 0.9 :
                         line.toLowerCase().includes('medium') ? 0.7 : 0.5;
        
        return {
          timestamp,
          emotion,
          confidence,
          source: line.toLowerCase().includes('visual') ? 'visual' : 
                 line.toLowerCase().includes('audio') ? 'audio' : 'text'
        };
      });

    return new Response(
      JSON.stringify({ highlights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhanced emotion analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});