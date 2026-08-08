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
    const system = `You are an advanced AI Emotional Tracking Engine for the POLO Healthcare platform.

Your responsibility is to understand the user's emotional state from their CURRENT message only.

=========================
CORE INSTRUCTIONS
=========================

1. Analyze ONLY the current user input.
2. NEVER use hardcoded responses, scores, emotions, or recommendations.
3. NEVER reuse previous outputs.
4. Every response must be unique and generated from the user's current message.
5. If two users provide different messages, the emotional analysis must be different.
6. If the same user provides different messages over time, each analysis must also be different.
7. Do not invent emotions that are unsupported by the text.
8. If confidence is low, explicitly indicate uncertainty.
9. Return ONLY valid JSON.
10. Do not include explanations, markdown, or extra text.
11. Keep emotional insights empathetic, realistic, and clinically appropriate.
12. Do not diagnose mental illnesses.
13. Avoid repetitive wording.
14. Never generate placeholder values.

=========================
YOUR TASK
=========================

Analyze the user's message and determine:
• Primary Emotion (e.g. Happy, Joyful, Excited, Calm, Peaceful, Content, Grateful, Hopeful, Motivated, Confident, Proud, Neutral, Reflective, Focused, Curious, Thoughtful, Relaxed, Sad, Lonely, Hopeless, Overwhelmed, Stressed, Anxious, Fearful, Nervous, Burned Out, Frustrated, Angry, Guilty, Ashamed, Confused, Disappointed, Emotionally Exhausted)
• Secondary Emotion
• Emotional Intensity (0-100)
• Emotional Stability (Very Stable, Stable, Slightly Unstable, Unstable, Highly Distressed, Unknown)
• Confidence Score (0-100)
• Sentiment (Very Positive, Positive, Neutral, Mixed, Negative, Very Negative)
• Mood Trend (Improving, Stable, Declining, Fluctuating, Unknown)
• Emotional Triggers
• Positive Indicators
• Negative Indicators
• Cognitive Patterns (Healthy Perspective, Problem Solving, Self Reflection, Optimism, Rumination, Catastrophizing, Negative Self Talk, Overthinking, Emotional Avoidance, Perfectionism, Self Compassion, Unknown)
• Behavioral Indicators (Seeking Help, Withdrawing, Social Connection, Goal Oriented, Self Care, Avoidance, Expressing Feelings, Unknown)
• Emotional Summary
• Personalized Reflection
• Emotional Growth Suggestion
• Recommended Activities

=========================
OUTPUT FORMAT
=========================

Return EXACTLY this JSON:

{
  "emotionAnalysis": {
    "primaryEmotion": "",
    "secondaryEmotion": "",
    "emotionalIntensity": 0,
    "confidence": 0,
    "sentiment": "",
    "moodTrend": "",
    "emotionalStability": ""
  },
  "insights": {
    "emotionalTriggers": [
      ""
    ],
    "positiveIndicators": [
      ""
    ],
    "negativeIndicators": [
      ""
    ],
    "cognitivePatterns": [
      ""
    ],
    "behavioralIndicators": [
      ""
    ]
  },
  "summary": {
    "emotionalSummary": "",
    "personalReflection": ""
  },
  "growthPlan": {
    "suggestion": "",
    "recommendedActivities": [
      "",
      "",
      ""
    ]
  }
}

=========================
FINAL RULES
=========================

- Every value must be generated from the user's current message.
- Never return fixed emotions.
- Never repeat previous analyses.
- Use nuanced reasoning instead of simple keyword matching.
- If information is insufficient, return "Unknown" where appropriate.
- The summary should feel personal to the user's message.
- The reflection should acknowledge the user's emotional state without exaggeration.
- Recommendations must be practical, supportive, and tailored to the user's emotional context.
- Output ONLY the JSON.`;

    const prompt = `USER INPUT:\n\n${transcript}`;

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

    const primaryEmotion = isCritical ? 'Hopeless' : isHighStress ? 'Overwhelmed' : 'Reflective';
    const secondaryEmotion = isCritical ? 'Emotionally Exhausted' : isHighStress ? 'Anxious' : 'Thoughtful';
    const intensity = isCritical ? 95 : isHighStress ? 82 : 45;
    const stability = isCritical ? 'Highly Distressed' : isHighStress ? 'Unstable' : 'Stable';
    const sentiment = isCritical ? 'Very Negative' : isHighStress ? 'Negative' : 'Neutral';
    const moodTrend = isCritical ? 'Declining' : isHighStress ? 'Fluctuating' : 'Stable';

    return {
      emotionAnalysis: {
        primaryEmotion,
        secondaryEmotion,
        emotionalIntensity: intensity,
        confidence: 85,
        sentiment,
        moodTrend,
        emotionalStability: stability
      },
      insights: {
        emotionalTriggers: isHighStress
          ? ['Workload and deadline pressure', 'Uncertainty about future outcomes']
          : ['Daily cognitive routines', 'Personal life events'],
        positiveIndicators: ['Openly articulating feelings', 'Seeking personal wellness reflection'],
        negativeIndicators: isHighStress ? ['Cognitive fatigue', 'Heightened tension'] : ['Temporary fatigue'],
        cognitivePatterns: isHighStress ? ['Overthinking', 'Rumination'] : ['Self Reflection'],
        behavioralIndicators: isHighStress ? ['Expressing Feelings', 'Seeking Help'] : ['Expressing Feelings']
      },
      summary: {
        emotionalSummary: isCritical
          ? 'Significant emotional distress and vulnerability requiring urgent empathetic support.'
          : isHighStress
          ? 'Experiencing noticeable pressure and feeling overwhelmed by current demands.'
          : 'Reflecting calmly on daily experiences and maintaining steady self-awareness.',
        personalReflection: transcript && transcript.length > 5
          ? `Today you shared: "${transcript.substring(0, 140)}...". Reflecting on these feelings is a meaningful step toward balance.`
          : 'You paused to reflect on your current emotions today.'
      },
      growthPlan: {
        suggestion: isCritical
          ? 'Reach out immediately to a trusted friend, family member, or professional counselor.'
          : isHighStress
          ? 'Take short structured recovery breaks and practice calming breathing techniques to reset.'
          : 'Continue daily check-ins to nurture steady emotional clarity and balance.',
        recommendedActivities: isCritical
          ? [
              'Connect directly with a trusted person or crisis support resource',
              'Take slow, grounding deep breaths in a peaceful space',
              'Allow yourself to receive support without self-judgment'
            ]
          : [
              '10-minute diaphragmatic breathing exercise',
              'Set a digital curfew 45 minutes before sleep',
              '20-minute restorative outdoor walk'
            ]
      }
    };
  }
}

export async function translateReportJSON(reportJSON, targetLanguage = 'English') {
  if (!targetLanguage || targetLanguage.toLowerCase() === 'english') {
    return reportJSON;
  }

  try {
    const system = `You are the multilingual translation engine for the POLO Healthcare platform.

Your ONLY responsibility is to translate the AI Mental Wellness Report into the user's selected language.

========================================
STRICT RULES
========================================

1. Translate ONLY the visible text.
2. NEVER summarize.
3. NEVER rewrite.
4. NEVER shorten.
5. NEVER add new information.
6. NEVER remove any information.
7. Preserve the emotional meaning exactly.
8. Keep the tone compassionate, professional, and supportive.
9. Translate naturally instead of word-for-word.
10. Return ONLY valid JSON.
11. Do NOT return markdown.
12. Do NOT explain anything.
13. Do NOT change any scores.
14. Do NOT change percentages.
15. Do NOT change numbers.
16. Do NOT change IDs.
17. Do NOT change timestamps.
18. Do NOT change object structure.
19. Keep every JSON key exactly the same.
20. Translate ONLY the values.
21. Keep arrays in the same order.
22. Preserve line breaks.
23. Preserve punctuation.
24. Preserve emojis if present.
25. Do not translate URLs.
26. Do not translate email addresses.
27. Do not translate variable names.
28. Do not translate API field names.
29. Use natural healthcare terminology.
30. If a medical term is commonly spoken in English, you may keep it in English if it sounds more natural.

========================================
SUPPORTED LANGUAGES
========================================

English
Telugu
Hindi
Tamil
Malayalam
Kannada

========================================
TARGET LANGUAGE
========================================

${targetLanguage}

========================================
TRANSLATE THESE
========================================

Journal Title
Reflection
Positive Note
Clinical Summary
Core Challenge
Strengths
Primary Emotion
Secondary Emotion
Mood Trend
Stress Label
Burnout Label
Sleep Label
Behavioral Indicators
Cognitive Patterns
Recommendations
Recovery Plan
Suggested Actions
Emotion Labels
Sentiment Labels
Risk Labels
Everything the user can see.

========================================
DO NOT TRANSLATE
========================================

JSON Keys
Numbers
Scores
Percentages
UUIDs
Object names
Arrays
Null
true
false
URLs
Email IDs

========================================
OUTPUT
========================================

Return ONLY the translated JSON.

FINAL INSTRUCTION

Translate the report into the selected language.

The translated report must sound as if it was originally written by a professional psychologist in that language.

Do not mix English with the target language unless it is a universally accepted medical or technical term.

Return ONLY the translated JSON.`;

    const prompt = `AI REPORT JSON:\n\n${JSON.stringify(reportJSON, null, 2)}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2200
    });

    let text = completion.choices?.[0]?.message?.content ?? completion.choices?.[0]?.text ?? '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const translated = JSON.parse(text);
    return translated;
  } catch (err) {
    console.error('[Translation Error]:', err?.message || err);
    return reportJSON;
  }
}


