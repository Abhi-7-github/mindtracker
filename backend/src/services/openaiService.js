import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(filePath) {
  const file = fs.createReadStream(filePath);
  const resp = await client.audio.transcriptions.create({ file, model: 'whisper-1' });
  return resp.text ?? resp; 
}

export async function analyzeConversation(transcript) {
  const system = `You are an assistant that returns a JSON summary for mental wellness analysis. Respond ONLY with valid JSON.`;
  const prompt = `Analyze the following transcript and return JSON with keys: primaryEmotion, secondaryEmotion, stressScore (0-100), anxietyScore (0-100), burnoutScore (0-100), wellnessScore (0-100), dailyJournal, wellnessSummary, wellnessPlan, psychologistRecommendation, crisisDetection. Always include the sentence: \"This assessment is AI-generated and should not be considered medical advice.\"`;
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `${prompt}\n\nTranscript:\n${transcript}` }
  ];

  const completion = await client.chat.completions.create({
    model: 'gpt-5.1',
    messages,
    temperature: 0.2,
    max_tokens: 1200
  });

  const text = completion.choices?.[0]?.message?.content ?? completion.choices?.[0]?.text ?? '';
  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text };
  }
}
