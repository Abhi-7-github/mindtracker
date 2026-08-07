import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const data = await authService.registerUser(req.body);
    res.cookie('token', data.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.json({ success: true, message: 'Registered successfully', data: data.user, token: data.token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await authService.loginUser(req.body);
    res.cookie('token', data.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.json({ success: true, message: 'Logged in successfully', data: data.user, token: data.token });
  } catch (err) {
    next(err);
  }
}


export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ success: true, message: 'Success', data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    next(err);
  }
}
