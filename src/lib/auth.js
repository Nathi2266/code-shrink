const USERS_KEY = 'shortner_users';
const SESSION_KEY = 'shortner_session';
const PENDING_SIGNUP_KEY = 'shortner_pending_signup';
const RESET_TOKENS_KEY = 'shortner_reset_tokens';

const isBrowser = typeof window !== 'undefined';

const readJSON = (key, fallback) => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeItem = (key) => {
  if (!isBrowser) return;
  window.localStorage.removeItem(key);
};

const ensureUsers = () => readJSON(USERS_KEY, []);
const ensureResetTokens = () => readJSON(RESET_TOKENS_KEY, {});

const saveUsers = (users) => writeJSON(USERS_KEY, users);
const saveSession = (user) => writeJSON(SESSION_KEY, user);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const randomDigits = (length = 6) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const randomToken = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function getCurrentUser() {
  return readJSON(SESSION_KEY, null);
}

export async function loginViaEmailPassword(email, password) {
  const users = ensureUsers();
  const user = users.find(
    (entry) => entry.email === normalizeEmail(email) && entry.password === String(password || '')
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const sessionUser = { email: user.email, provider: user.provider || 'email' };
  saveSession(sessionUser);
  return sessionUser;
}

export async function loginWithProvider(provider = 'google', redirectTo = '/') {
  const sessionUser = {
    email: `demo-${provider}@shortner.local`,
    provider,
  };
  saveSession(sessionUser);
  if (isBrowser && redirectTo) {
    window.location.href = redirectTo;
  }
  return sessionUser;
}

export async function register({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Email and password are required');
  }

  const users = ensureUsers();
  if (users.some((entry) => entry.email === normalizedEmail)) {
    throw new Error('An account with this email already exists');
  }

  const otpCode = randomDigits(6);
  writeJSON(PENDING_SIGNUP_KEY, {
    email: normalizedEmail,
    password: String(password),
    otpCode,
  });

  return { otpCode };
}

export async function verifyOtp({ email, otpCode }) {
  const pending = readJSON(PENDING_SIGNUP_KEY, null);
  const normalizedEmail = normalizeEmail(email);

  if (!pending || pending.email !== normalizedEmail) {
    throw new Error('No pending registration found for this email');
  }

  if (String(otpCode || '').trim().length !== 6) {
    throw new Error('Invalid verification code');
  }

  const users = ensureUsers();
  const user = {
    email: pending.email,
    password: pending.password,
    provider: 'email',
  };

  users.push(user);
  saveUsers(users);
  removeItem(PENDING_SIGNUP_KEY);

  const sessionUser = { email: user.email, provider: user.provider };
  saveSession(sessionUser);
  return { access_token: randomToken(), user: sessionUser };
}

export async function resendOtp(email) {
  const pending = readJSON(PENDING_SIGNUP_KEY, null);
  const normalizedEmail = normalizeEmail(email);

  if (!pending || pending.email !== normalizedEmail) {
    throw new Error('No pending registration found for this email');
  }

  const otpCode = randomDigits(6);
  writeJSON(PENDING_SIGNUP_KEY, { ...pending, otpCode });
  return { otpCode };
}

export async function resetPasswordRequest(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  const users = ensureUsers();
  const userExists = users.some((entry) => entry.email === normalizedEmail);

  if (userExists) {
    const resetTokens = ensureResetTokens();
    const resetToken = randomToken();
    resetTokens[resetToken] = normalizedEmail;
    writeJSON(RESET_TOKENS_KEY, resetTokens);
  }

  return { ok: true };
}

export async function resetPassword({ resetToken, newPassword }) {
  const token = String(resetToken || '').trim();
  if (!token) {
    throw new Error('Invalid reset token');
  }

  const resetTokens = ensureResetTokens();
  const email = resetTokens[token];
  if (!email) {
    throw new Error('Invalid or expired reset token');
  }

  const users = ensureUsers();
  const userIndex = users.findIndex((entry) => entry.email === email);
  if (userIndex === -1) {
    throw new Error('User account not found');
  }

  users[userIndex] = {
    ...users[userIndex],
    password: String(newPassword || ''),
  };
  saveUsers(users);

  delete resetTokens[token];
  writeJSON(RESET_TOKENS_KEY, resetTokens);
  return { ok: true };
}

export function logout() {
  removeItem(SESSION_KEY);
}

export function redirectToLogin() {
  if (isBrowser) {
    window.location.href = '/login';
  }
}

export function setSessionFromToken(token) {
  if (!token) return;
  saveSession({ email: 'verified-user@shortner.local', provider: 'email' });
}
