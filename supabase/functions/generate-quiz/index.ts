import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
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

    // Generate quiz using OpenAI
    const prompt = `Based on the following notes, create a quiz with exactly 5 multiple-choice questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Notes:
${notes}

Please respond with a JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make sure:
- Questions test understanding of key concepts from the notes
- Options are plausible but only one is clearly correct
- correctAnswer is the index (0-3) of the correct option
- Questions are clear and concise`;

    console.log('Generating quiz for notes:', notes.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates educational quizzes. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    let quizData;
    try {
      quizData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse quiz data from AI response');
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format received from AI');
    }

    // Validate and format questions
    const questions: QuizQuestion[] = quizData.questions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    // Save quiz to database if user is authenticated
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
            .from('quizzes')
            .insert({
              user_id: user.id,
              title: title || 'Generated Quiz',
              notes_content: notes,
              questions: questions,
              total_questions: questions.length
            });

          if (insertError) {
            console.error('Error saving quiz:', insertError);
          } else {
            console.log('Quiz saved successfully');
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB save fails
      }
    }

    return new Response(
      JSON.stringify({ 
        questions,
        title: title || 'Generated Quiz'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});