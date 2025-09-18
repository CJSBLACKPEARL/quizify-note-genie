import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes, title } = await req.json();
    
    if (!notes || notes.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Notes content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate flashcards using OpenAI
    const prompt = `Based on the following notes, create flashcards for the most important concepts, terms, definitions, and key points. Generate at least 10-15 flashcards.

Notes:
${notes}

Please respond with a JSON object in this exact format:
{
  "flashcards": [
    {
      "front": "Term or concept or question",
      "back": "Definition, explanation, or answer",
      "category": "Category name (e.g., 'Definitions', 'Concepts', 'Facts', 'Processes')"
    }
  ]
}

Make sure:
- Front side contains key terms, concepts, or questions
- Back side contains clear definitions, explanations, or answers
- Categories help organize the flashcards by topic
- Focus on the most important and testable information
- Include various types: definitions, explanations, examples, and key facts`;

    console.log('Generating flashcards for notes:', notes.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates educational flashcards. Always respond with valid JSON. Focus on extracting the most important and memorable concepts.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let flashcardData;
    try {
      flashcardData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse flashcard data from AI response');
    }

    if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards)) {
      throw new Error('Invalid flashcard format received from AI');
    }

    // Validate and format flashcards
    const flashcards: Flashcard[] = flashcardData.flashcards.map((card: any, index: number) => ({
      id: index + 1,
      front: card.front,
      back: card.back,
      category: card.category || 'General'
    }));

    // Save flashcards to database if user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error: insertError } = await supabase
            .from('flashcards')
            .insert({
              user_id: user.id,
              title: title || 'Generated Flashcards',
              notes_content: notes,
              flashcard_data: flashcards,
              total_cards: flashcards.length
            });

          if (insertError) {
            console.error('Error saving flashcards:', insertError);
          } else {
            console.log('Flashcards saved successfully');
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB save fails
      }
    }

    return new Response(
      JSON.stringify({ 
        flashcards,
        title: title || 'Generated Flashcards'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});