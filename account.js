const STORAGE_KEYS = {
    THEME: 'nexus-theme',
    ACCENT: 'nexus-accent',
    BORDER_RADIUS: 'nexus-borderRadius',
    OPACITY: 'nexus-opacity',
    LAYOUT: 'nexus-layout',
    CURRENT_PROFILE: 'nexus-currentProfile',
    PROFILES: 'nexus-profiles',
    THEME_STUDIO: 'nexus-themeStudio',
    BUTTON_SOUNDS_ENABLED: 'nexus-buttonSoundsEnabled',
    BUTTON_SOUND_TYPE: 'nexus-buttonSoundType',
    BUTTON_SOUND_VOLUME: 'nexus-buttonSoundVolume',
    SWITCH_SOUNDS_ENABLED: 'nexus-switchSoundsEnabled',
    SWITCH_SOUND_TYPE: 'nexus-switchSoundType',
    SWITCH_SOUND_VOLUME: 'nexus-switchSoundVolume'
};

const AUTH_STORAGE_KEYS = {
    USERS: 'nexus-auth-users',
    CURRENT_USER: 'nexus-auth-current-user'
};

const DEFAULT_THEME_STUDIO = {
    bootSize: 2100,
    bootAlphaPct: 16,
    mainBgColor: '#0d0d0d',
    cardBgColor: '#1a1a1a',
    sidebarBgColor: '#1a1a1a',
    headerBgColor: '#111111',
    buttonBgColor: '#00d9ff'
};

let authBusy = false;
let authProgressRunId = 0;

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeBackButton();
    initializeAuthForms();
    initializeAccountManagement();
    applyAndRenderNexusUiState();
    renderCurrentSession();
    runInitialLoader();

    window.addEventListener('storage', (event) => {
        const watchedKeys = new Set([
            STORAGE_KEYS.THEME,
            STORAGE_KEYS.ACCENT,
            STORAGE_KEYS.BORDER_RADIUS,
            STORAGE_KEYS.OPACITY,
            STORAGE_KEYS.LAYOUT,
            STORAGE_KEYS.THEME_STUDIO,
            STORAGE_KEYS.CURRENT_PROFILE,
            STORAGE_KEYS.PROFILES,
            AUTH_STORAGE_KEYS.USERS,
            AUTH_STORAGE_KEYS.CURRENT_USER
        ]);
        if (watchedKeys.has(event.key)) {
            applyAndRenderNexusUiState();
            renderCurrentSession();
        }
    });
});

function initializeTabs() {
    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (authBusy) return;
            const tab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === `tab-${tab}`);
            });
        });
    });
}

function initializeBackButton() {
    const backBtn = document.getElementById('backToNexusBtn');
    if (!backBtn) return;
    backBtn.addEventListener('click', () => {
        window.location.href = 'nexus.html';
    });
}

function initializeAuthForms() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');

    if (signInForm) {
        signInForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (authBusy) return;
            await handleSignIn();
        });
    }
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (authBusy) return;
            await handleSignUp();
        });
    }
}

function initializeAccountManagement() {
    const manageForm = document.getElementById('manageAccountForm');
    if (manageForm) {
        manageForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (authBusy) return;
            await handleManageAccountSave();
        });
    }
    renderManageAccountSection();
}

async function handleSignIn() {
    const emailField = document.getElementById('signInEmail');
    const passwordField = document.getElementById('signInPassword');
    const email = normalizeEmail(emailField ? emailField.value : '');
    const password = String(passwordField ? passwordField.value : '');

    if (!email || !password) {
        setStatus('Please enter your email and password.', false);
        return;
    }

    setAuthBusy(true);
    const progressToken = ++authProgressRunId;
    const progressFill = document.getElementById('authProgressFill');
    if (progressFill) progressFill.style.width = '0%';

    try {
        await runAuthProgressSequence(progressToken, [
            { text: 'Checking local account database...', target: 28 },
            { text: 'Verifying credentials...', target: 64 },
            { text: 'Preparing account session...', target: 88 }
        ]);

        const users = getStoredUsers();
        const user = users.find(entry => normalizeEmail(entry.email) === email && String(entry.password || '') === password);

        if (!user) {
            await runAuthProgressSequence(progressToken, [{ text: 'Sign in failed.', target: 100 }], 220);
            setStatus('Invalid email or password.', false);
            return;
        }

        const session = buildSessionUser(user);
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));

        await runAuthProgressSequence(progressToken, [{ text: 'Success. Redirecting to Nexus...', target: 100 }], 300);
        setStatus(`Welcome back, ${session.username || 'User'}!`, true);
        renderCurrentSession();
        setTimeout(() => {
            window.location.href = 'nexus.html';
        }, 420);
    } finally {
        setAuthBusy(false);
    }
}

async function handleSignUp() {
    const usernameField = document.getElementById('signUpUsername');
    const emailField = document.getElementById('signUpEmail');
    const passwordField = document.getElementById('signUpPassword');
    const confirmField = document.getElementById('signUpPasswordConfirm');
    const avatarField = document.getElementById('signUpAvatar');

    const username = String(usernameField ? usernameField.value : '').trim();
    const email = normalizeEmail(emailField ? emailField.value : '');
    const password = String(passwordField ? passwordField.value : '');
    const confirm = String(confirmField ? confirmField.value : '');
    const avatar = String(avatarField ? avatarField.value : '').trim();

    if (!username || !email || !password || !confirm) {
        setStatus('Fill in all required sign-up fields.', false);
        return;
    }
    if (password !== confirm) {
        setStatus('Passwords do not match.', false);
        return;
    }
    if (password.length < 4) {
        setStatus('Password must be at least 4 characters.', false);
        return;
    }

    setAuthBusy(true);
    const progressToken = ++authProgressRunId;
    const progressFill = document.getElementById('authProgressFill');
    if (progressFill) progressFill.style.width = '0%';

    try {
        await runAuthProgressSequence(progressToken, [
            { text: 'Validating account fields...', target: 24 },
            { text: 'Checking duplicate users...', target: 50 }
        ]);

        const users = getStoredUsers();
        const duplicateEmail = users.some(entry => normalizeEmail(entry.email) === email);
        if (duplicateEmail) {
            await runAuthProgressSequence(progressToken, [{ text: 'Sign up failed.', target: 100 }], 220);
            setStatus('An account with this email already exists.', false);
            return;
        }

        await runAuthProgressSequence(progressToken, [
            { text: 'Creating local user record...', target: 80 },
            { text: 'Activating account session...', target: 95 }
        ]);

        const nowIso = new Date().toISOString();
        const user = {
            id: `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
            username,
            email,
            password,
            avatar,
            createdAt: nowIso,
            updatedAt: nowIso
        };

        users.push(user);
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));

        const session = buildSessionUser(user);
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));

        await runAuthProgressSequence(progressToken, [{ text: 'Account created. Redirecting...', target: 100 }], 280);
        setStatus(`Account created for ${username}.`, true);
        renderCurrentSession();
        setTimeout(() => {
            window.location.href = 'nexus.html';
        }, 420);
    } finally {
        setAuthBusy(false);
    }
}

function buildSessionUser(user) {
    const nowIso = new Date().toISOString();
    return {
        id: String(user.id || ''),
        username: String(user.username || '').trim(),
        email: normalizeEmail(user.email || ''),
        avatar: String(user.avatar || '').trim(),
        lastLoginAt: nowIso
    };
}

function renderCurrentSession() {
    const box = document.getElementById('currentSessionBox');
    if (!box) return;
    const user = getCurrentUserSession();
    if (!user) {
        box.innerHTML = [
            '<div class="session-head">Current Session</div>',
            '<div class="session-email">No active account session.</div>'
        ].join('');
        renderManageAccountSection();
        return;
    }

    const safeName = escapeHtml(user.username || 'ACCOUNT');
    const safeEmail = escapeHtml(user.email || '');
    box.innerHTML = [
        '<div class="session-head">Current Session</div>',
        `<div class="session-name">${safeName}</div>`,
        `<div class="session-email">${safeEmail}</div>`,
        '<div class="session-actions">',
        '  <button type="button" class="session-btn primary" id="sessionUseBtn">OPEN NEXUS</button>',
        '  <button type="button" class="session-btn" id="sessionSignOutBtn">SIGN OUT</button>',
        '</div>'
    ].join('');

    const openBtn = document.getElementById('sessionUseBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            window.location.href = 'nexus.html';
        });
    }
    const signOutBtn = document.getElementById('sessionSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
            setStatus('Signed out from account session.', true);
            renderCurrentSession();
        });
    }

    renderManageAccountSection();
}

function renderManageAccountSection() {
    const section = document.getElementById('accountManageSection');
    const session = getCurrentUserSession();
    if (!section) return;

    if (!session) {
        section.hidden = true;
        return;
    }

    section.hidden = false;
    const users = getStoredUsers();
    const match = findStoredUserForSession(session, users);
    const source = match ? match.user : session;

    setInputValue('manageUsername', source.username || '');
    setInputValue('manageEmail', source.email || '');
    setInputValue('manageAvatar', source.avatar || '');
    setInputValue('manageCurrentPassword', '');
    setInputValue('manageNewPassword', '');
    setInputValue('manageConfirmPassword', '');
}

async function handleManageAccountSave() {
    const session = getCurrentUserSession();
    if (!session) {
        setStatus('Sign in first to edit account details.', false);
        return;
    }

    const username = String(getInputValue('manageUsername')).trim();
    const email = normalizeEmail(getInputValue('manageEmail'));
    const avatar = String(getInputValue('manageAvatar')).trim();
    const currentPassword = String(getInputValue('manageCurrentPassword'));
    const newPassword = String(getInputValue('manageNewPassword'));
    const confirmPassword = String(getInputValue('manageConfirmPassword'));

    if (!username || !email) {
        setStatus('Username and email are required.', false);
        return;
    }

    const users = getStoredUsers();
    const match = findStoredUserForSession(session, users);
    if (!match) {
        setStatus('Could not find this account in local storage.', false);
        return;
    }

    const duplicate = users.find((entry, idx) => idx !== match.index && normalizeEmail(entry.email) === email);
    if (duplicate) {
        setStatus('That email is already used by another account.', false);
        return;
    }

    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
        const storedPassword = String(match.user.password || '');
        if (!currentPassword) {
            setStatus('Enter current password to change password.', false);
            return;
        }
        if (currentPassword !== storedPassword) {
            setStatus('Current password is incorrect.', false);
            return;
        }
        if (!newPassword || newPassword.length < 4) {
            setStatus('New password must be at least 4 characters.', false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setStatus('New password confirmation does not match.', false);
            return;
        }
    }

    setAuthBusy(true);
    const progressToken = ++authProgressRunId;
    const progressFill = document.getElementById('authProgressFill');
    if (progressFill) progressFill.style.width = '0%';

    try {
        await runAuthProgressSequence(progressToken, [
            { text: 'Validating account changes...', target: 35 },
            { text: 'Saving local account data...', target: 78 }
        ], 110);

        const nowIso = new Date().toISOString();
        const updatedUser = {
            ...match.user,
            username,
            email,
            avatar,
            updatedAt: nowIso
        };
        if (wantsPasswordChange) {
            updatedUser.password = newPassword;
        }

        users[match.index] = updatedUser;
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(buildSessionUser(updatedUser)));

        await runAuthProgressSequence(progressToken, [{ text: 'Account updated successfully.', target: 100 }], 140);
        setStatus('Account changes saved.', true);
        renderCurrentSession();
    } finally {
        setAuthBusy(false);
    }
}

function findStoredUserForSession(session, users) {
    const list = Array.isArray(users) ? users : [];
    const sessionId = String(session && session.id ? session.id : '').trim();
    const sessionEmail = normalizeEmail(session && session.email ? session.email : '');

    let index = -1;
    if (sessionId) {
        index = list.findIndex(entry => String(entry && entry.id ? entry.id : '').trim() === sessionId);
    }
    if (index < 0 && sessionEmail) {
        index = list.findIndex(entry => normalizeEmail(entry && entry.email ? entry.email : '') === sessionEmail);
    }
    if (index < 0) return null;
    return { index, user: list[index] };
}

function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value : '';
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = String(value ?? '');
}

function applyAndRenderNexusUiState() {
    const uiState = getEffectiveNexusUiState();
    applyUiStateToCss(uiState);
    renderNexusSettingsSummary(uiState);
}

function getEffectiveNexusUiState() {
    const currentProfile = String(localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default').trim() || 'Default';
    const profilesData = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.PROFILES), {});
    const profileData = profilesData && typeof profilesData === 'object' ? profilesData[currentProfile] : null;

    const theme = String((profileData && profileData.theme) || localStorage.getItem(STORAGE_KEYS.THEME) || 'dark').toLowerCase() === 'light'
        ? 'light'
        : 'dark';
    const accent = normalizeHexColor(
        (profileData && profileData.accent) || localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff',
        '#00d9ff'
    );
    const borderRadius = clampNumber(
        (profileData && profileData.borderRadius) || localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS),
        0,
        20,
        8
    );
    const opacity = clampNumber(
        (profileData && profileData.opacity) || localStorage.getItem(STORAGE_KEYS.OPACITY),
        50,
        100,
        100
    );
    const layout = (profileData && profileData.layout) || localStorage.getItem(STORAGE_KEYS.LAYOUT) || 'grid';
    const themeStudioSource = (profileData && profileData.themeStudio)
        || safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.THEME_STUDIO), {});
    const themeStudio = normalizeThemeStudio(themeStudioSource);

    const buttonSoundsEnabled = resolveBool(
        profileData ? profileData.buttonSoundsEnabled : null,
        resolveBool(localStorage.getItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED), false)
    );
    const switchSoundsEnabled = resolveBool(
        profileData ? profileData.switchSoundsEnabled : null,
        resolveBool(localStorage.getItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED), false)
    );
    const buttonSoundType = String((profileData && profileData.buttonSoundType) || localStorage.getItem(STORAGE_KEYS.BUTTON_SOUND_TYPE) || 'nexus-soft');
    const switchSoundType = String((profileData && profileData.switchSoundType) || localStorage.getItem(STORAGE_KEYS.SWITCH_SOUND_TYPE) || 'clean-toggle');
    const buttonSoundVolume = clampNumber(
        (profileData && profileData.buttonSoundVolume) || localStorage.getItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME),
        0,
        100,
        65
    );
    const switchSoundVolume = clampNumber(
        (profileData && profileData.switchSoundVolume) || localStorage.getItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME),
        0,
        100,
        70
    );

    return {
        profile: currentProfile,
        theme,
        accent,
        borderRadius,
        opacity,
        layout,
        themeStudio,
        buttonSoundsEnabled,
        buttonSoundType,
        buttonSoundVolume,
        switchSoundsEnabled,
        switchSoundType,
        switchSoundVolume
    };
}

function applyUiStateToCss(uiState) {
    const root = document.documentElement;
    root.style.setProperty('--accent', uiState.accent);
    root.style.setProperty('--accent-rgb', hexToRgbCsv(uiState.accent));
    root.style.setProperty('--border-radius', `${uiState.borderRadius}px`);
    root.style.setProperty('--ui-opacity', String(uiState.opacity / 100));
    root.style.setProperty('--theme-studio-main-bg', uiState.themeStudio.mainBgColor);
    root.style.setProperty('--theme-studio-card-bg', uiState.themeStudio.cardBgColor);
    root.style.setProperty('--boot-orb-size', `${uiState.themeStudio.bootSize}px`);
    root.style.setProperty('--boot-orb-alpha', String(uiState.themeStudio.bootAlphaPct / 100));
    document.documentElement.classList.toggle('light-theme', uiState.theme === 'light');
}

function renderNexusSettingsSummary(uiState) {
    const summaryEl = document.getElementById('nexusSettingsSummary');
    if (!summaryEl) return;

    const lines = [
        `Profile: ${uiState.profile}`,
        `Theme: ${uiState.theme.toUpperCase()} | Layout: ${String(uiState.layout).toUpperCase()}`,
        `Accent: ${uiState.accent} | Radius: ${uiState.borderRadius}px | Opacity: ${uiState.opacity}%`,
        `Button Sounds: ${uiState.buttonSoundsEnabled ? 'ON' : 'OFF'} (${uiState.buttonSoundType}, ${uiState.buttonSoundVolume}%)`,
        `Switch Sounds: ${uiState.switchSoundsEnabled ? 'ON' : 'OFF'} (${uiState.switchSoundType}, ${uiState.switchSoundVolume}%)`
    ];
    summaryEl.innerHTML = lines.map(line => escapeHtml(line)).join('<br>');
}

async function runInitialLoader() {
    const loader = document.getElementById('accountLoader');
    const fill = document.getElementById('accountLoaderFill');
    const subtitle = document.getElementById('accountLoaderSubtitle');
    if (!loader || !fill) return;

    loader.classList.add('boot-intro');
    fill.style.width = '0%';

    await setProgress(fill, 18, 260);
    if (subtitle) subtitle.textContent = 'Syncing active Nexus profile...';
    await setProgress(fill, 47, 380);
    if (subtitle) subtitle.textContent = 'Applying UI theme and effects...';
    await setProgress(fill, 74, 360);
    if (subtitle) subtitle.textContent = 'Preparing account controls...';
    await setProgress(fill, 100, 380);
    await sleep(180);

    loader.classList.add('hidden');
    setTimeout(() => {
        loader.style.display = 'none';
        loader.setAttribute('aria-hidden', 'true');
    }, 380);
}

async function runAuthProgressSequence(progressToken, steps, holdMs = 140) {
    const progressWrap = document.getElementById('authProgress');
    const progressFill = document.getElementById('authProgressFill');
    const progressLabel = document.getElementById('authProgressLabel');
    if (!progressWrap || !progressFill || !progressLabel) return;
    progressWrap.hidden = false;

    for (const step of steps) {
        if (progressToken !== authProgressRunId) return;
        progressLabel.textContent = String(step.text || 'Processing...');
        await setProgress(progressFill, clampNumber(step.target, 0, 100, 0), step.duration || 280);
        if (holdMs > 0) await sleep(holdMs);
    }
}

function setAuthBusy(nextBusy) {
    authBusy = Boolean(nextBusy);
    const controls = document.querySelectorAll('input, button');
    controls.forEach(control => {
        if (control.id === 'backToNexusBtn') return;
        control.disabled = authBusy;
    });
}

function setStatus(message, ok) {
    const statusEl = document.getElementById('accountStatus');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('ok', 'error');
    statusEl.classList.add(ok ? 'ok' : 'error');
}

function getStoredUsers() {
    const parsed = safeParseStoredJson(localStorage.getItem(AUTH_STORAGE_KEYS.USERS), []);
    return Array.isArray(parsed) ? parsed : [];
}

function getCurrentUserSession() {
    const parsed = safeParseStoredJson(localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER), null);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
}

function normalizeThemeStudio(source) {
    const safe = source && typeof source === 'object' ? source : {};
    return {
        bootSize: clampNumber(safe.bootSize, 1200, 4200, DEFAULT_THEME_STUDIO.bootSize),
        bootAlphaPct: clampNumber(safe.bootAlphaPct, 0, 45, DEFAULT_THEME_STUDIO.bootAlphaPct),
        mainBgColor: normalizeHexColor(safe.mainBgColor, DEFAULT_THEME_STUDIO.mainBgColor),
        cardBgColor: normalizeHexColor(safe.cardBgColor, DEFAULT_THEME_STUDIO.cardBgColor),
        sidebarBgColor: normalizeHexColor(safe.sidebarBgColor, DEFAULT_THEME_STUDIO.sidebarBgColor),
        headerBgColor: normalizeHexColor(safe.headerBgColor, DEFAULT_THEME_STUDIO.headerBgColor),
        buttonBgColor: normalizeHexColor(safe.buttonBgColor, DEFAULT_THEME_STUDIO.buttonBgColor)
    };
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function resolveBool(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
    }
    return Boolean(fallback);
}

function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

function normalizeHexColor(value, fallback) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
        const chars = raw.slice(1).split('');
        return `#${chars.map(ch => ch + ch).join('')}`.toLowerCase();
    }
    return fallback;
}

function hexToRgbCsv(hexColor) {
    const hex = normalizeHexColor(hexColor, '#00d9ff').replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

function safeParseStoredJson(raw, fallback) {
    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch (error) {
        return fallback;
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setProgress(element, targetPercent, durationMs = 260) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }
        const currentRaw = String(element.style.width || '').replace('%', '').trim();
        const start = Number.isFinite(Number(currentRaw)) ? Number(currentRaw) : 0;
        const target = clampNumber(targetPercent, 0, 100, 0);
        const duration = Math.max(1, Number(durationMs) || 1);
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - t, 2);
            const value = start + (target - start) * eased;
            element.style.width = `${value.toFixed(2)}%`;
            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                element.style.width = `${target}%`;
                resolve();
            }
        };

        requestAnimationFrame(tick);
    });
}
