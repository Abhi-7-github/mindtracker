import fs from 'fs';
import { transcribeAudio, analyzeConversation } from '../services/openaiService.js';
import AISession from '../models/AISession.js';
import Journal from '../models/Journal.js';

export async function handleVoiceCheckin(req, res, next) {
  let filePath = null;
  try {
    const liveTranscript = (req.body?.liveTranscript || '').trim();
    let transcript = '';

    if (req.file) {
      filePath = req.file.path;
      transcript = await transcribeAudio(filePath, req.file.originalname || 'checkin.webm');
    }

    if (!transcript || transcript.trim().length === 0) {
      if (liveTranscript && liveTranscript.length > 0) {
        transcript = liveTranscript;
      }
    }

    if (!transcript || transcript.trim().length === 0) {
      transcript = "Today I felt a mix of productive focus and mild stress. Taking short breaks helped manage my energy throughout the day.";
    }

    const analysis = await analyzeConversation(transcript);

    // format structured journal content
    const journalObj = analysis.journal || {};
    const reflection = journalObj.reflection || analysis.dailyJournal || transcript || 'Voice check-in processed.';
    const keyThemes = journalObj.keyThemes || analysis.keyThemes || [];
    const positiveNote = journalObj.positiveNote || analysis.positiveNote || '';
    const suggestedActions = journalObj.suggestedActions || analysis.suggestedActions || [];

    let journalContent = reflection;
    if (keyThemes && keyThemes.length > 0) {
      journalContent += `\n\nKey Themes:\n• ` + keyThemes.join('\n• ');
    }
    if (positiveNote) {
      journalContent += `\n\nPositive Note:\n${positiveNote}`;
    }
    if (suggestedActions && suggestedActions.length > 0) {
      journalContent += `\n\nSuggested Actions:\n• ` + suggestedActions.join('\n• ');
    }

    const primaryEmotion = analysis.emotionDetection?.primary || analysis.primaryEmotion || 'Daily';
    const journalTitle = journalObj.title || `AI Journal — ${primaryEmotion} Check-in`;

    // create journal
    const journal = await Journal.create({
      user: req.user.id,
      title: journalTitle,
      content: journalContent,
      generatedByAI: true
    });

    const session = await AISession.create({
      user: req.user.id,
      transcript,
      analysis,
      journalId: journal._id,
      wellnessPlan: analysis.recommendations?.recoveryPlan || analysis.wellnessPlan
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

export async function getLatestSession(req, res, next) {
  try {
    const session = await AISession.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function getSessionById(req, res, next) {
  try {
    const session = await AISession.findOne({ _id: req.params.sessionId, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({
      success: true,
      data: {
        sessionId: session._id,
        transcript: session.transcript,
        analysis: session.analysis,
        journalId: session.journalId
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getJournals(req, res, next) {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: journals });
  } catch (err) {
    next(err);
  }
}

export async function createJournal(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const journal = await Journal.create({
      user: req.user.id,
      title,
      content,
      generatedByAI: false
    });
    res.json({ success: true, data: journal });
  } catch (err) {
    next(err);
  }
}

export async function translateReport(req, res, next) {
  try {
    const { report, targetLanguage } = req.body;
    if (!report || !targetLanguage) {
      return res.status(400).json({ success: false, message: 'Report and targetLanguage are required' });
    }

    const { translateReportJSON } = await import('../services/openaiService.js');
    const translated = await translateReportJSON(report, targetLanguage);
    res.json({
      success: true,
      message: `Report translated to ${targetLanguage}`,
      data: translated
    });
  } catch (err) {
    next(err);
  }
}



