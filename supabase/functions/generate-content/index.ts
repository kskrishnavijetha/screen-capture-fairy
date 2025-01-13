import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType, tone, title } = await req.json();

    // Validate OpenAI API key
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are an expert content creator. Generate ${contentType} content with a ${tone} tone.
    If a title is provided, use it as the main topic. Make the content engaging and well-structured.
    For blog posts, include an introduction, main points, and conclusion.
    For social media posts, keep it concise and engaging.
    For email newsletters, maintain a conversational tone and clear structure.
    For marketing copy, focus on benefits and call-to-action.`;

    console.log('Generating content with parameters:', { contentType, tone, title });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using a more cost-effective model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Title: ${title}\nTopic: ${prompt}\nGenerate content in ${tone} tone for ${contentType} format.` }
        ],
        max_tokens: 1000, // Limiting token usage
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      // Check for specific error types
      if (errorData.error?.type === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing details.');
      }
      
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Content generated successfully');

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    
    // Return a more user-friendly error message
    const errorMessage = error.message.includes('OpenAI API') 
      ? error.message 
      : 'Failed to generate content. Please try again later.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});