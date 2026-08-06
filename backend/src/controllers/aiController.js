import fs from 'fs';
import path from 'path';
import { transcribeAudio, analyzeConversation } from '../services/openaiService.js';
import AISession from '../models/AISession.js';
import Journal from '../models/Journal.js';
import { nanoid } from 'nanoid';

export async function handleVoiceCheckin(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Audio file required' });
    const filePath = req.file.path;
    const transcript = await transcribeAudio(filePath);
    const analysis = await analyzeConversation(transcript);

    // create journal
    const journal = await Journal.create({ user: req.user.id, title: 'AI Journal', content: analysis.dailyJournal || '', generatedByAI: true });

    const session = await AISession.create({ user: req.user.id, transcript, analysis, journalId: journal._id, wellnessPlan: analysis.wellnessPlan });

    // cleanup uploaded file
    try { fs.unlinkSync(filePath); } catch (e) {}

    res.json({
      success: true,
      message: 'AI analysis complete',
      data: {
        sessionId: session._id,
        transcript,
        analysis,
        journalId: journal._id
      }
    });
  } catch (err) {
    next(err);
  }
}
