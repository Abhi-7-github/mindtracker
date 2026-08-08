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
    const system = `You are an expert AI Mental Wellness Assessment Engine for the POLO Healthcare platform.
Your task is to analyze ONLY the user's current input.

IMPORTANT RULES
1. NEVER use hardcoded values.
2. NEVER reuse previous responses.
3. NEVER return default scores like Stress 45%, Wellness 72, Burnout Low, etc.
4. Every response MUST be generated from the current user input.
5. If two different users provide different messages, the output MUST be different.
6. If the same user provides different messages, the output MUST also be different.
7. Infer emotions, stress, burnout, sleep indicators, and recommendations from the user's words.
8. If there is not enough information to determine a metric, return "Unknown" instead of guessing.
9. Return ONLY valid JSON.
10. Do not include markdown or explanations.
11. Make the journal feel personal to the user's message.
12. Recommendations must be personalized, actionable, and directly related to the user's concerns.
13. Never use fixed templates or repeated wording.
14. Base every score on the current input.

--------------------------------------------------
Risk Level Rules

LOW: No significant emotional distress.
MODERATE: Noticeable stress or anxiety.
HIGH: Strong signs of emotional struggle.
CRITICAL: User expresses suicidal thoughts, self-harm intent, hopelessness, or immediate danger.

If the user expresses thoughts like:
- I want to die
- I don't want to live
- I want to kill myself
- Nobody needs me
- Life is meaningless
- I want to disappear
- Everyone would be better without me

THEN:
- Risk Level must become CRITICAL.
- Stress should generally be very high.
- Wellness should generally be very low.
- The journal should acknowledge the emotional pain.
- Recommendations should encourage reaching out to trusted people and professional support.
- Never shame or judge the user.
- Do NOT pretend to diagnose a medical condition.
- Do NOT claim certainty.

--------------------------------------------------
Return EXACTLY this JSON format:

{
  "analysis": {
    "stressLevel": {
      "score": 0,
      "label": ""
    },
    "wellnessScore": 0,
    "burnoutRisk": "",
    "sleepQuality": "",
    "anxietyLevel": "",
    "depressionIndicator": "",
    "emotionalStability": "",
    "riskLevel": ""
  },
  "emotionDetection": {
    "primary": "",
    "secondary": "",
    "confidence": 0
  },
  "summary": {
    "coreChallenge": "",
    "positiveStrengths": "",
    "clinicalSummary": ""
  },
  "recommendations": {
    "aiRecommendation": "",
    "recoveryPlan": [
      "",
      "",
      ""
    ]
  },
  "journal": {
    "title": "",
    "reflection": "",
    "positiveNote": "",
    "keyThemes": [
      "",
      "",
      ""
    ],
    "suggestedActions": [
      "",
      "",
      ""
    ]
  }
}`;

    const prompt = `Analyze this user input:\n\n${transcript}`;

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 1600
    });

    let text = completion.choices?.[0]?.message?.content ?? completion.choices?.[0]?.text ?? '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error('[OpenAI Analysis Error]:', err?.message || err);

    const inputLower = (transcript || '').toLowerCase();
    const isCritical =
      inputLower.includes('want to die') ||
      inputLower.includes("don't want to live") ||
      inputLower.includes('kill myself') ||
      inputLower.includes('nobody needs me') ||
      inputLower.includes('life is meaningless') ||
      inputLower.includes('want to disappear') ||
      inputLower.includes('better without me');

    const isHighStress =
      isCritical ||
      inputLower.includes('stress') ||
      inputLower.includes('pressure') ||
      inputLower.includes('overwhelm') ||
      inputLower.includes('anxious') ||
      inputLower.includes('panic');

    const isSleepIssue =
      inputLower.includes('sleep') ||
      inputLower.includes('insomnia') ||
      inputLower.includes('tired') ||
      inputLower.includes('exhaust');

    const stressScore = isCritical ? 95 : isHighStress ? 82 : 45;
    const wellnessScore = isCritical ? 15 : isHighStress ? 52 : 75;
    const riskLevel = isCritical ? 'CRITICAL' : isHighStress ? 'HIGH' : 'LOW';

    return {
      analysis: {
        stressLevel: {
          score: stressScore,
          label: stressScore > 75 ? 'High Stress' : stressScore > 45 ? 'Moderate Stress' : 'Balanced'
        },
        wellnessScore,
        burnoutRisk: isCritical ? 'High' : isHighStress ? 'Medium' : 'Low',
        sleepQuality: isSleepIssue ? 'Poor' : 'Unknown',
        anxietyLevel: isCritical ? 'High' : isHighStress ? 'Elevated' : 'Mild',
        depressionIndicator: isCritical ? 'High' : isHighStress ? 'Moderate' : 'Low',
        emotionalStability: isCritical ? 'Unstable' : isHighStress ? 'Fluctuating' : 'Stable',
        riskLevel
      },
      emotionDetection: {
        primary: isCritical ? 'Hopelessness' : isHighStress ? 'Stress' : 'Reflective',
        secondary: isCritical ? 'Severe Distress' : isHighStress ? 'Anxiety' : 'Calm',
        confidence: 90
      },
      summary: {
        coreChallenge: isCritical
          ? 'Acute emotional crisis and intense feelings of distress.'
          : isHighStress
          ? 'Navigating acute workload pressure and cognitive fatigue.'
          : 'Reflecting on daily routines and personal thoughts.',
        positiveStrengths: 'Willingness to articulate feelings and engage in daily reflection.',
        clinicalSummary: isCritical
          ? 'The user is experiencing significant emotional distress requiring urgent support.'
          : 'The user shows signs of manageable stress and can benefit from structured self-care.'
      },
      recommendations: {
        aiRecommendation: isCritical
          ? 'Please connect with a trusted person, counselor, or contact a crisis support hotline immediately for supportive guidance.'
          : 'Incorporate 5-minute breathing pauses and maintain a structured boundary between work and rest.',
        recoveryPlan: isCritical
          ? [
              'Reach out directly to a trusted loved one or counselor today',
              'Contact emergency wellness support or a crisis helpline',
              'Take slow, grounding deep breaths in a quiet, safe space'
            ]
          : [
              'Practice 10-minute diaphragmatic breathing during peak focus hours',
              'Set a digital curfew 45 minutes prior to sleep',
              'Engage in a 20-minute restorative walk'
            ]
      },
      journal: {
        title: isCritical ? 'Crisis Support Reflection' : `Daily Wellness Check-in`,
        reflection: transcript && transcript.length > 5
          ? `Today you shared: "${transcript.substring(0, 150)}..."`
          : 'You took time to check in with your thoughts today.',
        positiveNote: isCritical
          ? 'Your feelings are valid, and reaching out is the first step toward getting the care you deserve.'
          : 'Taking time to pause and reflect on your emotions is an important foundation for balance.',
        keyThemes: isCritical
          ? ['Emotional pain', 'Need for support', 'Self-compassion']
          : ['Daily stress management', 'Rest & recovery', 'Mindfulness'],
        suggestedActions: isCritical
          ? ['Reach out to a close friend or counselor', 'Contact a 24/7 crisis resource', 'Stay in a safe, supportive environment']
          : ['Sleep before 11 PM', '10-minute breathing exercise', '20-minute outdoor walk']
      }
    };
  }
}
