import User from '../models/User.js';

export async function getAllPsychologists(req, res, next) {
  try {
    const psychologists = await User.find({ role: 'psychologist' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: psychologists });
  } catch (err) {
    next(err);
  }
}

export async function verifyPsychologist(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Verified', 'Rejected', or 'Pending'

    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const isVerified = status === 'Verified';
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { verificationStatus: status, isVerified },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Psychologist not found' });
    }

    res.json({ success: true, message: `Psychologist status updated to ${status}`, data: updatedUser });
  } catch (err) {
    next(err);
  }
}
