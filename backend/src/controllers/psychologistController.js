import User from '../models/User.js';

export async function getVerifiedPsychologists(req, res, next) {
  try {
    const psychologists = await User.find({
      role: 'psychologist',
      $or: [{ isVerified: true }, { verificationStatus: 'Verified' }]
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: psychologists });
  } catch (err) {
    next(err);
  }
}

export async function addVisitingSlot(req, res, next) {
  try {
    const { dayOrDate, startTime, endTime, durationMinutes, mode } = req.body;
    
    if (!dayOrDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Day/Date, start time, and end time are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newSlot = {
      dayOrDate,
      startTime,
      endTime,
      durationMinutes: durationMinutes || 50,
      mode: mode || 'In-Person Clinic'
    };

    user.visitingSlots.push(newSlot);
    await user.save();

    res.json({
      success: true,
      message: 'Visiting slot created successfully',
      data: user.visitingSlots
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVisitingSlot(req, res, next) {
  try {
    const { slotId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.visitingSlots = user.visitingSlots.filter(s => s._id.toString() !== slotId);
    await user.save();

    res.json({
      success: true,
      message: 'Visiting slot removed successfully',
      data: user.visitingSlots
    });
  } catch (err) {
    next(err);
  }
}

export async function getVisitingSlots(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('visitingSlots isVerified verificationStatus');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        slots: user.visitingSlots,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (err) {
    next(err);
  }
}
