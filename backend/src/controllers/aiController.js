import fs from 'fs';
import { transcribeAudio, analyzeConversation } from '../services/openaiService.js';
import AISession from '../models/AISession.js';
import Journal from '../models/Journal.js';

export async function handleVoiceCheckin(req, res, next) {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Audio file required' });
    filePath = req.file.path;

    const transcript = await transcribeAudio(filePath);
    const analysis = await analyzeConversation(transcript);

    // create journal
    const journal = await Journal.create({
      user: req.user.id,
      title: 'AI Journal — Voice Check-in',
      content: analysis.dailyJournal || transcript || 'Voice check-in processed.',
      generatedByAI: true
    });

    const session = await AISession.create({
      user: req.user.id,
      transcript,
      analysis,
      journalId: journal._id,
      wellnessPlan: analysis.wellnessPlan
    });

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
    console.error('[Voice Check-in Controller Error]:', err);
    next(err);
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}
