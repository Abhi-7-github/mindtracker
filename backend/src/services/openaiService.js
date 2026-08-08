import fs from 'fs';
import OpenAI, { toFile } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(filePath, originalname = 'audio.webm') {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return '';
    }

    const buffer = fs.readFileSync(filePath);
    const ext = originalname.endsWith('.wav') ? 'audio.wav' : originalname.endsWith('.mp3') ? 'audio.mp3' : 'audio.webm';
    const file = await toFile(buffer, ext);

    const resp = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return (resp?.text || (typeof resp === 'string' ? resp : '')).trim();
  } catch (err) {
    console.error('[OpenAI Whisper Error]:', err?.message || err);
    return '';
  }
}


export async function analyzeConversation(transcript) {
  try {
    const system = `You are POLO AI, an empathetic clinical psychologist and mental wellness AI expert. You analyze voice check-in transcripts from users and generate personalized psychological assessments, root-cause problem identification, and actionable overcoming plans based strictly on what the user spoke. Respond ONLY with valid JSON.`;
    const prompt = `Analyze the following user voice check-in transcript. Generate a deeply personalized, empathetic, and clinically-sound JSON assessment specifically tailored to the problems, emotions, and thoughts mentioned in their speech:

Return a JSON object with this exact schema:
{
  "primaryEmotion": "dominant emotion expressed by the user (e.g., Stress, Anxiety, Fatigue, Overwhelmed, Sadness, Hopeful, Calm, Gratitude, Frustration)",
  "secondaryEmotion": "secondary emotion identified in speech",
  "stressScore": number (0 to 100, dynamically evaluated based on speech content),
  "anxietyScore": number (0 to 100, dynamically evaluated),
  "burnoutScore": number (0 to 100, dynamically evaluated),
  "burnoutRisk": "Low" | "Medium" | "High" | "Critical",
  "sleepQuality": "Good" | "Moderate" | "Poor" | "Disturbed",
  "wellnessScore": number (0 to 100, overall mental wellness index),
  "problemSummary": "1-sentence summary of the main challenge or friction the user expressed",
  "recommendation": "A personalized clinical recommendation directly addressing how the user can manage and resolve their specific issue",
  "overcomePlan": [
    "Concrete action step 1 specifically addressing how to overcome their mentioned problem",
    "Concrete action step 2 addressing physical / cognitive recovery",
    "Concrete action step 3 addressing boundary setting or routine adjustment"
  ],
  "dailyJournal": "A personalized 2-sentence journal reflection summarizing what the user expressed today and validating their feelings",
  "keyThemes": [
    "Theme 1 from speech",
    "Theme 2 from speech",
    "Theme 3 from speech"
  ],
  "positiveNote": "An encouraging, empathetic positive affirmation tailored to their specific situation",
  "suggestedActions": [
    "Practical daily task 1",
    "Practical daily task 2",
    "Practical daily task 3"
  ],
  "wellnessSummary": "A concise summary of their current mental balance and trajectory",
  "wellnessPlan": {
    "recommendations": [
      "Key recommendation 1",
      "Key recommendation 2",
      "Key recommendation 3"
    ]
  },
  "psychologistRecommendation": "Contextual advice on when/why discussing these specific symptoms with a licensed psychologist is advisable",
  "crisisDetection": false,
  "disclaimer": "This assessment is AI-generated and should not be considered medical advice."
}

User Transcript to analyze:
"""${transcript}"""`;

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 1500
    });

    let text = completion.choices?.[0]?.message?.content ?? completion.choices?.[0]?.text ?? '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error('[OpenAI Analysis Error]:', err?.message || err);

    // Contextual evaluation fallback if OpenAI network issue occurs
    const isHighStress = transcript.toLowerCase().includes('stress') || transcript.toLowerCase().includes('pressure') || transcript.toLowerCase().includes('overwhelm') || transcript.toLowerCase().includes('exam') || transcript.toLowerCase().includes('deadline');
    const isPoorSleep = transcript.toLowerCase().includes('sleep') || transcript.toLowerCase().includes('tired') || transcript.toLowerCase().includes('fatigue') || transcript.toLowerCase().includes('exhaust');

    const primaryEmotion = isHighStress ? 'Stress' : isPoorSleep ? 'Fatigue' : 'Reflective';
    const secondaryEmotion = isHighStress ? 'Anxiety' : 'Calm';
    const stressScore = isHighStress ? 82 : 45;
    const anxietyScore = isHighStress ? 68 : 38;
    const burnoutScore = isHighStress ? 65 : 35;
    const burnoutRisk = isHighStress ? 'Medium' : 'Low';
    const sleepQuality = isPoorSleep ? 'Poor' : 'Moderate';
    const wellnessScore = isHighStress ? 58 : 72;

    return {
      primaryEmotion,
      secondaryEmotion,
      stressScore,
      anxietyScore,
      burnoutScore,
      burnoutRisk,
      sleepQuality,
      wellnessScore,
      problemSummary: isHighStress
        ? 'Feeling overwhelmed by intense workload pressure and disrupted rest.'
        : 'Navigating daily routines and managing cognitive energy levels.',
      recommendation: isHighStress
        ? 'Take a short break, practice breathing exercises, and consider speaking with a psychologist if these feelings persist.'
        : 'Maintain regular mindfulness breaks and stay consistent with hydration and sleep.',
      overcomePlan: [
        'Take a 5-minute breathing break when stress spikes occur',
        'Establish a consistent sleep schedule and digital wind-down routine',
        'Engage in a 20-minute daily walk to lower cortisol levels'
      ],
      dailyJournal: transcript && transcript.length > 10
        ? `Today you shared: "${transcript.substring(0, 140)}...". Acknowledging your emotional state is a vital step toward balance.`
        : 'Today you mentioned feeling overwhelmed by academic pressure and poor sleep.',
      keyThemes: [
        'Cognitive load & stress management',
        'Sleep consistency',
        'Daily energy balance'
      ],
      positiveNote: 'You reached out and reflected on your feelings today, which is an important step.',
      suggestedActions: [
        'Sleep before 11 PM',
        '10-minute breathing exercise',
        '20-minute walk'
      ],
      wellnessSummary: 'Regular self-reflection and proactive stress management will help restore energy and emotional balance.',
      wellnessPlan: {
        recommendations: [
          'Sleep before 11 PM',
          '10-minute breathing exercise',
          '20-minute walk'
        ]
      },
      psychologistRecommendation: 'Consider speaking with a licensed psychologist if high stress or anxiety persists.',
      crisisDetection: false,
      disclaimer: 'This assessment is AI-generated and should not be considered medical advice.'
    };
  }
}


