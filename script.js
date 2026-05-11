// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    THEME: 'nexus-theme',
    ACCENT: 'nexus-accent',
    BORDER_RADIUS: 'nexus-borderRadius',
    OPACITY: 'nexus-opacity',
    FEATURES: 'nexus-features',
    LAYOUT: 'nexus-layout',
    PROFILES: 'nexus-profiles',
    CURRENT_PROFILE: 'nexus-currentProfile',
    BUTTON_SOUNDS_ENABLED: 'nexus-buttonSoundsEnabled',
    BUTTON_SOUND_TYPE: 'nexus-buttonSoundType',
    BUTTON_SOUND_VOLUME: 'nexus-buttonSoundVolume',
    SWITCH_SOUNDS_ENABLED: 'nexus-switchSoundsEnabled',
    SWITCH_SOUND_TYPE: 'nexus-switchSoundType',
    SWITCH_SOUND_VOLUME: 'nexus-switchSoundVolume',
    KEYBINDS: 'nexus-keybinds',
    MACROS: 'nexus-macros',
    MACRO_COLLAPSE_STATE: 'nexus-macroCollapseState',
    AUTOMATIONS: 'nexus-automations',
    AUTOMATION_COLLAPSE_STATE: 'nexus-automationCollapseState',
    KEYBIND_MODES: 'nexus-keybindModes',
    KEYBIND_PROFILE_TARGETS: 'nexus-keybindProfileTargets',
    CUSTOM_PRESETS: 'nexus-customPresets',
    FAVORITE_PROFILES: 'nexus-favoriteProfiles',
    FAVORITE_PRESETS: 'nexus-favoritePresets',
    PERFORMANCE_MODE: 'nexus-performanceMode',
    LOCK_UI_MODE: 'nexus-lockUiMode',
    FOCUS_MODE: 'nexus-focusMode',
    SAFETY_LOCK_MODE: 'nexus-safetyLockMode',
    SAFETY_LOCK_HOLD_MS: 'nexus-safetyLockHoldMs',
    STARTUP_PAGE: 'nexus-startupPage',
    BOOT_POWER_CONFIRM: 'nexus-bootPowerConfirm',
    WELCOME_SPLASH: 'nexus-welcomeSplash',
    GRADIENT_ACCENT_ENABLED: 'nexus-gradientAccentEnabled',
    GRADIENT_ACCENT_2: 'nexus-gradientAccent2',
    BG_PATTERN: 'nexus-bgPattern',
    SIDEBAR_ICONS: 'nexus-sidebarIcons',
    LAST_PAGE: 'nexus-lastPage',
    MINI_HUD_VISIBLE: 'nexus-miniHudVisible',
    MINI_HUD_MINIMIZED: 'nexus-miniHudMinimized',
    MINI_HUD_POSITION: 'nexus-miniHudPosition',
    DEBUG_PANEL_POSITION: 'nexus-debugPanelPosition',
    DEBUG_REFRESH_RATE: 'nexus-debugRefreshRate',
    DEBUG_COMPACT_MODE: 'nexus-debugCompactMode',
    DEBUG_AUTO_SCROLL: 'nexus-debugAutoScroll',
    PLUGINS: 'nexus-plugins',
    WORKSPACE_SYNC_LAST: 'nexus-workspaceSyncLast',
    WORKSPACE_SYNC_BACKUP: 'nexus-workspaceSyncBackup',
    PROFILE_ROLES: 'nexus-profileRoles',
    ROLE_DEFINITIONS: 'nexus-roleDefinitions',
    AUTO_SAVE_ENABLED: 'nexus-autoSaveEnabled',
    AUTO_SAVE_INTERVAL_MS: 'nexus-autoSaveIntervalMs',
    LAST_AUTO_SAVE: 'nexus-lastAutoSave',
    LAST_CRASH_REPORT: 'nexus-lastCrashReport',
    SESSION_ACTIVE: 'nexus-sessionActive',
    THEME_STUDIO: 'nexus-themeStudio'
};

const CUSTOM_SELECT_INPUT_SELECTOR = 'select.combo-box, select.setting-select';
const CUSTOM_COLOR_INPUT_SELECTOR = '#accentColor';
const LEGACY_COLOR_INPUT_SELECTOR = 'input[type="color"].color-picker, input[type="color"].color-input';
const CUSTOM_NUMBER_INPUT_SELECTOR = 'input[type="number"]';
const NUMBER_CHROME_HOST_CLASS_NAMES = new Set([
    'macro-loop-input',
    'macro-step-delay-input',
    'automation-value-input',
    'automation-cooldown-input'
]);
const customSelectChromeControllers = new Map();
const customColorChromeControllers = new Map();
const customNumberChromeControllers = new Map();
let customInputChromeObserver = null;
let customInputChromeDismissHandlersBound = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupCrashLifecycle();
    initializeTheme();
    initializeNavigation();
    initializeHeaderAccount();
    initializeAboutPages();
    setupLogoReloadButton();
    initializeSettings();
    initializeThemeStudio();
    initializeCustomInputChrome();
    initializeMacros();
    initializeAutomations();
    initializeWorkflowAndCustomPages();
    initializeKeybinds();
    initializeLayoutToggle();
    initializeProfiles();
    loadSettings();
    syncSettingsControls();
    initializeProfileUnsavedIndicator();
    applyStartupPageSelection();
    initializeEnhancements();
    setupButtonClickSounds();
    setupFeatureSwitchSounds();
    initializeSessionTimer();
    setupMiniHud();
    initializeHackDemo();
    initializeDebugDashboard();
    setupFeatureStatusChips();
    setupSafetyLockGuard();
    setupMultiSelectMode();
    setupRadialMenu();
    initializeAutoSaveSystem();
    startBootSequence();
    initializeKonamiCode();
});

const AUTH_STORAGE_KEYS = {
    USERS: 'nexus-auth-users',
    CURRENT_USER: 'nexus-auth-current-user'
};

function setupLogoReloadButton() {
    const logoButton = document.getElementById('appIconReload');
    if (!logoButton) return;
    logoButton.addEventListener('click', () => {
        window.location.reload();
    });
}

function initializeHeaderAccount() {
    const accountBtn = document.getElementById('headerAccountBtn');
    const accountLabel = document.getElementById('headerAccountLabel');
    const accountAvatar = document.getElementById('headerAccountAvatar');
    if (!accountBtn || !accountLabel || !accountAvatar) return;
    let avatarRenderToken = 0;

    const clearAvatar = () => {
        accountAvatar.classList.remove('has-image');
        accountAvatar.style.backgroundImage = '';
    };

    const applyAvatarFromSource = async (avatarSource) => {
        const requestToken = ++avatarRenderToken;
        const resolvedUrl = await resolveAvatarImageUrl(avatarSource);
        if (requestToken !== avatarRenderToken) return;
        if (!resolvedUrl) {
            clearAvatar();
            return;
        }
        accountAvatar.classList.add('has-image');
        accountAvatar.style.backgroundImage = `url("${resolvedUrl.replace(/"/g, '%22')}")`;
    };

    const applyAccountHeaderState = async () => {
        const currentUser = getCurrentAuthUser();
        if (!currentUser) {
            accountLabel.textContent = 'SIGN IN / SIGN UP';
            accountBtn.classList.remove('is-signed-in');
            clearAvatar();
            return;
        }
        const displayName = String(currentUser.username || currentUser.email || 'ACCOUNT').trim();
        accountLabel.textContent = displayName || 'ACCOUNT';
        accountBtn.classList.add('is-signed-in');
        const avatarUrl = String(currentUser.avatar || '').trim();
        await applyAvatarFromSource(avatarUrl);
    };

    accountBtn.addEventListener('click', () => {
        window.location.href = 'account.html';
    });

    window.addEventListener('storage', (event) => {
        if (event.key === AUTH_STORAGE_KEYS.CURRENT_USER) {
            void applyAccountHeaderState();
        }
    });

    void applyAccountHeaderState();
}

async function resolveAvatarImageUrl(rawAvatarUrl) {
    const source = String(rawAvatarUrl || '').trim();
    if (!source) return '';

    const candidates = buildAvatarUrlCandidates(source);
    for (const candidate of candidates) {
        const ok = await canLoadImageUrl(candidate);
        if (ok) return candidate;
    }
    return '';
}

function buildAvatarUrlCandidates(rawUrl) {
    const source = String(rawUrl || '').trim();
    if (!source) return [];

    const dedupe = new Set();
    const out = [];
    const add = (value) => {
        const next = String(value || '').trim();
        if (!next || dedupe.has(next)) return;
        dedupe.add(next);
        out.push(next);
    };

    add(source);

    try {
        const parsed = new URL(source, window.location.href);
        const isHttp = /^https?:$/i.test(parsed.protocol);
        const isDirectImage = /\.(png|jpe?g|gif|webp|avif|bmp|svg)(?:[?#].*)?$/i.test(parsed.pathname) || source.startsWith('data:image/');

        if (isHttp && !isDirectImage) {
            add(`https://image.thum.io/get/width/256/crop/256/noanimate/${parsed.href}`);
            add(`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`);
        }
    } catch (error) {
        // keep original source only
    }

    return out;
}

function canLoadImageUrl(url, timeoutMs = 3500) {
    return new Promise(resolve => {
        const img = new Image();
        let finished = false;

        const done = (result) => {
            if (finished) return;
            finished = true;
            clearTimeout(timeoutId);
            img.onload = null;
            img.onerror = null;
            resolve(result);
        };

        const timeoutId = setTimeout(() => done(false), Math.max(300, Number(timeoutMs) || 3500));
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = url;
    });
}

function getCurrentAuthUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (error) {
        return null;
    }
}

function initializeAboutPages() {
    const versionEl = document.getElementById('aboutAppVersion');
    const buildDateEl = document.getElementById('aboutBuildDate');
    const developerEl = document.getElementById('aboutDeveloper');
    const techStackEl = document.getElementById('aboutTechStack');
    const systemInfoEl = document.getElementById('aboutSystemInfo');

    if (versionEl) versionEl.textContent = ABOUT_PAGE_META.version;
    if (developerEl) developerEl.textContent = ABOUT_PAGE_META.developer;
    if (techStackEl) techStackEl.textContent = ABOUT_PAGE_META.techStack;
    if (buildDateEl) {
        const sourceDate = document.lastModified ? new Date(document.lastModified) : new Date();
        const safeDate = Number.isNaN(sourceDate.getTime()) ? new Date() : sourceDate;
        buildDateEl.textContent = safeDate.toISOString().slice(0, 10);
    }
    if (systemInfoEl) {
        const ua = String(navigator.userAgent || 'Unknown User Agent');
        systemInfoEl.textContent = `System: ${navigator.platform || 'Unknown'} | Language: ${navigator.language || 'unknown'} | UA: ${ua}`;
    }

    const openSupportBtn = document.getElementById('openSupportPageBtn');
    if (openSupportBtn) {
        openSupportBtn.addEventListener('click', () => {
            selectPage('support');
            updatePageTitle('support');
        });
    }

    const backToAboutBtn = document.getElementById('backToAboutPageBtn');
    if (backToAboutBtn) {
        backToAboutBtn.addEventListener('click', () => {
            selectPage('about');
            updatePageTitle('about');
        });
    }

    const changelogBtn = document.getElementById('aboutOpenChangelogBtn');
    if (changelogBtn) {
        changelogBtn.addEventListener('click', () => {
            selectPage('changelog');
            updatePageTitle('changelog');
        });
    }

    const roadmapBtn = document.getElementById('aboutOpenRoadmapBtn');
    if (roadmapBtn) roadmapBtn.addEventListener('click', openRoadmapModal);

    const checkUpdatesBtn = document.getElementById('aboutCheckUpdatesBtn');
    if (checkUpdatesBtn) {
        checkUpdatesBtn.addEventListener('click', () => {
            showNotification(`No updates available. You are on ${ABOUT_PAGE_META.version}.`);
        });
    }

    const backToAboutFromChangelogBtn = document.getElementById('backToAboutFromChangelogBtn');
    if (backToAboutFromChangelogBtn) {
        backToAboutFromChangelogBtn.addEventListener('click', () => {
            selectPage('about');
            updatePageTitle('about');
        });
    }

    const roadmapModal = document.getElementById('roadmapModal');
    const closeRoadmapModalBtn = document.getElementById('closeRoadmapModalBtn');
    const closeRoadmapModalBottomBtn = document.getElementById('closeRoadmapModalBottomBtn');
    if (closeRoadmapModalBtn) closeRoadmapModalBtn.addEventListener('click', closeRoadmapModal);
    if (closeRoadmapModalBottomBtn) closeRoadmapModalBottomBtn.addEventListener('click', closeRoadmapModal);
    if (roadmapModal) {
        roadmapModal.addEventListener('click', (event) => {
            if (event.target === roadmapModal) closeRoadmapModal();
        });
    }

    const copyDebugBtn = document.getElementById('aboutCopyDebugInfoBtn');
    if (copyDebugBtn) {
        copyDebugBtn.addEventListener('click', () => copyAboutDebugInfo());
    }
    const supportCopyDebugBtn = document.getElementById('supportCopyDebugInfoBtn');
    if (supportCopyDebugBtn) {
        supportCopyDebugBtn.addEventListener('click', () => copyAboutDebugInfo());
    }

    const aboutGithubBtn = document.getElementById('aboutGithubBtn');
    if (aboutGithubBtn) {
        aboutGithubBtn.addEventListener('click', openGithubSupportPage);
    }
    const supportGithubBtn = document.getElementById('supportGithubBtn');
    if (supportGithubBtn) {
        supportGithubBtn.addEventListener('click', openGithubSupportPage);
    }

    const supportRecoverBtn = document.getElementById('supportRecoverAutoSaveBtn');
    if (supportRecoverBtn) {
        supportRecoverBtn.addEventListener('click', () => triggerSupportProxyAction('recoverLastAutoSaveBtn'));
    }
    const supportCrashBtn = document.getElementById('supportViewCrashReportBtn');
    if (supportCrashBtn) {
        supportCrashBtn.addEventListener('click', () => triggerSupportProxyAction('viewCrashReportBtn'));
    }
    const supportResetProfileBtn = document.getElementById('supportResetProfileBtn');
    if (supportResetProfileBtn) {
        supportResetProfileBtn.addEventListener('click', () => triggerSupportProxyAction('resetSettings'));
    }
    const supportResetWorkspaceBtn = document.getElementById('supportResetWorkspaceBtn');
    if (supportResetWorkspaceBtn) {
        supportResetWorkspaceBtn.addEventListener('click', () => triggerSupportProxyAction('resetWorkspaceSyncBtn'));
    }
}

function openRoadmapModal() {
    const modal = document.getElementById('roadmapModal');
    if (!modal) return;
    modal.classList.add('active');
}

function closeRoadmapModal() {
    const modal = document.getElementById('roadmapModal');
    if (!modal) return;
    modal.classList.remove('active');
}

function openGithubSupportPage() {
    const raw = String(ABOUT_GITHUB_URL || '').trim();
    if (!raw) {
        showNotification('Set ABOUT_GITHUB_URL in script.js first.');
        return;
    }
    const hasProtocol = /^(https?:\/\/)/i.test(raw);
    const url = hasProtocol ? raw : `https://${raw}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function triggerSupportProxyAction(targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
        showNotification(`Support action not available: ${targetId}`);
        return;
    }
    target.click();
}

async function copyAboutDebugInfo() {
    const activePage = getActivePageName().toUpperCase();
    const profileName = getCurrentProfileName();
    const enabledCount = getEnabledFeatureCount();
    const totalCount = document.querySelectorAll('.toggle-input[data-feature]').length;
    const nowIso = new Date().toISOString();
    const payload = [
        `NEXUS ${ABOUT_PAGE_META.version}`,
        `Timestamp: ${nowIso}`,
        `Active Page: ${activePage}`,
        `Profile: ${profileName}`,
        `Active Hacks: ${enabledCount}/${totalCount}`,
        `Theme: ${document.body.classList.contains('light-theme') ? 'light' : 'dark'}`,
        `Platform: ${navigator.platform || 'unknown'}`,
        `Language: ${navigator.language || 'unknown'}`,
        `UserAgent: ${navigator.userAgent || 'unknown'}`
    ].join('\n');

    try {
        await navigator.clipboard.writeText(payload);
        showNotification('Debug info copied.');
    } catch (error) {
        showNotification('Clipboard access failed. Copy manually from console output.');
        console.log(payload);
    }
}

function getCurrentProfileName() {
    return String(localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default').trim() || 'Default';
}

function getEnabledFeatureCount() {
    return Array.from(document.querySelectorAll('.toggle-input[data-feature]')).filter(toggle => toggle.checked).length;
}


let clickAudioContext = null;
let clickNoiseBuffer = null;

const BUTTON_SOUND_PRESETS = {
    'nexus-soft': {
        bodyWave: 'triangle', bodyStart: 320, bodyEnd: 170, bodyGain: 0.060,
        tickWave: 'square', tickStart: 2400, tickEnd: 950, tickGain: 0.040,
        noiseGain: 0.018, noiseFreq: 3200, lowpass: 7000, highpass: 130,
        duration: 0.030, upDelay: 0.028, upScale: 0.70, master: 0.90
    },
    'mechanical-tap': {
        bodyWave: 'triangle', bodyStart: 420, bodyEnd: 210, bodyGain: 0.070,
        tickWave: 'square', tickStart: 2800, tickEnd: 1100, tickGain: 0.048,
        noiseGain: 0.022, noiseFreq: 3600, lowpass: 7600, highpass: 160,
        duration: 0.028, upDelay: 0.024, upScale: 0.72, master: 0.96
    },
    'digital-pop': {
        bodyWave: 'sine', bodyStart: 500, bodyEnd: 250, bodyGain: 0.058,
        tickWave: 'triangle', tickStart: 3000, tickEnd: 1350, tickGain: 0.042,
        noiseGain: 0.016, noiseFreq: 4200, lowpass: 8200, highpass: 200,
        duration: 0.026, upDelay: 0.022, upScale: 0.65, master: 0.88
    },
    'retro-blip': {
        bodyWave: 'square', bodyStart: 260, bodyEnd: 130, bodyGain: 0.050,
        tickWave: 'square', tickStart: 1900, tickEnd: 800, tickGain: 0.036,
        noiseGain: 0.011, noiseFreq: 2500, lowpass: 5400, highpass: 110,
        duration: 0.034, upDelay: 0.032, upScale: 0.68, master: 0.86
    },
    'sharp-click': {
        bodyWave: 'triangle', bodyStart: 620, bodyEnd: 290, bodyGain: 0.066,
        tickWave: 'square', tickStart: 3600, tickEnd: 1450, tickGain: 0.055,
        noiseGain: 0.026, noiseFreq: 5200, lowpass: 9000, highpass: 260,
        duration: 0.024, upDelay: 0.020, upScale: 0.60, master: 1.00
    }
};

const soundSettings = {
    enabled: false,
    type: 'nexus-soft',
    volume: 0.65
};

const FEATURE_SWITCH_SOUND_PRESETS = {
    'clean-toggle': {
        wave: 'triangle', onStart: 560, onEnd: 980, offStart: 560, offEnd: 300,
        tickStart: 2100, tickEnd: 980, tickGain: 0.030, bodyGain: 0.052,
        noiseGain: 0.010, noiseFreq: 2800, lowpass: 6400, highpass: 120,
        duration: 0.034, returnDelay: 0.014, returnScale: 0.58, master: 0.88
    },
    'soft-switch': {
        wave: 'sine', onStart: 500, onEnd: 860, offStart: 500, offEnd: 270,
        tickStart: 1700, tickEnd: 820, tickGain: 0.022, bodyGain: 0.040,
        noiseGain: 0.007, noiseFreq: 2200, lowpass: 5200, highpass: 90,
        duration: 0.038, returnDelay: 0.016, returnScale: 0.55, master: 0.80
    },
    'mechanical-flick': {
        wave: 'square', onStart: 700, onEnd: 1240, offStart: 700, offEnd: 360,
        tickStart: 2600, tickEnd: 1180, tickGain: 0.038, bodyGain: 0.060,
        noiseGain: 0.014, noiseFreq: 3600, lowpass: 7400, highpass: 170,
        duration: 0.030, returnDelay: 0.012, returnScale: 0.62, master: 0.96
    },
    'digital-switch': {
        wave: 'triangle', onStart: 860, onEnd: 1520, offStart: 860, offEnd: 430,
        tickStart: 3000, tickEnd: 1400, tickGain: 0.035, bodyGain: 0.050,
        noiseGain: 0.012, noiseFreq: 4300, lowpass: 8000, highpass: 220,
        duration: 0.028, returnDelay: 0.011, returnScale: 0.60, master: 0.90
    },
    'snap-toggle': {
        wave: 'square', onStart: 980, onEnd: 1750, offStart: 980, offEnd: 510,
        tickStart: 3600, tickEnd: 1650, tickGain: 0.044, bodyGain: 0.066,
        noiseGain: 0.018, noiseFreq: 5200, lowpass: 9000, highpass: 280,
        duration: 0.024, returnDelay: 0.010, returnScale: 0.64, master: 1.00
    }
};

const featureSwitchSoundSettings = {
    enabled: false,
    type: 'clean-toggle',
    volume: 0.70
};

const THEME_PRESETS = {
    'nexus-cyan': { name: 'Nexus Cyan', theme: 'dark', accent: '#00d9ff', radius: 8, opacity: 100 },
    'inferno-red': { name: 'Inferno Red', theme: 'dark', accent: '#ff2f2f', radius: 10, opacity: 100 },
    'emerald-night': { name: 'Emerald Night', theme: 'dark', accent: '#2df7a1', radius: 9, opacity: 96 },
    'arctic-light': { name: 'Arctic Light', theme: 'light', accent: '#31b3ff', radius: 8, opacity: 100 }
};

let resetUndoState = {
    snapshot: null,
    timeoutId: null,
    expiresAt: 0
};

const ABOUT_PAGE_META = {
    version: 'v1.0.0-beta',
    developer: 'Nexus Team',
    techStack: 'HTML, CSS, JavaScript'
};

const ABOUT_GITHUB_URL = 'https://github.com/pjater/NEXUS-Client-GUI';

const KEYBIND_ACTIONS = [
    { id: 'nav-combat', group: 'navigation', title: 'Open Combat', hint: 'Go to COMBAT page', run: () => goToPageByKeybind('combat') },
    { id: 'nav-hacks', group: 'navigation', title: 'Open Hacks', hint: 'Go to HACKS page', run: () => goToPageByKeybind('hacks') },
    { id: 'nav-visuals', group: 'navigation', title: 'Open Visuals', hint: 'Go to VISUALS page', run: () => goToPageByKeybind('visuals') },
    { id: 'nav-settings', group: 'navigation', title: 'Open Settings', hint: 'Go to SETTINGS page', run: () => goToPageByKeybind('settings') },
    { id: 'nav-about', group: 'navigation', title: 'Open About', hint: 'Go to ABOUT page', run: () => goToPageByKeybind('about') },
    { id: 'nav-support', group: 'navigation', title: 'Open Support', hint: 'Go to SUPPORT page', run: () => goToPageByKeybind('support') },

    { id: 'toggle-killaura', group: 'features', title: 'Toggle KillAura', hint: 'Feature switch', run: () => toggleFeatureByKeybind('killaura') },
    { id: 'toggle-reach', group: 'features', title: 'Toggle Reach', hint: 'Feature switch', run: () => toggleFeatureByKeybind('reach') },
    { id: 'toggle-autototem', group: 'features', title: 'Toggle AutoTotem', hint: 'Feature switch', run: () => toggleFeatureByKeybind('autototem') },
    { id: 'toggle-autoclicker', group: 'features', title: 'Toggle AutoClicker', hint: 'Feature switch', run: () => toggleFeatureByKeybind('autoclicker') },
    { id: 'toggle-aimbot', group: 'features', title: 'Toggle Aimbot', hint: 'Feature switch', run: () => toggleFeatureByKeybind('aimbot') },

    { id: 'toggle-fly', group: 'features', title: 'Toggle Fly', hint: 'Feature switch', run: () => toggleFeatureByKeybind('fly') },
    { id: 'toggle-speed', group: 'features', title: 'Toggle Speed', hint: 'Feature switch', run: () => toggleFeatureByKeybind('speed') },
    { id: 'toggle-nofall', group: 'features', title: 'Toggle NoFall', hint: 'Feature switch', run: () => toggleFeatureByKeybind('nofall') },
    { id: 'toggle-scaffold', group: 'features', title: 'Toggle Scaffold', hint: 'Feature switch', run: () => toggleFeatureByKeybind('scaffold') },
    { id: 'toggle-chestsstealer', group: 'features', title: 'Toggle ChestStealer', hint: 'Feature switch', run: () => toggleFeatureByKeybind('chestsstealer') },

    { id: 'toggle-xray', group: 'features', title: 'Toggle X-Ray', hint: 'Feature switch', run: () => toggleFeatureByKeybind('xray') },
    { id: 'toggle-fullbright', group: 'features', title: 'Toggle Fullbright', hint: 'Feature switch', run: () => toggleFeatureByKeybind('fullbright') },
    { id: 'toggle-freecam', group: 'features', title: 'Toggle Freecam', hint: 'Feature switch', run: () => toggleFeatureByKeybind('freecam') },
    { id: 'toggle-hitboxmodifier', group: 'features', title: 'Toggle Hitbox Modifier', hint: 'Feature switch', run: () => toggleFeatureByKeybind('hitboxmodifier') },
    { id: 'toggle-armorhud', group: 'features', title: 'Toggle Armor HUD', hint: 'Feature switch', run: () => toggleFeatureByKeybind('armorhud') },
    { id: 'toggle-esp', group: 'features', title: 'Toggle ESP', hint: 'Feature switch', run: () => toggleFeatureByKeybind('esp') },

    { id: 'action-save', group: 'actions', title: 'Save Settings', hint: 'Same as SAVE button', run: () => saveSettings() },
    { id: 'action-reset', group: 'actions', title: 'Open Reset Dialog', hint: 'Open reset confirmation', run: () => openResetConfirmModal() },
    { id: 'action-sidebar', group: 'actions', title: 'Toggle Sidebar', hint: 'Collapse/expand sidebar', run: () => toggleSidebarByKeybind() },
    { id: 'action-ui-lock', group: 'actions', title: 'Toggle UI Lock', hint: 'Enable/disable card reorder lock', run: () => toggleUiLockByKeybind() },
    { id: 'action-button-sounds', group: 'actions', title: 'Toggle Button Sounds', hint: 'Enable/disable button click sounds', run: () => toggleSoundSettingByKeybind('button') },
    { id: 'action-switch-sounds', group: 'actions', title: 'Toggle Switch Sounds', hint: 'Enable/disable switch sounds', run: () => toggleSoundSettingByKeybind('switch') },
    { id: 'action-profile-select', group: 'actions', title: 'Load Configured Profile', hint: 'Load one selected profile directly', profileTargetConfig: true, run: () => runConfiguredProfileKeybind() }
];

const KEYBIND_GROUP_TITLES = {
    navigation: 'NAVIGATION',
    features: 'HACKS',
    actions: 'GENERAL SETTINGS',
    macros: 'MACROS',
    automations: 'AUTOMATIONS',
    workflow: 'WORKFLOW'
};

const KEYBIND_MODES = {
    TOGGLE: 'toggle',
    HOLD: 'hold'
};

const STARTUP_PAGE_OPTIONS = ['combat', 'hacks', 'visuals', 'settings', 'last'];
const PAGE_OPTIONS = ['combat', 'hacks', 'visuals', 'settings', 'about', 'support', 'changelog'];
const MACRO_STEP_DELAY_MIN = 0;
const MACRO_STEP_DELAY_MAX = 10000;
const MACRO_STEP_DELAY_DEFAULT = 0;
const MACRO_LOOP_COUNT_MIN = 1;
const MACRO_LOOP_COUNT_MAX = 50;
const AUTOMATION_COOLDOWN_MIN = 0;
const AUTOMATION_COOLDOWN_MAX = 60000;
const AUTOMATION_TICK_MS = 350;

function getMacroKeybindActions() {
    return macros.map(macro => ({
        id: `macro-run:${macro.id}`,
        group: 'macros',
        title: `Run Macro: ${macro.name}`,
        hint: 'Execute this macro sequence',
        run: () => runMacroById(macro.id)
    }));
}

function getAutomationKeybindActions() {
    return automations.flatMap(rule => ([
        {
            id: `automation-toggle:${rule.id}`,
            group: 'automations',
            title: `Toggle Automation: ${rule.name}`,
            hint: 'Enable/disable this automation rule',
            run: () => toggleAutomationByKeybind(rule.id)
        },
        {
            id: `automation-run:${rule.id}`,
            group: 'automations',
            title: `Run Automation: ${rule.name}`,
            hint: 'Run this automation action immediately',
            run: () => runAutomationByKeybind(rule.id)
        }
    ]));
}

function getWorkflowKeybindActions() {
    return plugins
        .filter(plugin => plugin.enabled && plugin.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS)
        .map(plugin => ({
            id: `workflow-run:${plugin.id}`,
            group: 'workflow',
            title: `Run Workflow: ${plugin.name}`,
            hint: 'Run this workflow canvas',
            run: () => runWorkflowCanvasPlugin(plugin.id)
        }));
}

function getAllKeybindActions() {
    return [
        ...KEYBIND_ACTIONS,
        ...getMacroKeybindActions(),
        ...getAutomationKeybindActions(),
        ...getWorkflowKeybindActions()
    ];
}

function findKeybindActionById(actionId) {
    return getAllKeybindActions().find(item => item.id === actionId) || null;
}

let keybindMap = {};
let keybindModeMap = {};
let keybindProfileTargets = {};
let activeKeybindGroup = 'navigation';
let keybindCapture = {
    actionId: '',
    buttonElement: null
};
let activeHoldKeybindActions = new Map();
let pendingKeybindConflict = null;
let recentChanges = [];
let suspendRecentTracking = false;
let sessionStartTimestamp = Date.now();
let sessionTimerIntervalId = null;
let miniHudDragState = { active: false, offsetX: 0, offsetY: 0 };
let debugPanelDragState = { active: false, offsetX: 0, offsetY: 0 };
let miniHudPipWindow = null;
let miniHudPlaceholder = null;
let miniHudElementRef = null;
let multiSelectMode = false;
let selectedFeatures = new Set();
let radialMenuTargetCard = null;
let sidebarKeybindsUnlocked = false;
let sidebarMacrosUnlocked = false;
let sidebarAutomationUnlocked = false;
let sidebarWorkflowUnlocked = false;
let sidebarCustomPagesUnlocked = false;
let sidebarDebugUnlocked = false;
let sidebarMarketplaceUnlocked = false;
let sidebarThemeStudioUnlocked = false;
let profileUnsavedTrackingInitialized = false;
const SAFETY_HOLD_MS_DEFAULT = 1500;
const SAFETY_HOLD_MS_MIN = 500;
const SAFETY_HOLD_MS_MAX = 3500;
let safetyHoldDurationMs = SAFETY_HOLD_MS_DEFAULT;
const safetyHoldStartedAtMap = new WeakMap();
const safetyHoldAnimationIdMap = new WeakMap();
let activeSafetyHoldButton = null;
let macros = [];
let macroCollapseState = {};
let activeMacroRunIds = new Set();
let automations = [];
let automationCollapseState = {};
let automationTickIntervalId = null;
let automationRuntimeState = {};
let plugins = [];
let debugPacketsLiteRuntimeEnabled = false;
let profileBadgesPlusRuntimeEnabled = false;
let macroToolsPackRuntimeEnabled = false;
let workspaceToolsRuntimeEnabled = false;
let crashTestToolsRuntimeEnabled = false;
let workflowCanvasRuntimeEnabled = false;
let customPageStudioRuntimeEnabled = false;
let autoSaveIntervalId = null;
let welcomeSplashState = {
    hasShown: false,
    dismissTimerId: null,
    cleanupHandlers: null
};
let pageSkeletonState = {
    timeoutId: null,
    token: 0,
    cleanup: null
};
let keybindConflictState = {
    comboMap: new Map(),
    keybindActionCombos: new Map(),
    macroCombos: new Map(),
    keybindConflictActionIds: new Set(),
    macroConflictIds: new Set(),
    conflictCount: 0
};
let featureTooltipState = {
    element: null,
    activeCard: null
};
const sidebarOriginalIcons = new Map();
const sidebarIconDebounceMap = new Map();
let bgPatternRuntimeState = {
    frameId: null,
    resizeHandler: null,
    styleId: '',
    overlay: null,
    canvas: null,
    ctx: null,
    matrixDrops: [],
    matrixChars: [],
    matrixLastStepAt: 0
};
let konamiCodeState = {
    buffer: [],
    timeoutId: null,
    active: false,
    listenerBound: false,
    previewBound: false,
    previewClickStamps: []
};
let themeStudioDraftState = {
    bgPattern: 'none',
    sidebarIcons: {}
};
let pluginDependencyPromptState = {
    pluginId: '',
    missingDependencies: []
};
const dynamicPluginPageTitles = new Map();
const workflowCanvasRunState = new Map();
const customPageStudioEditState = new Map();
const workflowCanvasEditorState = new Map();
const customPageStudioSelectedPage = new Map();
let pluginTargetSelectionState = {
    active: false,
    pluginId: ''
};
let pluginSelectionListenerBound = false;
let pluginTargetIdCounter = 1;
const DEMO_LOG_LIMIT = 12;
const DEBUG_HISTORY_LIMIT = 90;
const DEBUG_METRICS = {
    speed: { label: 'SPEED (b/s)', color: '#00d9ff' },
    fps: { label: 'FPS', color: '#2df7a1' },
    latency: { label: 'LATENCY (ms)', color: '#ffb703' },
    active: { label: 'ACTIVE HACKS', color: '#ff5a5a' },
    heap: { label: 'HEAP (MB)', color: '#8b5cf6' },
    packets: { label: 'PACKETS/s', color: '#f97316' }
};
const PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL = 'cards-containers-control';
const PLUGIN_BEHAVIOR_DEBUG_PACKETS_LITE = 'debug-packets-lite';
const PLUGIN_BEHAVIOR_PROFILE_BADGES_PLUS = 'profile-badges-plus';
const PLUGIN_BEHAVIOR_MACRO_TOOLS_PACK = 'macro-tools-pack';
const PLUGIN_BEHAVIOR_WORKSPACE_TOOLS = 'workspace-tools';
const PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX = 'ui-layout-remix';
const PLUGIN_BEHAVIOR_CRASH_TEST_TOOLS = 'crash-test-tools';
const PLUGIN_BEHAVIOR_WORKFLOW_CANVAS = 'workflow-canvas';
const PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO = 'custom-page-studio';
const PROFILE_ROLES = {
    ADMIN: 'admin',
    STANDARD: 'standard',
    RESTRICTED: 'restricted',
    INCOGNITO: 'incognito'
};
const CORE_PROFILE_NAMES = new Set(['Default', 'Incognito']);
const AUTO_SAVE_INTERVAL_MS_DEFAULT = 60000;
const AUTO_SAVE_INTERVAL_MS_MIN = 15000;
const AUTO_SAVE_INTERVAL_MS_MAX = 300000;
const THEME_STUDIO_DEFAULTS = {
    mainSize: 560,
    mainAlphaPct: 15,
    secondaryAlphaPct: 9,
    tertiaryAlphaPct: 8,
    bootSize: 2100,
    bootAlphaPct: 16,
    mainBgColor: '#0d0d0d',
    sidebarBgColor: '#1a1a1a',
    headerBgColor: '#111111',
    cardBgColor: '#1a1a1a',
    buttonBgColor: '#111111',
    useThemeMainBg: true,
    useThemeSidebarBg: true,
    useThemeHeaderBg: true,
    useThemeCardBg: true,
    useThemeButtonBg: true,
    colorblindEnabled: false,
    colorblindMode: 'protanopia'
};
const ROLE_CAPABILITY_KEYS = ['saveSettings', 'editProfiles', 'managePlugins', 'manageWorkspace', 'destructiveActions'];
const ROLE_CAPABILITY_LABELS = {
    saveSettings: 'Save Settings',
    editProfiles: 'Edit Profiles',
    managePlugins: 'Manage Plugins',
    manageWorkspace: 'Manage Workspace',
    destructiveActions: 'Destructive Actions'
};
const DEFAULT_ROLE_DEFINITIONS = {
    [PROFILE_ROLES.ADMIN]: {
        label: 'ADMIN',
        protected: true,
        capabilities: {
            saveSettings: true,
            editProfiles: true,
            managePlugins: true,
            manageWorkspace: true,
            destructiveActions: true
        }
    },
    [PROFILE_ROLES.STANDARD]: {
        label: 'STANDARD',
        protected: false,
        capabilities: {
            saveSettings: true,
            editProfiles: true,
            managePlugins: true,
            manageWorkspace: true,
            destructiveActions: false
        }
    },
    [PROFILE_ROLES.RESTRICTED]: {
        label: 'RESTRICTED',
        protected: false,
        capabilities: {
            saveSettings: false,
            editProfiles: false,
            managePlugins: false,
            manageWorkspace: false,
            destructiveActions: false
        }
    },
    [PROFILE_ROLES.INCOGNITO]: {
        label: 'INCOGNITO',
        protected: true,
        capabilities: {
            saveSettings: false,
            editProfiles: false,
            managePlugins: false,
            manageWorkspace: false,
            destructiveActions: false
        }
    }
};
const PLUGIN_PERMISSION_DEFINITIONS = {
    ui: { label: 'UI', description: 'Allows editing or moving UI sections' },
    storage: { label: 'STORAGE', description: 'Allows reading/writing local settings data' },
    debug: { label: 'DEBUG', description: 'Allows debug telemetry/runtime hooks' },
    automation: { label: 'AUTOMATION', description: 'Allows running macro/automation actions' },
    network: { label: 'NETWORK', description: 'Allows opening external routes/links' }
};
const KNOWN_RUNTIME_PLUGIN_BEHAVIORS = new Set([
    PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL,
    PLUGIN_BEHAVIOR_DEBUG_PACKETS_LITE,
    PLUGIN_BEHAVIOR_PROFILE_BADGES_PLUS,
    PLUGIN_BEHAVIOR_MACRO_TOOLS_PACK,
    PLUGIN_BEHAVIOR_WORKSPACE_TOOLS,
    PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX,
    PLUGIN_BEHAVIOR_CRASH_TEST_TOOLS,
    PLUGIN_BEHAVIOR_WORKFLOW_CANVAS,
    PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO
]);
const LEGACY_REMOVED_PLUGIN_IDS = new Set(['cards-containers-power']);
const PLUGIN_TARGET_SELECTORS = [
    '.feature-card',
    '#page-settings .setting-card',
    '#page-settings .settings-section',
    '.quick-toggle-bar',
    '.multi-select-toolbar',
    '#profilesList',
    '.profile-management'
];
const MARKETPLACE_CATALOG = [
    {
        id: 'cards-containers-control',
        name: 'Cards & Containers Control',
        version: '1.0.0',
        author: 'Nexus Community',
        category: 'ui',
        tags: ['cards', 'containers', 'control'],
        popularity: 95,
        addedAt: '2026-02-19',
        description: 'Select cards and containers, then dim + disable them.',
        plugin: {
            id: 'cards-containers-control',
            name: 'Cards & Containers Control',
            version: '1.0.0',
            author: 'Nexus Community',
            sourceUrl: 'plugins/cards-containers-control.plugin.json',
            description: 'Use SELECT MODE ON/OFF in Plugin Manager, then click cards/containers to make them dim + inactive.',
            enabled: false,
            behavior: 'cards-containers-control',
            configurable: true,
            configureRoute: '',
            configureHint: 'Use SELECT MODE ON/OFF in the plugin row. Popup is optional.',
            info: {
                title: 'Cards & Containers Control',
                what: 'Lets you disable specific cards/containers in the UI so they are dimmed and inactive.',
                how: 'Turn SELECT MODE ON, click the cards/containers you want disabled, then turn SELECT MODE OFF.',
                usage: 'Use CONFIGURE/SELECT MODE for selection and CLEAR DISABLED to reset selected targets.',
                notes: ['Useful for locking down parts of the interface during focused sessions.']
            },
            config: { disabledTargetIds: [] }
        }
    },
    {
        id: 'profile-badges-plus',
        name: 'Profile Badges Plus',
        version: '1.1.0',
        author: 'Nexus Labs',
        category: 'ui',
        tags: ['profiles', 'badges', 'labels'],
        popularity: 78,
        addedAt: '2026-02-12',
        description: 'Adds ACTIVE/FAVORITE/CORE badges in the profile list.',
        plugin: {
            id: 'profile-badges-plus',
            name: 'Profile Badges Plus',
            version: '1.1.0',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/profile-badges-plus.plugin.json',
            description: 'Adds ACTIVE/FAVORITE/CORE badges in profile list cards.',
            enabled: false,
            behavior: 'profile-badges-plus',
            configurable: false,
            configureRoute: '',
            configureHint: '',
            info: {
                title: 'Profile Badges Plus',
                what: 'Adds ACTIVE/FAVORITE/CORE badges to profile items for faster scanning.',
                how: 'When enabled, profile list cards are re-rendered with badge chips based on profile state.',
                usage: 'Enable in Plugin Manager and open Profiles list to see badge chips.',
                notes: ['Pure UI helper plugin.']
            },
            config: {}
        }
    },
    {
        id: 'macro-tools-pack',
        name: 'Macro Tools Pack',
        version: '1.0.3',
        author: 'Nexus Labs',
        category: 'automation',
        tags: ['macro', 'workflow', 'tools'],
        popularity: 71,
        addedAt: '2026-02-10',
        description: 'Adds macro runtime estimate, duplicate action and adaptive delay pacing.',
        plugin: {
            id: 'macro-tools-pack',
            name: 'Macro Tools Pack',
            version: '1.0.3',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/macro-tools-pack.plugin.json',
            description: 'Adds macro runtime estimate, duplicate action and adaptive delay pacing.',
            enabled: false,
            behavior: 'macro-tools-pack',
            configurable: false,
            configureRoute: '',
            configureHint: '',
            info: {
                title: 'Macro Tools Pack',
                what: 'Adds macro quality tools: estimated runtime, duplicate button and runtime delay tuning.',
                how: 'When enabled, macro cards get extra controls and macro execution applies adaptive delay pacing.',
                usage: 'Enable in Plugin Manager, then open Macros to use DUPLICATE and see estimated duration.',
                notes: ['No standalone configuration screen required.']
            },
            config: {}
        }
    },
    {
        id: 'debug-packets-lite',
        name: 'Debug Packets Lite',
        version: '0.9.5',
        author: 'Community',
        category: 'debug',
        tags: ['debug', 'telemetry'],
        popularity: 64,
        addedAt: '2026-02-08',
        description: 'Adds packet-rate and jitter telemetry to the debug monitor.',
        plugin: {
            id: 'debug-packets-lite',
            name: 'Debug Packets Lite',
            version: '0.9.5',
            author: 'Community',
            sourceUrl: 'plugins/debug-packets-lite.plugin.json',
            description: 'Adds packet-rate and jitter telemetry to dashboard, chart and debug log.',
            enabled: false,
            behavior: 'debug-packets-lite',
            configurable: false,
            configureRoute: '',
            configureHint: '',
            info: {
                title: 'Debug Packets Lite',
                what: 'Adds packet-rate and jitter telemetry to the debug monitor.',
                how: 'When enabled, the debug runtime computes packet rate and jitter and extends log/chart output.',
                usage: 'Enable in Plugin Manager, then open Debug Dashboard and check Packet Rate/Jitter and PACKETS chart tab.',
                notes: ['Lightweight debug companion plugin.']
            },
            config: {}
        }
    },
    {
        id: 'workspace-tools',
        name: 'Workspace Tools',
        version: '1.2.1',
        author: 'Nexus Labs',
        category: 'utility',
        tags: ['workspace', 'sync', 'tools'],
        popularity: 82,
        addedAt: '2026-02-15',
        description: 'Adds workspace summary, auto-backup on import and restore-backup control.',
        plugin: {
            id: 'workspace-tools',
            name: 'Workspace Tools',
            version: '1.2.1',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/workspace-tools.plugin.json',
            description: 'Adds workspace summary, auto-backup on import and restore-backup control.',
            enabled: false,
            behavior: 'workspace-tools',
            configurable: false,
            configureRoute: '',
            configureHint: '',
            info: {
                title: 'Workspace Tools',
                what: 'Adds workspace summaries, automatic import backup, and restore-backup control.',
                how: 'When enabled, imports create backup snapshots and workspace status includes detailed counts.',
                usage: 'Enable in Plugin Manager and use Workspace Sync import/export; restore via RESTORE BACKUP.',
                notes: ['Designed as utility support layer.']
            },
            config: {}
        }
    },
    {
        id: 'crash-test-tools',
        name: 'Crash Test Tools',
        version: '1.0.0',
        author: 'Nexus Labs',
        category: 'debug',
        tags: ['crash', 'recovery', 'testing'],
        popularity: 67,
        addedAt: '2026-02-20',
        description: 'Adds a guarded FORCE CRASH TEST button inside Crash Recovery for intentional testing.',
        plugin: {
            id: 'crash-test-tools',
            name: 'Crash Test Tools',
            version: '1.0.0',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/crash-test-tools.plugin.json',
            description: 'Adds a guarded FORCE CRASH TEST action in Crash Recovery to validate crash-report flow.',
            enabled: false,
            behavior: 'crash-test-tools',
            configurable: false,
            configureRoute: '',
            configureHint: '',
            info: {
                title: 'Crash Test Tools',
                what: 'Adds a safety-locked button that intentionally throws a runtime error for recovery tests.',
                how: 'When enabled, Crash Recovery shows FORCE CRASH TEST. Pressing it stores a report, then throws an intentional error.',
                usage: 'Enable plugin in Plugin Manager and use FORCE CRASH TEST in Settings > System > Crash Recovery.',
                notes: ['For testing only. Requires destructive-action permission.']
            },
            config: {}
        }
    },
    {
        id: 'ui-layout-remix',
        name: 'UI Layout Remix',
        version: '1.0.0',
        author: 'Nexus Community',
        category: 'ui',
        tags: ['layout', 'sidebar', 'header', 'search'],
        popularity: 86,
        addedAt: '2026-02-20',
        description: 'Lets you move sidebar to the right and move the full header block to top or bottom.',
        plugin: {
            id: 'ui-layout-remix',
            name: 'UI Layout Remix',
            version: '1.0.0',
            author: 'Nexus Community',
            sourceUrl: 'plugins/ui-layout-remix.plugin.json',
            description: 'Move sidebar to right side and place the full header block at top or bottom.',
            enabled: false,
            behavior: 'ui-layout-remix',
            configurable: true,
            configureRoute: '',
            configureHint: 'Use CONFIGURE to set sidebar side and header position.',
            info: {
                title: 'UI Layout Remix',
                what: 'Rearranges core UI structure: sidebar side and header position.',
                how: 'Applies layout classes to move sidebar left/right and relocate the header block to top or bottom.',
                usage: 'Enable plugin, then press CONFIGURE and choose Sidebar Position + Header Position.',
                notes: ['Useful if you prefer right-handed navigation or a bottom control bar.']
            },
            config: {
                sidebarPosition: 'left',
                headerPosition: 'top'
            }
        }
    },
    {
        id: 'workflow-canvas',
        name: 'Workflow Canvas',
        version: '1.0.0',
        author: 'Nexus Labs',
        category: 'automation',
        tags: ['workflow', 'canvas', 'steps', 'runner'],
        popularity: 88,
        addedAt: '2026-02-20',
        description: 'Adds a node whiteboard in Settings where you connect macro/automation/key-action cards.',
        plugin: {
            id: 'workflow-canvas',
            name: 'Workflow Canvas',
            version: '1.0.0',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/workflow-canvas.plugin.json',
            description: 'Create and run node-based workflows with draggable cards and line connections.',
            enabled: false,
            behavior: 'workflow-canvas',
            configurable: true,
            configureRoute: '',
            configureHint: 'Open Workflow Canvas from Settings and connect nodes using input/output ports.',
            info: {
                title: 'Workflow Canvas',
                what: 'Adds a node whiteboard under Settings to build connected workflows.',
                how: 'Add nodes, drag them, connect OUTPUT to INPUT, then run looped execution order.',
                usage: 'Enable plugin, open Workflow Canvas and create linked nodes for macros/automations/key actions.',
                notes: ['Runs in current Nexus session and uses existing macro/automation/keybind systems.']
            },
            config: {
                pageTitle: 'Workflow Canvas',
                loopCount: 1,
                steps: []
            }
        }
    },
    {
        id: 'custom-page-studio',
        name: 'Custom Page',
        version: '1.0.0',
        author: 'Nexus Labs',
        category: 'ui',
        tags: ['custom-page', 'builder', 'cards', 'widgets', 'beta', 'experimental'],
        popularity: 90,
        addedAt: '2026-02-20',
        description: 'Experimental (BETA): create multiple custom sidebar pages and build your own cards/widgets per page.',
        plugin: {
            id: 'custom-page-studio',
            name: 'Custom Page',
            version: '1.0.0',
            author: 'Nexus Labs',
            sourceUrl: 'plugins/custom-page-studio.plugin.json',
            description: 'Experimental (BETA): build custom sidebar pages and add cards with text boxes, dropdowns, sliders, switches and action buttons.',
            enabled: false,
            behavior: 'custom-page-studio',
            stability: 'beta',
            experimental: true,
            configurable: true,
            configureRoute: '',
            configureHint: 'Experimental (BETA): open Custom Page Studio and create pages/cards/widgets from the Settings subpage.',
            info: {
                title: 'Custom Page (BETA)',
                what: 'Experimental page builder under Settings to create your own sidebar pages.',
                how: 'Create pages, then add cards/widgets per page and open them like native Nexus pages.',
                usage: 'Enable plugin, open Custom Page Studio, create pages, and edit cards/widgets. Some parts can still be unstable.',
                notes: [
                    'BETA: behavior can change and some flows may not work as expected yet.',
                    'Widget actions can trigger existing Nexus actions such as feature toggles and macro runs.'
                ]
            },
            config: {
                pageTitle: 'Custom Page Studio',
                pages: [],
                selectedPageId: ''
            }
        }
    }
];
let hackDemoState = {
    running: false,
    intervalId: null,
    startedAt: 0,
    lastTickAt: 0,
    tick: 0,
    speed: 4.3,
    fps: 0,
    latencyMs: null,
    jitterMs: null,
    packetRate: null,
    networkLabel: 'N/A',
    downlinkMbps: null,
    heapMb: null,
    cores: Number.isFinite(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : null,
    activePage: 'combat',
    profileName: 'Default',
    refreshMs: 750,
    compactMode: false,
    autoScroll: true,
    activeMetric: 'speed',
    history: {
        speed: [],
        fps: [],
        latency: [],
        active: [],
        heap: [],
        packets: []
    },
    pingInFlight: false
};

const DEBUG_FEATURE_MESSAGES = {
    killaura: 'KillAura toggle changed combat debug pressure.',
    reach: 'Reach changed extended-hit metrics.',
    autototem: 'AutoTotem changed auto-recovery probability.',
    autoclicker: 'AutoClicker changed click throughput model.',
    aimbot: 'Aimbot changed target-lock efficiency.',
    fly: 'Fly changed vertical path prediction.',
    speed: 'Speed changed movement throughput.',
    nofall: 'NoFall changed impact-risk model.',
    scaffold: 'Scaffold changed placement-rate telemetry.',
    chestsstealer: 'ChestStealer changed loot-cycle telemetry.',
    fullbright: 'Fullbright changed visibility score.',
    freecam: 'Freecam changed camera-trace metrics.',
    hitboxmodifier: 'Hitbox Modifier changed collision envelope.',
    armorhud: 'Armor HUD changed defense readout sampling.',
    esp: 'ESP changed entity-tracking density.',
    xray: 'X-Ray changed ore-detection confidence.'
};

const BUILTIN_HACK_PRESETS = {
    pvp: { killaura: true, aimbot: true, autoclicker: true, reach: true },
    survival: { fullbright: true, xray: false, scaffold: false },
    creative: { fly: true, speed: true },
    mining: { xray: true, chestsstealer: false }
};

const TARGET_SELECTOR_OPTIONS = [
    { value: 'nearest', icon: '🎯', label: 'Nearest' },
    { value: 'lowest-hp', icon: '❤️', label: 'Lowest HP' },
    { value: 'highest-threat', icon: '⚠️', label: 'Highest Threat' }
];
const TARGET_SELECTOR_FEATURES = new Set(['killaura', 'aimbot']);

const FEATURE_DESCRIPTIONS = {
    killaura: 'Automatically attacks nearby entities in range.',
    aimbot: 'Snaps aim toward the nearest target.',
    reach: 'Extends your melee attack reach.',
    speed: 'Increases your movement speed.',
    fly: 'Enables creative-style flight.',
    nofall: 'Cancels all fall damage.',
    esp: 'Renders entity outlines through walls.',
    tracers: 'Draws lines from you to nearby entities.',
    fullbright: 'Removes darkness - full ambient light.',
    xray: 'Highlights ores through solid blocks.',
    scaffold: 'Automatically places blocks beneath you.',
    sprint: 'Forces constant sprinting.',
    antikb: 'Reduces knockback taken from hits.',
    criticals: 'Forces every hit to deal critical damage.',
    fastplace: 'Removes the delay between block placements.',
    timer: 'Speeds up the game tick rate client-side.',
    autototem: 'Auto-swaps a totem when your health is low.',
    autoclicker: 'Automates click speed at your selected CPS.',
    chestsstealer: 'Auto-loots chest inventory at high speed.',
    freecam: 'Moves camera freely without player movement.',
    hitboxmodifier: 'Adjusts entity hitbox scale for combat.',
    armorhud: 'Shows armor status and durability overlay.'
};

const KONAMI_CODE_SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA'
];

function getKonamiRainbowStyleTag() {
    return document.getElementById('nexus-rainbow-accent');
}

function removeKonamiRainbowStyleTag() {
    const style = getKonamiRainbowStyleTag();
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
}

function restoreSavedAccentAfterKonami() {
    const savedAccent = String(localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff').trim() || '#00d9ff';
    document.documentElement.style.setProperty('--accent', savedAccent);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgbCsv(savedAccent));
    applyGradientAccentRuntime(savedAccent);
}

function stopKonamiRainbowMode() {
    removeKonamiRainbowStyleTag();
    if (konamiCodeState.timeoutId) {
        clearTimeout(konamiCodeState.timeoutId);
        konamiCodeState.timeoutId = null;
    }
    konamiCodeState.active = false;
    restoreSavedAccentAfterKonami();
}

function activateKonamiRainbowMode() {
    let style = getKonamiRainbowStyleTag();
    if (!style) {
        style = document.createElement('style');
        style.id = 'nexus-rainbow-accent';
        document.head.appendChild(style);
    }
    style.textContent = `
@keyframes rainbowCycle {
    0%   { --accent: #ff0040; --accent-rgb: 255,0,64; }
    16%  { --accent: #ff8800; --accent-rgb: 255,136,0; }
    33%  { --accent: #ffee00; --accent-rgb: 255,238,0; }
    50%  { --accent: #00ff88; --accent-rgb: 0,255,136; }
    66%  { --accent: #00d9ff; --accent-rgb: 0,217,255; }
    83%  { --accent: #aa00ff; --accent-rgb: 170,0,255; }
    100% { --accent: #ff0040; --accent-rgb: 255,0,64; }
}
:root {
    animation: rainbowCycle 1.2s linear infinite;
}
`.trim();

    konamiCodeState.active = true;
    if (konamiCodeState.timeoutId) {
        clearTimeout(konamiCodeState.timeoutId);
    }
    konamiCodeState.timeoutId = setTimeout(() => {
        stopKonamiRainbowMode();
    }, 5000);
    showNotification('🌈 RAINBOW MODE', { duration: 5000 });
}

function bindKonamiPreviewTrigger() {
    if (konamiCodeState.previewBound) return;
    const preview = document.getElementById('gradientAccentPreview');
    if (!preview) return;

    konamiCodeState.previewBound = true;
    preview.addEventListener('click', () => {
        const now = Date.now();
        konamiCodeState.previewClickStamps = konamiCodeState.previewClickStamps
            .filter(stamp => now - stamp <= 1400);
        konamiCodeState.previewClickStamps.push(now);
        if (konamiCodeState.previewClickStamps.length < 3) return;

        konamiCodeState.previewClickStamps = [];
        activateKonamiRainbowMode();
    });
}

function initializeKonamiCode() {
    if (konamiCodeState.listenerBound) return;
    konamiCodeState.listenerBound = true;
    bindKonamiPreviewTrigger();

    document.addEventListener('keydown', (event) => {
        if (!event || typeof event.code !== 'string' || !event.code) return;
        if (event.repeat) return;

        konamiCodeState.buffer.push(event.code);
        if (konamiCodeState.buffer.length > KONAMI_CODE_SEQUENCE.length) {
            konamiCodeState.buffer.shift();
        }

        const matched = KONAMI_CODE_SEQUENCE.every((code, index) => konamiCodeState.buffer[index] === code);
        if (!matched) return;

        activateKonamiRainbowMode();
    });
}

function getHackToggles() {
    return Array.from(document.querySelectorAll('.toggle-input[data-feature]')).filter(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        return feature && feature !== 'null' && feature !== 'undefined';
    });
}

function getFeatureFromCard(card) {
    const toggle = card ? card.querySelector('.toggle-input[data-feature]') : null;
    const feature = (toggle?.getAttribute('data-feature') || '').trim().toLowerCase();
    return feature && feature !== 'null' && feature !== 'undefined' ? feature : '';
}

function getTargetSelectorStorageKey(featureName) {
    return `nexus-target-${String(featureName || '').trim().toLowerCase()}`;
}

function getSavedTargetSelectorValue(featureName) {
    const key = getTargetSelectorStorageKey(featureName);
    const saved = String(localStorage.getItem(key) || 'nearest').trim().toLowerCase();
    return TARGET_SELECTOR_OPTIONS.some(option => option.value === saved) ? saved : 'nearest';
}

function saveTargetSelectorValue(featureName, value) {
    const key = getTargetSelectorStorageKey(featureName);
    const normalized = String(value || 'nearest').trim().toLowerCase();
    const safeValue = TARGET_SELECTOR_OPTIONS.some(option => option.value === normalized) ? normalized : 'nearest';
    localStorage.setItem(key, safeValue);
    return safeValue;
}

function buildTargetSelector(featureName) {
    const savedValue = getSavedTargetSelectorValue(featureName);
    const wrap = document.createElement('div');
    wrap.className = 'target-selector';
    wrap.setAttribute('data-target-selector', featureName);

    const label = document.createElement('span');
    label.className = 'target-selector-label';
    label.textContent = 'Priority';
    wrap.appendChild(label);

    const options = document.createElement('div');
    options.className = 'target-selector-options';
    TARGET_SELECTOR_OPTIONS.forEach(option => {
        const button = document.createElement('button');
        button.className = 'target-opt';
        button.type = 'button';
        button.setAttribute('data-value', option.value);
        button.setAttribute('aria-pressed', option.value === savedValue ? 'true' : 'false');
        button.innerHTML = `
            <span class="target-opt-icon">${option.icon}</span>
            <span>${option.label}</span>
        `;
        button.addEventListener('click', () => {
            const nextValue = saveTargetSelectorValue(featureName, option.value);
            options.querySelectorAll('.target-opt').forEach(btn => {
                btn.setAttribute('aria-pressed', btn.getAttribute('data-value') === nextValue ? 'true' : 'false');
            });
        });
        options.appendChild(button);
    });
    wrap.appendChild(options);
    return wrap;
}

function initializeTargetSelectors() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        const feature = getFeatureFromCard(card);
        if (!TARGET_SELECTOR_FEATURES.has(feature)) return;
        if (card.querySelector(`.target-selector[data-target-selector="${feature}"]`)) return;
        const header = card.querySelector('.feature-header');
        if (!header || !header.parentNode) return;
        const selector = buildTargetSelector(feature);
        header.insertAdjacentElement('afterend', selector);
    });
}

function ensureFeatureTooltipElement() {
    if (featureTooltipState.element && document.body.contains(featureTooltipState.element)) {
        return featureTooltipState.element;
    }
    let tooltip = document.getElementById('featureTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'feature-tooltip';
        tooltip.id = 'featureTooltip';
        tooltip.setAttribute('aria-hidden', 'true');
        document.body.appendChild(tooltip);
    }
    featureTooltipState.element = tooltip;
    return tooltip;
}

function getFeatureDescription(card) {
    const feature = getFeatureFromCard(card);
    if (!feature) return '';
    return FEATURE_DESCRIPTIONS[feature] || '';
}

function positionFeatureTooltip(card, tooltip) {
    const cardRect = card.getBoundingClientRect();
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';
    const tipRect = tooltip.getBoundingClientRect();
    const margin = 10;
    const centeredLeft = cardRect.left + (cardRect.width / 2) - (tipRect.width / 2);
    const clampedLeft = Math.max(margin, Math.min(window.innerWidth - tipRect.width - margin, centeredLeft));
    const top = Math.max(margin, cardRect.top - tipRect.height - 12);
    tooltip.style.left = `${clampedLeft}px`;
    tooltip.style.top = `${top}px`;
}

function showFeatureTooltip(card) {
    const tooltip = ensureFeatureTooltipElement();
    const description = getFeatureDescription(card);
    if (!description) return;
    tooltip.textContent = description;
    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');
    featureTooltipState.activeCard = card;
    positionFeatureTooltip(card, tooltip);
}

function hideFeatureTooltip() {
    const tooltip = ensureFeatureTooltipElement();
    tooltip.classList.remove('is-visible');
    tooltip.setAttribute('aria-hidden', 'true');
    featureTooltipState.activeCard = null;
}

function setupFeatureCardTooltips() {
    const tooltip = ensureFeatureTooltipElement();
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        if (card.dataset.tooltipBound === 'true') return;
        const feature = getFeatureFromCard(card);
        if (!feature) return;
        card.removeAttribute('title');
        card.dataset.tooltipBound = 'true';
        card.addEventListener('mouseenter', () => {
            showFeatureTooltip(card);
        });
        card.addEventListener('mouseleave', () => {
            hideFeatureTooltip();
        });
    });

    if (tooltip.dataset.resizeBound !== 'true') {
        window.addEventListener('resize', () => {
            if (!featureTooltipState.activeCard || !tooltip.classList.contains('is-visible')) return;
            positionFeatureTooltip(featureTooltipState.activeCard, tooltip);
        });
        window.addEventListener('scroll', () => {
            if (!featureTooltipState.activeCard || !tooltip.classList.contains('is-visible')) return;
            positionFeatureTooltip(featureTooltipState.activeCard, tooltip);
        }, true);
        tooltip.dataset.resizeBound = 'true';
    }
}

function getSavedStartupPageSetting() {
    const saved = String(localStorage.getItem(STORAGE_KEYS.STARTUP_PAGE) || 'combat').trim().toLowerCase();
    return STARTUP_PAGE_OPTIONS.includes(saved) ? saved : 'combat';
}

function getSavedBootPowerConfirm() {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOT_POWER_CONFIRM);
    if (saved === null) return true;
    return saved !== 'false';
}

function getSavedWelcomeSplashEnabled() {
    const saved = localStorage.getItem(STORAGE_KEYS.WELCOME_SPLASH);
    if (saved === null) return true;
    return saved !== 'false';
}

function getSavedGradientAccentEnabled() {
    return localStorage.getItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED) === 'true';
}

function getSavedGradientAccentColor2() {
    const raw = String(localStorage.getItem(STORAGE_KEYS.GRADIENT_ACCENT_2) || '#7c3aed').trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : '#7c3aed';
}

function getSavedBgPattern() {
    const saved = String(localStorage.getItem(STORAGE_KEYS.BG_PATTERN) || 'none').trim().toLowerCase();
    const allowed = new Set(['none', 'nexus', 'dots', 'grid', 'hexagon', 'matrix']);
    return allowed.has(saved) ? saved : 'none';
}

function getSavedSidebarIconOverrides() {
    const parsed = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.SIDEBAR_ICONS), {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function getColorInputLabel(input) {
    if (!input) return 'COLOR';
    const explicit = String(input.getAttribute('data-color-label') || '').trim();
    if (explicit) return explicit.toUpperCase();

    const previousLabel = input.previousElementSibling && /^(label|span)$/i.test(input.previousElementSibling.tagName)
        ? String(input.previousElementSibling.textContent || '').trim()
        : '';
    if (previousLabel) return previousLabel.toUpperCase();

    const cardLabel = input.closest('.setting-card')?.querySelector('label, .setting-label');
    const cardText = String(cardLabel?.textContent || '').trim();
    return (cardText || 'COLOR').toUpperCase();
}

function getSelectControlLabel(select) {
    if (!select) return 'Select option';
    const previousLabel = select.previousElementSibling && /^(label|span)$/i.test(select.previousElementSibling.tagName)
        ? String(select.previousElementSibling.textContent || '').trim()
        : '';
    if (previousLabel) return previousLabel;

    const cardLabel = select.closest('.setting-card')?.querySelector('label, .setting-label');
    const cardText = String(cardLabel?.textContent || '').trim();
    return cardText || 'Select option';
}

function getNumberInputLabel(input) {
    if (!input) return 'Value';
    const explicit = String(input.getAttribute('aria-label') || input.getAttribute('data-input-label') || '').trim();
    if (explicit) return explicit;

    const previousLabel = input.previousElementSibling && /^(label|span)$/i.test(input.previousElementSibling.tagName)
        ? String(input.previousElementSibling.textContent || '').trim()
        : '';
    if (previousLabel) return previousLabel;

    const wrappingLabel = input.closest('label');
    const nestedLabel = String(wrappingLabel?.querySelector('.ui-color-field-label, .setting-label, span')?.textContent || '').trim();
    if (nestedLabel) return nestedLabel;

    const cardLabel = input.closest('.setting, .setting-card, .feature-card, .input-group')?.querySelector('label, .setting-label');
    const cardText = String(cardLabel?.textContent || '').trim();
    return cardText || 'Value';
}

function collectCustomChromeTargets(scope, selector) {
    const targets = [];
    if (!scope) return targets;
    if (scope instanceof Element && scope.matches(selector)) {
        targets.push(scope);
    }
    if (scope instanceof Document || scope instanceof Element) {
        scope.querySelectorAll(selector).forEach(node => targets.push(node));
    }
    return targets;
}

function dispatchNativeControlEvent(control, type) {
    if (!control) return;
    control.dispatchEvent(new Event(type, { bubbles: true }));
}

function observeCustomChromeProperty(control, propertyName, syncFn) {
    if (!control || typeof syncFn !== 'function') return;
    const marker = `__customChromeObserved_${propertyName}`;
    if (control[marker] === true) return;

    const proto = Object.getPrototypeOf(control);
    const descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
    if (!descriptor || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') return;

    try {
        Object.defineProperty(control, propertyName, {
            configurable: true,
            enumerable: descriptor.enumerable,
            get() {
                return descriptor.get.call(this);
            },
            set(nextValue) {
                descriptor.set.call(this, nextValue);
                syncFn();
            }
        });
        control[marker] = true;
    } catch (_) {
        // Some DOM properties may be non-configurable in older engines.
    }
}

function closeCustomInputChromeOverlays(exceptHost = null) {
    document.querySelectorAll('.ui-select-wrap.is-open, .ui-color-wrap.is-open').forEach(host => {
        if (exceptHost && host === exceptHost) return;
        host.classList.remove('is-open');
        const trigger = host.querySelector('.ui-select-trigger, .ui-color-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        const panel = host.querySelector('.ui-select-menu, .ui-color-panel');
        if (panel) panel.hidden = true;
        updateFloatingControlCardState(host);
    });
}

function updateFloatingControlCardState(host) {
    const card = host?.closest?.('.setting-card, .feature-card');
    if (!card) return;
    const hasOpenOverlay = Boolean(card.querySelector('.ui-select-wrap.is-open, .ui-color-wrap.is-open'));
    card.classList.toggle('ui-floating-control-open', hasOpenOverlay);
}

function bindCustomInputChromeDismissHandlers() {
    if (customInputChromeDismissHandlersBound) return;
    customInputChromeDismissHandlersBound = true;

    document.addEventListener('pointerdown', event => {
        if (event.target.closest('.ui-select-wrap, .ui-color-wrap')) return;
        closeCustomInputChromeOverlays();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        closeCustomInputChromeOverlays();
    });
}

function startCustomChromePointerDrag(startEvent, onMove) {
    if (typeof onMove !== 'function') return;

    const handleMove = event => onMove(event, false);
    const handleEnd = event => {
        cleanup();
        onMove(event, true);
    };
    const cleanup = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleEnd);
        window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    onMove(startEvent, false);
}

function normalizeHexTextInput(rawValue) {
    const cleaned = String(rawValue || '').trim().replace(/^#/, '').replace(/[^0-9a-fA-F]/g, '');
    if (cleaned.length === 3 || cleaned.length === 6) {
        return normalizeHexColor(`#${cleaned}`, '#00d9ff');
    }
    return '';
}

function clampColorUnit(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(1, numeric));
}

function clampColorChannel(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(255, Math.round(numeric)));
}

function normalizeHueDegrees(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    const normalized = numeric % 360;
    return normalized < 0 ? normalized + 360 : normalized;
}

function hexToRgbObject(color, fallback = { r: 0, g: 217, b: 255 }) {
    const normalized = normalizeHexColor(color, rgbToHexColor(fallback));
    const raw = normalized.replace('#', '');
    return {
        r: parseInt(raw.slice(0, 2), 16),
        g: parseInt(raw.slice(2, 4), 16),
        b: parseInt(raw.slice(4, 6), 16)
    };
}

function rgbToHexColor({ r = 0, g = 0, b = 0 } = {}) {
    const parts = [r, g, b]
        .map(channel => clampColorChannel(channel).toString(16).padStart(2, '0'))
        .join('');
    return `#${parts}`;
}

function rgbToHsvObject({ r = 0, g = 0, b = 0 } = {}) {
    const red = clampColorChannel(r) / 255;
    const green = clampColorChannel(g) / 255;
    const blue = clampColorChannel(b) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;

    if (delta > 0) {
        if (max === red) {
            hue = 60 * (((green - blue) / delta) % 6);
        } else if (max === green) {
            hue = 60 * (((blue - red) / delta) + 2);
        } else {
            hue = 60 * (((red - green) / delta) + 4);
        }
    }

    return {
        h: normalizeHueDegrees(hue),
        s: max === 0 ? 0 : delta / max,
        v: max
    };
}

function hsvToRgbObject({ h = 0, s = 0, v = 0 } = {}) {
    const hue = normalizeHueDegrees(h);
    const saturation = clampColorUnit(s);
    const value = clampColorUnit(v);
    const chroma = value * saturation;
    const segment = hue / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    let red = 0;
    let green = 0;
    let blue = 0;

    if (segment >= 0 && segment < 1) {
        red = chroma;
        green = x;
    } else if (segment >= 1 && segment < 2) {
        red = x;
        green = chroma;
    } else if (segment >= 2 && segment < 3) {
        green = chroma;
        blue = x;
    } else if (segment >= 3 && segment < 4) {
        green = x;
        blue = chroma;
    } else if (segment >= 4 && segment < 5) {
        red = x;
        blue = chroma;
    } else {
        red = chroma;
        blue = x;
    }

    const match = value - chroma;
    return {
        r: clampColorChannel((red + match) * 255),
        g: clampColorChannel((green + match) * 255),
        b: clampColorChannel((blue + match) * 255)
    };
}

function syncCustomSelectDisplays() {
    customSelectChromeControllers.forEach(controller => {
        controller?.sync?.();
    });
}

function syncCustomNumberDisplays() {
    customNumberChromeControllers.forEach(controller => {
        controller?.sync?.();
    });
}

function refreshLegacyColorFieldDisplays() {
    document.querySelectorAll(LEGACY_COLOR_INPUT_SELECTOR).forEach(input => {
        if (input.matches(CUSTOM_COLOR_INPUT_SELECTOR)) return;
        if (input.dataset.colorEnhanced !== 'true') return;
        const shell = input.parentElement?.querySelector('.color-field-shell');
        const swatch = shell?.querySelector('.color-field-swatch');
        const valueEl = shell?.querySelector('.color-field-value');
        const labelEl = shell?.querySelector('.color-field-label');
        const normalized = /^#[0-9a-fA-F]{6}$/.test(String(input.value || '').trim())
            ? String(input.value).toUpperCase()
            : '#000000';
        if (swatch) swatch.style.setProperty('--color-chip', normalized);
        if (valueEl) valueEl.textContent = normalized;
        if (labelEl) labelEl.textContent = getColorInputLabel(input);
    });
}

function refreshCustomColorInputDisplays() {
    refreshLegacyColorFieldDisplays();
    customColorChromeControllers.forEach(controller => {
        controller?.sync?.();
    });
}

function enhanceLegacyColorInputsWithChrome(scope = document) {
    collectCustomChromeTargets(scope, LEGACY_COLOR_INPUT_SELECTOR).forEach(input => {
        if (input.matches(CUSTOM_COLOR_INPUT_SELECTOR)) return;
        if (input.dataset.colorEnhanced === 'true') return;
        if (!String(input.getAttribute('data-color-label') || '').trim()) {
            input.setAttribute('data-color-label', getColorInputLabel(input));
        }

        const compact = input.classList.contains('color-input');
        const wrap = document.createElement('div');
        wrap.className = `color-field-wrap${compact ? ' is-compact' : ''}`;
        const shell = document.createElement('div');
        shell.className = `color-field-shell${compact ? ' is-compact' : ''}`;
        shell.innerHTML = `
            <span class="color-field-swatch" aria-hidden="true"></span>
            <span class="color-field-meta">
                <span class="color-field-label"></span>
                <span class="color-field-value"></span>
            </span>
        `;

        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(shell);
        wrap.appendChild(input);
        input.dataset.colorEnhanced = 'true';

        const sync = () => refreshCustomColorInputDisplays();
        input.addEventListener('input', sync);
        input.addEventListener('change', sync);
    });
}

function getNumberInputStepAmount(input) {
    const rawStep = String(input?.getAttribute('step') || '').trim().toLowerCase();
    if (!rawStep || rawStep === 'any') return 1;
    const parsed = Number(rawStep);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getNumberInputStepPrecision(stepAmount) {
    const raw = String(stepAmount ?? '').trim().toLowerCase();
    if (!raw || raw === 'any') return 0;
    const exponentMatch = raw.match(/e-(\d+)$/);
    if (exponentMatch) return Number(exponentMatch[1]) || 0;
    const decimalPart = raw.split('.')[1];
    return decimalPart ? decimalPart.length : 0;
}

function fallbackStepNumberInput(input, direction) {
    const stepAmount = getNumberInputStepAmount(input);
    const precision = getNumberInputStepPrecision(stepAmount);
    const min = Number(input.min);
    const max = Number(input.max);
    const hasMin = Number.isFinite(min);
    const hasMax = Number.isFinite(max);
    const current = Number(input.value);
    const base = hasMin ? min : 0;
    const startValue = Number.isFinite(current)
        ? current
        : (direction > 0 ? (hasMin ? min : base) : (hasMax ? max : base));

    let nextValue = startValue + (stepAmount * direction);
    if (hasMin) nextValue = Math.max(min, nextValue);
    if (hasMax) nextValue = Math.min(max, nextValue);

    const alignedValue = base + Math.round((nextValue - base) / stepAmount) * stepAmount;
    const clampedValue = hasMin ? Math.max(min, alignedValue) : alignedValue;
    const finalValue = hasMax ? Math.min(max, clampedValue) : clampedValue;
    const formatted = precision > 0
        ? String(Number(finalValue.toFixed(precision)))
        : String(Math.round(finalValue));
    input.value = formatted;
}

function nudgeNumberInput(input, direction) {
    if (!input || input.disabled || input.readOnly) return;
    const previousValue = input.value;

    try {
        if (direction > 0) {
            input.stepUp();
        } else {
            input.stepDown();
        }
    } catch (_) {
        fallbackStepNumberInput(input, direction);
    }

    if (input.value === previousValue) return;
    input.focus({ preventScroll: true });
    dispatchNativeControlEvent(input, 'input');
    dispatchNativeControlEvent(input, 'change');
}

function enhanceSingleNumberInput(input) {
    if (!input || input.dataset.customNumberChrome === 'true') return;
    input.dataset.customNumberChrome = 'true';

    const host = document.createElement('div');
    host.className = 'ui-number-wrap';

    NUMBER_CHROME_HOST_CLASS_NAMES.forEach(className => {
        if (input.classList.contains(className)) {
            host.classList.add(className);
        }
    });

    if (input.closest('.ui-color-field')) {
        host.classList.add('is-color-field');
    } else {
        const measuredWidth = input.getBoundingClientRect().width;
        if (measuredWidth > 0 && Math.abs(measuredWidth - 70) > 1) {
            host.style.width = `${Math.round(measuredWidth)}px`;
            host.style.minWidth = `${Math.round(measuredWidth)}px`;
        }
    }

    ['width', 'minWidth', 'maxWidth', 'flex', 'flexBasis', 'flexGrow', 'flexShrink'].forEach(propertyName => {
        if (!input.style[propertyName]) return;
        host.style[propertyName] = input.style[propertyName];
        input.style[propertyName] = '';
    });

    const stepper = document.createElement('div');
    stepper.className = 'ui-number-stepper';

    const label = getNumberInputLabel(input);
    const incrementButton = document.createElement('button');
    incrementButton.type = 'button';
    incrementButton.className = 'ui-number-step ui-number-step-up';
    incrementButton.setAttribute('aria-label', `Increase ${label}`);
    incrementButton.tabIndex = -1;
    incrementButton.innerHTML = '<span class="ui-number-step-glyph" aria-hidden="true">▲</span>';

    const decrementButton = document.createElement('button');
    decrementButton.type = 'button';
    decrementButton.className = 'ui-number-step ui-number-step-down';
    decrementButton.setAttribute('aria-label', `Decrease ${label}`);
    decrementButton.tabIndex = -1;
    decrementButton.innerHTML = '<span class="ui-number-step-glyph" aria-hidden="true">▼</span>';

    stepper.appendChild(incrementButton);
    stepper.appendChild(decrementButton);

    input.parentNode.insertBefore(host, input);
    host.appendChild(input);
    host.appendChild(stepper);

    const preventFocusShift = event => {
        event.preventDefault();
    };

    incrementButton.addEventListener('pointerdown', preventFocusShift);
    decrementButton.addEventListener('pointerdown', preventFocusShift);

    incrementButton.addEventListener('click', event => {
        event.preventDefault();
        nudgeNumberInput(input, 1);
    });

    decrementButton.addEventListener('click', event => {
        event.preventDefault();
        nudgeNumberInput(input, -1);
    });

    const sync = () => {
        const disabled = Boolean(input.disabled || input.readOnly);
        host.classList.toggle('is-disabled', disabled);
        incrementButton.disabled = disabled;
        decrementButton.disabled = disabled;
    };

    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    observeCustomChromeProperty(input, 'disabled', sync);
    observeCustomChromeProperty(input, 'readOnly', sync);

    sync();
    customNumberChromeControllers.set(input, { sync });
}

function enhanceNumberInputsWithCustomChrome(scope = document) {
    collectCustomChromeTargets(scope, CUSTOM_NUMBER_INPUT_SELECTOR).forEach(enhanceSingleNumberInput);
}

function enhanceSingleCustomSelect(select) {
    if (!select || select.dataset.customSelectChrome === 'true') return;
    select.dataset.customSelectChrome = 'true';
    select.classList.add('ui-native-control');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const host = document.createElement('div');
    host.className = 'ui-select-wrap';
    if (select.classList.contains('combo-box')) host.classList.add('is-combo-box');
    if (select.classList.contains('setting-select')) host.classList.add('is-setting-select');
    Array.from(select.classList).forEach(className => {
        if (className === 'combo-box' || className === 'setting-select' || className === 'ui-native-control') return;
        host.classList.add(className);
    });

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', getSelectControlLabel(select));

    const valueEl = document.createElement('span');
    valueEl.className = 'ui-select-value';
    const arrowEl = document.createElement('span');
    arrowEl.className = 'ui-select-arrow';
    arrowEl.setAttribute('aria-hidden', 'true');
    trigger.appendChild(valueEl);
    trigger.appendChild(arrowEl);

    const menu = document.createElement('div');
    menu.className = 'ui-select-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'listbox');

    select.parentNode.insertBefore(host, select);
    host.appendChild(trigger);
    host.appendChild(menu);
    host.appendChild(select);

    let optionButtons = [];

    const getEnabledButtons = () => optionButtons.filter(button => !button.disabled);
    const focusSelectedButton = () => {
        const available = getEnabledButtons();
        if (!available.length) return;
        const selectedButton = available.find(button => button.dataset.value === select.value) || available[0];
        selectedButton.focus();
    };
    const focusRelativeButton = delta => {
        const available = getEnabledButtons();
        if (!available.length) return;
        const currentIndex = available.indexOf(document.activeElement);
        const selectedIndex = Math.max(0, available.findIndex(button => button.dataset.value === select.value));
        const baseIndex = currentIndex >= 0 ? currentIndex : selectedIndex;
        const nextIndex = (baseIndex + delta + available.length) % available.length;
        available[nextIndex].focus();
    };
    const setOpen = (open, { returnFocus = false } = {}) => {
        if (open && trigger.disabled) return;
        if (open) {
            closeCustomInputChromeOverlays(host);
            host.classList.add('is-open');
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            updateFloatingControlCardState(host);
            requestAnimationFrame(() => focusSelectedButton());
            return;
        }
        host.classList.remove('is-open');
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        updateFloatingControlCardState(host);
        if (returnFocus) trigger.focus();
    };

    const rebuildOptions = () => {
        optionButtons = [];
        menu.innerHTML = '';
        Array.from(select.options).forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-select-option';
            button.setAttribute('role', 'option');
            button.dataset.value = option.value;
            button.disabled = option.disabled;
            button.textContent = String(option.textContent || option.value || '').trim();

            button.addEventListener('click', () => {
                if (button.disabled) return;
                if (select.value !== option.value) {
                    select.value = option.value;
                    dispatchNativeControlEvent(select, 'input');
                    dispatchNativeControlEvent(select, 'change');
                } else {
                    sync();
                }
                setOpen(false, { returnFocus: true });
            });

            button.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusRelativeButton(1);
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusRelativeButton(-1);
                } else if (event.key === 'Home') {
                    event.preventDefault();
                    getEnabledButtons()[0]?.focus();
                } else if (event.key === 'End') {
                    event.preventDefault();
                    const enabledButtons = getEnabledButtons();
                    enabledButtons[enabledButtons.length - 1]?.focus();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    setOpen(false, { returnFocus: true });
                } else if (event.key === 'Tab') {
                    setOpen(false);
                }
            });

            menu.appendChild(button);
            optionButtons.push(button);
        });
    };

    const sync = () => {
        const options = Array.from(select.options);
        const selectedOption = options.find(option => option.value === select.value)
            || options[select.selectedIndex]
            || options.find(option => !option.disabled)
            || null;
        const activeValue = selectedOption ? selectedOption.value : '';

        valueEl.textContent = selectedOption ? String(selectedOption.textContent || selectedOption.value || '').trim() : 'Select option';
        trigger.disabled = Boolean(select.disabled);
        host.classList.toggle('is-disabled', Boolean(select.disabled));

        optionButtons.forEach(button => {
            const isSelected = button.dataset.value === activeValue;
            button.classList.toggle('is-selected', isSelected);
            button.classList.toggle('is-disabled', button.disabled);
            button.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });

        if (select.disabled) {
            setOpen(false);
        }
    };

    trigger.addEventListener('click', () => {
        if (host.classList.contains('is-open')) {
            setOpen(false, { returnFocus: true });
        } else {
            setOpen(true);
        }
    });

    trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (host.classList.contains('is-open')) {
                setOpen(false, { returnFocus: true });
            } else {
                setOpen(true);
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!host.classList.contains('is-open')) {
                setOpen(true);
            } else {
                focusRelativeButton(1);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!host.classList.contains('is-open')) {
                setOpen(true);
            } else {
                focusRelativeButton(-1);
            }
        } else if (event.key === 'Escape') {
            setOpen(false, { returnFocus: true });
        }
    });

    host.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
            if (!host.contains(document.activeElement)) {
                setOpen(false);
            }
        });
    });

    select.addEventListener('input', sync);
    select.addEventListener('change', sync);
    observeCustomChromeProperty(select, 'value', sync);
    observeCustomChromeProperty(select, 'disabled', sync);

    const optionsObserver = new MutationObserver(() => {
        rebuildOptions();
        sync();
    });
    optionsObserver.observe(select, { childList: true });

    rebuildOptions();
    sync();
    customSelectChromeControllers.set(select, { sync, close: () => setOpen(false) });
}

function enhanceSingleCustomColorInput(input) {
    if (!input || input.dataset.customColorChrome === 'true') return;
    input.dataset.customColorChrome = 'true';
    input.classList.add('ui-native-control');
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');

    const compact = input.classList.contains('color-input');
    const host = document.createElement('div');
    host.className = `ui-color-wrap${compact ? ' is-compact' : ''}`;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-color-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'dialog');

    const triggerSwatch = document.createElement('span');
    triggerSwatch.className = 'ui-color-swatch';
    triggerSwatch.setAttribute('aria-hidden', 'true');
    const triggerMeta = document.createElement('span');
    triggerMeta.className = 'ui-color-trigger-meta';
    const triggerLabel = document.createElement('span');
    triggerLabel.className = 'ui-color-trigger-label';
    triggerLabel.textContent = getColorInputLabel(input);
    const triggerValue = document.createElement('span');
    triggerValue.className = 'ui-color-trigger-value';
    const triggerChevron = document.createElement('span');
    triggerChevron.className = 'ui-color-trigger-chevron';
    triggerChevron.setAttribute('aria-hidden', 'true');
    triggerMeta.appendChild(triggerLabel);
    triggerMeta.appendChild(triggerValue);
    trigger.appendChild(triggerSwatch);
    trigger.appendChild(triggerMeta);
    trigger.appendChild(triggerChevron);

    const panel = document.createElement('div');
    panel.className = 'ui-color-panel';
    panel.hidden = true;
    panel.innerHTML = `
        <div class="ui-color-panel-header">
            <span class="ui-color-panel-preview" aria-hidden="true"></span>
            <span class="ui-color-panel-copy">
                <span class="ui-color-panel-kicker">Live Preview</span>
                <span class="ui-color-panel-value"></span>
            </span>
            <button type="button" class="ui-color-eyedropper">PICK SCREEN</button>
        </div>
        <div class="ui-color-spectrum" tabindex="0" aria-label="Color spectrum">
            <span class="ui-color-spectrum-handle" aria-hidden="true"></span>
        </div>
        <div class="ui-color-slider-row">
            <span class="ui-color-slider-label">Hue</span>
            <div class="ui-color-hue" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="360" aria-label="Hue slider">
                <span class="ui-color-hue-thumb" aria-hidden="true"></span>
            </div>
        </div>
        <div class="ui-color-fields">
            <label class="ui-color-field">
                <span class="ui-color-field-label">HEX</span>
                <input type="text" class="modal-input ui-color-input-hex" maxlength="7" spellcheck="false" autocomplete="off">
            </label>
            <label class="ui-color-field">
                <span class="ui-color-field-label">R</span>
                <input type="number" class="spinbox ui-color-input-r" min="0" max="255">
            </label>
            <label class="ui-color-field">
                <span class="ui-color-field-label">G</span>
                <input type="number" class="spinbox ui-color-input-g" min="0" max="255">
            </label>
            <label class="ui-color-field">
                <span class="ui-color-field-label">B</span>
                <input type="number" class="spinbox ui-color-input-b" min="0" max="255">
            </label>
        </div>
    `;

    input.parentNode.insertBefore(host, input);
    host.appendChild(trigger);
    host.appendChild(panel);
    host.appendChild(input);

    const panelPreview = panel.querySelector('.ui-color-panel-preview');
    const panelValue = panel.querySelector('.ui-color-panel-value');
    const spectrum = panel.querySelector('.ui-color-spectrum');
    const spectrumHandle = panel.querySelector('.ui-color-spectrum-handle');
    const hueTrack = panel.querySelector('.ui-color-hue');
    const hueThumb = panel.querySelector('.ui-color-hue-thumb');
    const eyeDropperBtn = panel.querySelector('.ui-color-eyedropper');
    const hexField = panel.querySelector('.ui-color-input-hex');
    const redField = panel.querySelector('.ui-color-input-r');
    const greenField = panel.querySelector('.ui-color-input-g');
    const blueField = panel.querySelector('.ui-color-input-b');
    let state = rgbToHsvObject(hexToRgbObject(normalizeHexColor(input.value, '#00d9ff')));
    const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

    enhanceNumberInputsWithCustomChrome(panel);

    const setOpen = (open, { focusPanel = false, returnFocus = false } = {}) => {
        if (open && trigger.disabled) return;
        if (open) {
            closeCustomInputChromeOverlays(host);
            host.classList.add('is-open');
            panel.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            updateFloatingControlCardState(host);
            if (focusPanel) {
                requestAnimationFrame(() => spectrum.focus());
            }
            return;
        }
        host.classList.remove('is-open');
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        updateFloatingControlCardState(host);
        if (returnFocus) trigger.focus();
    };

    const render = () => {
        const rgb = hsvToRgbObject(state);
        const currentHex = rgbToHexColor(rgb).toUpperCase();
        const hueHex = rgbToHexColor(hsvToRgbObject({ h: state.h, s: 1, v: 1 }));

        host.style.setProperty('--ui-color-current', currentHex);
        host.style.setProperty('--ui-color-hue', hueHex);
        triggerValue.textContent = currentHex;
        panelValue.textContent = currentHex;
        spectrum.style.background = `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #000000 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, ${hueHex} 100%)`;
        spectrumHandle.style.left = `${(clampColorUnit(state.s) * 100).toFixed(2)}%`;
        spectrumHandle.style.top = `${((1 - clampColorUnit(state.v)) * 100).toFixed(2)}%`;
        hueThumb.style.left = `${((normalizeHueDegrees(state.h) / 360) * 100).toFixed(2)}%`;
        hueTrack.setAttribute('aria-valuenow', String(Math.round(normalizeHueDegrees(state.h))));
        hueTrack.setAttribute('aria-valuetext', `${Math.round(normalizeHueDegrees(state.h))} degrees`);
        hexField.value = currentHex;
        redField.value = String(rgb.r);
        greenField.value = String(rgb.g);
        blueField.value = String(rgb.b);
    };

    const sync = () => {
        state = rgbToHsvObject(hexToRgbObject(normalizeHexColor(input.value, '#00d9ff')));
        trigger.disabled = Boolean(input.disabled);
        host.classList.toggle('is-disabled', Boolean(input.disabled));
        if (input.disabled) {
            setOpen(false);
        }
        render();
    };

    const commitState = ({ emitInput = true, emitChange = false } = {}) => {
        const nextHex = rgbToHexColor(hsvToRgbObject(state));
        if (input.value !== nextHex) {
            input.value = nextHex;
        }
        render();
        if (emitInput) dispatchNativeControlEvent(input, 'input');
        if (emitChange) dispatchNativeControlEvent(input, 'change');
    };

    const updateStateFromRgb = (rgb, options = {}) => {
        state = rgbToHsvObject(rgb);
        commitState(options);
    };

    const updateFromSpectrumPointer = (event, isFinal) => {
        const rect = spectrum.getBoundingClientRect();
        const saturation = clampColorUnit((event.clientX - rect.left) / rect.width);
        const value = 1 - clampColorUnit((event.clientY - rect.top) / rect.height);
        state.s = saturation;
        state.v = value;
        commitState({ emitInput: true, emitChange: isFinal });
    };

    const updateFromHuePointer = (event, isFinal) => {
        const rect = hueTrack.getBoundingClientRect();
        const ratio = clampColorUnit((event.clientX - rect.left) / rect.width);
        state.h = ratio * 359.99;
        commitState({ emitInput: true, emitChange: isFinal });
    };

    const bindRgbField = (field, channel) => {
        field.addEventListener('input', () => {
            const digits = String(field.value || '').replace(/[^\d]/g, '').slice(0, 3);
            field.value = digits;
            if (!digits) return;
            const rgb = hsvToRgbObject(state);
            rgb[channel] = clampColorChannel(digits);
            updateStateFromRgb(rgb, { emitInput: true, emitChange: false });
        });

        field.addEventListener('change', () => {
            if (field.value === '') {
                render();
                return;
            }
            const rgb = hsvToRgbObject(state);
            rgb[channel] = clampColorChannel(field.value);
            updateStateFromRgb(rgb, { emitInput: true, emitChange: true });
        });
    };

    trigger.addEventListener('click', () => {
        if (host.classList.contains('is-open')) {
            setOpen(false, { returnFocus: true });
        } else {
            setOpen(true, { focusPanel: true });
        }
    });

    trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (host.classList.contains('is-open')) {
                setOpen(false, { returnFocus: true });
            } else {
                setOpen(true, { focusPanel: true });
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true, { focusPanel: true });
        } else if (event.key === 'Escape') {
            setOpen(false, { returnFocus: true });
        }
    });

    spectrum.addEventListener('pointerdown', event => {
        if (trigger.disabled) return;
        event.preventDefault();
        setOpen(true);
        startCustomChromePointerDrag(event, updateFromSpectrumPointer);
    });

    hueTrack.addEventListener('pointerdown', event => {
        if (trigger.disabled) return;
        event.preventDefault();
        setOpen(true);
        startCustomChromePointerDrag(event, updateFromHuePointer);
    });

    spectrum.addEventListener('keydown', event => {
        const step = event.shiftKey ? 0.08 : 0.03;
        let handled = true;
        if (event.key === 'ArrowLeft') {
            state.s = clampColorUnit(state.s - step);
        } else if (event.key === 'ArrowRight') {
            state.s = clampColorUnit(state.s + step);
        } else if (event.key === 'ArrowUp') {
            state.v = clampColorUnit(state.v + step);
        } else if (event.key === 'ArrowDown') {
            state.v = clampColorUnit(state.v - step);
        } else {
            handled = false;
        }
        if (!handled) return;
        event.preventDefault();
        commitState({ emitInput: true, emitChange: true });
    });

    hueTrack.addEventListener('keydown', event => {
        let delta = 0;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            delta = event.shiftKey ? -18 : -6;
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            delta = event.shiftKey ? 18 : 6;
        } else {
            return;
        }
        event.preventDefault();
        state.h = normalizeHueDegrees(state.h + delta);
        commitState({ emitInput: true, emitChange: true });
    });

    hexField.addEventListener('input', () => {
        const cleaned = `#${String(hexField.value || '').toUpperCase().replace(/#/g, '').replace(/[^0-9A-F]/g, '').slice(0, 6)}`;
        hexField.value = cleaned;
        const normalized = normalizeHexTextInput(cleaned);
        if (!normalized) return;
        state = rgbToHsvObject(hexToRgbObject(normalized));
        commitState({ emitInput: true, emitChange: false });
    });

    hexField.addEventListener('change', () => {
        const normalized = normalizeHexTextInput(hexField.value);
        if (!normalized) {
            render();
            return;
        }
        state = rgbToHsvObject(hexToRgbObject(normalized));
        commitState({ emitInput: true, emitChange: true });
    });

    bindRgbField(redField, 'r');
    bindRgbField(greenField, 'g');
    bindRgbField(blueField, 'b');

    if (eyeDropperBtn) {
        eyeDropperBtn.disabled = !supportsEyeDropper;
        eyeDropperBtn.hidden = !supportsEyeDropper;
        eyeDropperBtn.title = supportsEyeDropper
            ? 'Pick a color from anywhere on your screen'
            : 'Screen color picking is not available in this browser';
        eyeDropperBtn.addEventListener('click', async () => {
            if (!supportsEyeDropper || trigger.disabled) return;
            try {
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                const nextHex = normalizeHexColor(result?.sRGBHex, input.value || '#00d9ff');
                state = rgbToHsvObject(hexToRgbObject(nextHex));
                commitState({ emitInput: true, emitChange: true });
            } catch (error) {
                if (error && error.name === 'AbortError') return;
                console.warn('EyeDropper failed:', error);
            }
        });
    }

    host.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
            if (!host.contains(document.activeElement)) {
                setOpen(false);
            }
        });
    });

    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    observeCustomChromeProperty(input, 'value', sync);
    observeCustomChromeProperty(input, 'disabled', sync);

    sync();
    customColorChromeControllers.set(input, { sync, close: () => setOpen(false) });
}

function enhanceSelectInputsWithCustomChrome(scope = document) {
    collectCustomChromeTargets(scope, CUSTOM_SELECT_INPUT_SELECTOR).forEach(enhanceSingleCustomSelect);
}

function enhanceColorInputsWithCustomChrome(scope = document) {
    collectCustomChromeTargets(scope, CUSTOM_COLOR_INPUT_SELECTOR).forEach(enhanceSingleCustomColorInput);
}

function ensureCustomInputChromeObserver() {
    if (customInputChromeObserver || !document.body) return;
    customInputChromeObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                enhanceLegacyColorInputsWithChrome(node);
                enhanceSelectInputsWithCustomChrome(node);
                enhanceColorInputsWithCustomChrome(node);
                enhanceNumberInputsWithCustomChrome(node);
            });
        });
    });
    customInputChromeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initializeCustomInputChrome() {
    bindCustomInputChromeDismissHandlers();
    enhanceLegacyColorInputsWithChrome(document);
    enhanceSelectInputsWithCustomChrome(document);
    enhanceColorInputsWithCustomChrome(document);
    enhanceNumberInputsWithCustomChrome(document);
    syncCustomSelectDisplays();
    syncCustomNumberDisplays();
    refreshCustomColorInputDisplays();
    ensureCustomInputChromeObserver();
}

function normalizeProfilesDataMap(rawProfiles) {
    const source = rawProfiles && typeof rawProfiles === 'object' && !Array.isArray(rawProfiles)
        ? { ...rawProfiles }
        : {};
    const isProfileObject = value => value && typeof value === 'object' && !Array.isArray(value);

    if (!Object.prototype.hasOwnProperty.call(source, 'Default') || !isProfileObject(source.Default)) {
        source.Default = {};
    }

    Object.keys(source).forEach(profileName => {
        if (profileName === 'Incognito') return;
        if (!isProfileObject(source[profileName])) {
            source[profileName] = {};
        }
    });

    source.Incognito = null;
    return source;
}

function getProfilesDataFromStorage() {
    const parsed = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.PROFILES), { Default: null, Incognito: null });
    return normalizeProfilesDataMap(parsed);
}

function saveProfilesDataToStorage(profilesData) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(normalizeProfilesDataMap(profilesData)));
}

function normalizeRoleKey(roleValue) {
    return String(roleValue || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeRoleLabel(labelValue, fallbackKey = '') {
    const raw = String(labelValue || '').trim();
    if (raw) return raw.slice(0, 32);
    const key = String(fallbackKey || '').trim().toLowerCase();
    return key ? key.replace(/[-_]+/g, ' ').toUpperCase() : 'CUSTOM ROLE';
}

function normalizeRoleCapabilities(rawCapabilities, fallbackCapabilities) {
    const source = rawCapabilities && typeof rawCapabilities === 'object' ? rawCapabilities : {};
    const fallback = fallbackCapabilities && typeof fallbackCapabilities === 'object' ? fallbackCapabilities : {};
    const normalized = {};
    ROLE_CAPABILITY_KEYS.forEach(capabilityKey => {
        if (source[capabilityKey] === undefined) {
            normalized[capabilityKey] = Boolean(fallback[capabilityKey]);
            return;
        }
        normalized[capabilityKey] = Boolean(source[capabilityKey]);
    });
    return normalized;
}

function normalizeRoleDefinitions(rawDefinitions) {
    const source = rawDefinitions && typeof rawDefinitions === 'object' ? rawDefinitions : {};
    const normalized = {};

    Object.entries(DEFAULT_ROLE_DEFINITIONS).forEach(([roleKey, roleDef]) => {
        const incoming = source[roleKey] && typeof source[roleKey] === 'object' ? source[roleKey] : {};
        normalized[roleKey] = {
            label: normalizeRoleLabel(incoming.label, roleDef.label || roleKey),
            protected: Boolean(roleDef.protected),
            capabilities: normalizeRoleCapabilities(incoming.capabilities, roleDef.capabilities)
        };
    });

    Object.entries(source).forEach(([rawRoleKey, rawRoleDef]) => {
        const roleKey = normalizeRoleKey(rawRoleKey);
        if (!roleKey || Object.prototype.hasOwnProperty.call(normalized, roleKey)) return;
        const safeDef = rawRoleDef && typeof rawRoleDef === 'object' ? rawRoleDef : {};
        normalized[roleKey] = {
            label: normalizeRoleLabel(safeDef.label, roleKey),
            protected: false,
            capabilities: normalizeRoleCapabilities(safeDef.capabilities, DEFAULT_ROLE_DEFINITIONS[PROFILE_ROLES.STANDARD].capabilities)
        };
    });
    return normalized;
}

function getRoleDefinitionsFromStorage() {
    return normalizeRoleDefinitions(safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.ROLE_DEFINITIONS), DEFAULT_ROLE_DEFINITIONS));
}

function saveRoleDefinitionsToStorage(roleDefinitions) {
    localStorage.setItem(STORAGE_KEYS.ROLE_DEFINITIONS, JSON.stringify(normalizeRoleDefinitions(roleDefinitions)));
}

function normalizeProfileRoleName(roleValue, fallback = PROFILE_ROLES.STANDARD, roleDefinitionsOverride = null) {
    const roleDefinitions = roleDefinitionsOverride && typeof roleDefinitionsOverride === 'object'
        ? roleDefinitionsOverride
        : getRoleDefinitionsFromStorage();
    const value = normalizeRoleKey(roleValue);
    if (value && Object.prototype.hasOwnProperty.call(roleDefinitions, value)) return value;
    const fallbackRole = normalizeRoleKey(fallback);
    if (fallbackRole && Object.prototype.hasOwnProperty.call(roleDefinitions, fallbackRole)) return fallbackRole;
    return PROFILE_ROLES.STANDARD;
}

function getProfileRoleMap(roleDefinitionsOverride = null) {
    const roleDefinitions = roleDefinitionsOverride && typeof roleDefinitionsOverride === 'object'
        ? roleDefinitionsOverride
        : getRoleDefinitionsFromStorage();
    const profilesData = getProfilesDataFromStorage();
    const rawRoles = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.PROFILE_ROLES), {});
    const roles = {};
    Object.keys(profilesData).forEach(profileName => {
        if (profileName === 'Default') {
            roles[profileName] = PROFILE_ROLES.ADMIN;
            return;
        }
        if (profileName === 'Incognito') {
            roles[profileName] = PROFILE_ROLES.INCOGNITO;
            return;
        }
        roles[profileName] = normalizeProfileRoleName(
            rawRoles && typeof rawRoles === 'object' ? rawRoles[profileName] : '',
            PROFILE_ROLES.STANDARD,
            roleDefinitions
        );
    });
    return roles;
}

function saveProfileRoleMap(roleMap) {
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const profilesData = getProfilesDataFromStorage();
    const source = roleMap && typeof roleMap === 'object' ? roleMap : {};
    const nextRoles = {};
    Object.keys(profilesData).forEach(profileName => {
        if (profileName === 'Default') {
            nextRoles[profileName] = PROFILE_ROLES.ADMIN;
            return;
        }
        if (profileName === 'Incognito') {
            nextRoles[profileName] = PROFILE_ROLES.INCOGNITO;
            return;
        }
        nextRoles[profileName] = normalizeProfileRoleName(source[profileName], PROFILE_ROLES.STANDARD, roleDefinitions);
    });
    localStorage.setItem(STORAGE_KEYS.PROFILE_ROLES, JSON.stringify(nextRoles));
}

function ensureProfilesAndRolesConsistency() {
    const roleDefinitions = getRoleDefinitionsFromStorage();
    saveRoleDefinitionsToStorage(roleDefinitions);
    const profilesData = getProfilesDataFromStorage();
    saveProfilesDataToStorage(profilesData);
    saveProfileRoleMap(getProfileRoleMap(roleDefinitions));
}

function setProfileRole(profileName, roleName, { silent = false } = {}) {
    const target = String(profileName || '').trim();
    if (!target || CORE_PROFILE_NAMES.has(target)) return;
    const roles = getProfileRoleMap();
    const nextRole = normalizeProfileRoleName(roleName, PROFILE_ROLES.STANDARD);
    roles[target] = nextRole;
    saveProfileRoleMap(roles);
    if (!silent) {
        showNotification(`Role updated: ${target} -> ${nextRole.toUpperCase()}`);
    }
    applyRoleBasedControlState();
}

function getCurrentProfileRole() {
    let currentProfile = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const profilesData = getProfilesDataFromStorage();
    if (!Object.prototype.hasOwnProperty.call(profilesData, currentProfile)) {
        currentProfile = 'Default';
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, currentProfile);
    }
    const roles = getProfileRoleMap();
    if (currentProfile === 'Default') return PROFILE_ROLES.ADMIN;
    if (currentProfile === 'Incognito') return PROFILE_ROLES.INCOGNITO;
    return normalizeProfileRoleName(roles[currentProfile], PROFILE_ROLES.STANDARD, roleDefinitions);
}

function getCurrentProfileCapabilities() {
    const role = getCurrentProfileRole();
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const roleConfig = roleDefinitions[role] || roleDefinitions[PROFILE_ROLES.STANDARD] || DEFAULT_ROLE_DEFINITIONS[PROFILE_ROLES.STANDARD];
    const caps = normalizeRoleCapabilities(roleConfig.capabilities, DEFAULT_ROLE_DEFINITIONS[PROFILE_ROLES.STANDARD].capabilities);
    return {
        saveSettings: Boolean(caps.saveSettings),
        editProfiles: Boolean(caps.editProfiles),
        managePlugins: Boolean(caps.managePlugins),
        manageWorkspace: Boolean(caps.manageWorkspace),
        destructiveActions: Boolean(caps.destructiveActions)
    };
}

function isRoleAllowed(actionName) {
    const capabilities = getCurrentProfileCapabilities();
    if (actionName === 'save') return capabilities.saveSettings;
    if (actionName === 'profiles') return capabilities.editProfiles;
    if (actionName === 'plugins') return capabilities.managePlugins;
    if (actionName === 'workspace') return capabilities.manageWorkspace;
    if (actionName === 'destructive') return capabilities.destructiveActions;
    return true;
}

function setRoleLockedState(element, allowed, deniedTitle) {
    if (!element) return;
    const disabled = !allowed;
    element.disabled = disabled;
    element.classList.toggle('profile-guarded-control', disabled);
    if (disabled) {
        element.setAttribute('title', deniedTitle || 'Blocked by current profile role.');
    } else if (element.getAttribute('title') === deniedTitle) {
        element.removeAttribute('title');
    }
}

function applyRoleBasedControlState() {
    const role = getCurrentProfileRole();
    const capabilities = getCurrentProfileCapabilities();
    document.body.classList.toggle('profile-role-admin', role === PROFILE_ROLES.ADMIN);
    document.body.classList.toggle('profile-role-standard', role === PROFILE_ROLES.STANDARD);
    document.body.classList.toggle('profile-role-restricted', role === PROFILE_ROLES.RESTRICTED);
    document.body.classList.toggle('profile-role-incognito', role === PROFILE_ROLES.INCOGNITO);

    setRoleLockedState(document.getElementById('saveSettings'), capabilities.saveSettings, 'Saving is blocked for this profile role.');
    setRoleLockedState(document.getElementById('resetSettings'), capabilities.destructiveActions, 'Reset is blocked for this profile role.');
    setRoleLockedState(document.getElementById('newProfileBtn'), capabilities.editProfiles, 'Profile management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('editProfileBtn'), capabilities.editProfiles, 'Profile management is blocked for this profile role.');

    setRoleLockedState(document.getElementById('openMarketplaceBtn'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('createDebugPluginBtn'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('importPluginPackageBtn'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('exportPluginPackageBtn'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('debugPluginNameInput'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('debugPluginVersionInput'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('debugPluginAuthorInput'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');
    setRoleLockedState(document.getElementById('debugPluginSourceInput'), capabilities.managePlugins, 'Plugin management is blocked for this profile role.');

    setRoleLockedState(document.getElementById('exportWorkspaceSyncBtn'), capabilities.manageWorkspace, 'Workspace sync is blocked for this profile role.');
    setRoleLockedState(document.getElementById('importWorkspaceSyncBtn'), capabilities.manageWorkspace, 'Workspace sync is blocked for this profile role.');
    setRoleLockedState(document.getElementById('resetWorkspaceSyncBtn'), capabilities.destructiveActions && capabilities.manageWorkspace, 'Workspace reset is blocked for this profile role.');
    setRoleLockedState(document.getElementById('recoverLastAutoSaveBtn'), capabilities.manageWorkspace, 'Recovery is blocked for this profile role.');
    setRoleLockedState(document.getElementById('enableAutoSaveMode'), capabilities.manageWorkspace, 'Autosave is blocked for this profile role.');
    setRoleLockedState(document.getElementById('autoSaveIntervalSlider'), capabilities.manageWorkspace, 'Autosave is blocked for this profile role.');
    setRoleLockedState(document.getElementById('autoSaveIntervalInput'), capabilities.manageWorkspace, 'Autosave is blocked for this profile role.');
    setRoleLockedState(document.getElementById('viewCrashReportBtn'), capabilities.manageWorkspace, 'Crash report access is blocked for this profile role.');
    setRoleLockedState(document.getElementById('saveThemeStudioBtn'), capabilities.saveSettings, 'Saving is blocked for this profile role.');

    setRoleLockedState(document.getElementById('clearRecentChangesBtn'), capabilities.destructiveActions, 'Clearing activity is blocked for this profile role.');
    setRoleLockedState(document.getElementById('forceCrashTestBtn'), capabilities.destructiveActions, 'Crash test is blocked for this profile role.');
}

function createCustomRole(roleNameRaw) {
    if (!isRoleAllowed('profiles')) return false;
    const roleKey = normalizeRoleKey(roleNameRaw);
    if (!roleKey) {
        showNotification('Enter a valid role name.');
        return false;
    }
    if (Object.prototype.hasOwnProperty.call(DEFAULT_ROLE_DEFINITIONS, roleKey)) {
        showNotification('System role names are reserved.');
        return false;
    }
    const roleDefinitions = getRoleDefinitionsFromStorage();
    if (Object.prototype.hasOwnProperty.call(roleDefinitions, roleKey)) {
        showNotification('That role already exists.');
        return false;
    }
    roleDefinitions[roleKey] = {
        label: normalizeRoleLabel(roleNameRaw, roleKey),
        protected: false,
        capabilities: normalizeRoleCapabilities({}, DEFAULT_ROLE_DEFINITIONS[PROFILE_ROLES.STANDARD].capabilities)
    };
    saveRoleDefinitionsToStorage(roleDefinitions);
    showNotification(`Role created: ${roleDefinitions[roleKey].label}`);
    return true;
}

function setRoleCapability(roleKeyRaw, capabilityKey, enabled) {
    if (!isRoleAllowed('profiles')) return false;
    const roleKey = normalizeRoleKey(roleKeyRaw);
    if (!roleKey || !ROLE_CAPABILITY_KEYS.includes(capabilityKey)) return false;
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const roleDef = roleDefinitions[roleKey];
    if (!roleDef || roleDef.protected) return false;

    roleDef.capabilities = normalizeRoleCapabilities(roleDef.capabilities, DEFAULT_ROLE_DEFINITIONS[PROFILE_ROLES.STANDARD].capabilities);
    roleDef.capabilities[capabilityKey] = Boolean(enabled);
    saveRoleDefinitionsToStorage(roleDefinitions);
    applyRoleBasedControlState();
    return true;
}

function deleteCustomRole(roleKeyRaw) {
    if (!isRoleAllowed('profiles')) return false;
    const roleKey = normalizeRoleKey(roleKeyRaw);
    if (!roleKey) return false;
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const roleDef = roleDefinitions[roleKey];
    if (!roleDef || roleDef.protected || Object.prototype.hasOwnProperty.call(DEFAULT_ROLE_DEFINITIONS, roleKey)) {
        return false;
    }

    delete roleDefinitions[roleKey];
    saveRoleDefinitionsToStorage(roleDefinitions);

    const roleMap = getProfileRoleMap(roleDefinitions);
    Object.keys(roleMap).forEach(profileName => {
        if (roleMap[profileName] === roleKey) {
            roleMap[profileName] = PROFILE_ROLES.STANDARD;
        }
    });
    saveProfileRoleMap(roleMap);
    ensureProfilesAndRolesConsistency();
    applyRoleBasedControlState();
    showNotification(`Role removed: ${normalizeRoleLabel(roleDef.label, roleKey)}`);
    return true;
}

function getThemeStudioThemeName(themeOverride = null) {
    const fromOverride = String(themeOverride || '').trim().toLowerCase();
    if (fromOverride === 'light' || fromOverride === 'dark') return fromOverride;
    if (document.body && document.body.classList.contains('light-theme')) return 'light';
    const stored = String(localStorage.getItem(STORAGE_KEYS.THEME) || 'dark').trim().toLowerCase();
    return stored === 'light' ? 'light' : 'dark';
}

function getThemeStudioColorDefaults(themeOverride = null) {
    const themeName = getThemeStudioThemeName(themeOverride);
    const light = themeName === 'light';
    return {
        mainBgColor: light ? '#ffffff' : '#0d0d0d',
        sidebarBgColor: light ? '#f5f5f5' : '#1a1a1a',
        headerBgColor: light ? '#eeeeee' : '#111111',
        cardBgColor: light ? '#f5f5f5' : '#1a1a1a',
        buttonBgColor: light ? '#ffffff' : '#111111'
    };
}

function resolveThemeStudioUseThemeFlag(flagValue, colorValue, darkDefault, lightDefault) {
    if (flagValue === true || flagValue === 'true') return true;
    if (flagValue === false || flagValue === 'false') return false;
    const raw = String(colorValue || '').trim();
    if (!raw) return true;
    const normalized = normalizeHexColor(raw, darkDefault);
    const darkNorm = normalizeHexColor(darkDefault, darkDefault);
    const lightNorm = normalizeHexColor(lightDefault, lightDefault);
    return normalized === darkNorm || normalized === lightNorm;
}

function getDefaultThemeStudioSettings(themeOverride = null) {
    const colorDefaults = getThemeStudioColorDefaults(themeOverride);
    return {
        ...THEME_STUDIO_DEFAULTS,
        ...colorDefaults,
        useThemeMainBg: true,
        useThemeSidebarBg: true,
        useThemeHeaderBg: true,
        useThemeCardBg: true,
        useThemeButtonBg: true
    };
}

function normalizeHexColor(colorValue, fallback = '#000000') {
    const value = String(colorValue || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        const r = value[1];
        const g = value[2];
        const b = value[3];
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return String(fallback || '#000000').toLowerCase();
}

function normalizeColorblindMode(modeValue) {
    const mode = String(modeValue || '').trim().toLowerCase();
    const allowed = new Set(['protanopia', 'deuteranopia', 'tritanopia', 'high-contrast']);
    return allowed.has(mode) ? mode : 'protanopia';
}

function normalizeThemeStudioSettings(rawSettings) {
    const source = rawSettings && typeof rawSettings === 'object' ? rawSettings : {};
    const defaults = getDefaultThemeStudioSettings();
    const darkDefaults = getThemeStudioColorDefaults('dark');
    const lightDefaults = getThemeStudioColorDefaults('light');
    return {
        mainSize: Math.max(260, Math.min(1800, parseNumberWithFallback(source.mainSize, defaults.mainSize))),
        mainAlphaPct: Math.max(0, Math.min(40, parseNumberWithFallback(source.mainAlphaPct, defaults.mainAlphaPct))),
        secondaryAlphaPct: Math.max(0, Math.min(35, parseNumberWithFallback(source.secondaryAlphaPct, defaults.secondaryAlphaPct))),
        tertiaryAlphaPct: Math.max(0, Math.min(35, parseNumberWithFallback(source.tertiaryAlphaPct, defaults.tertiaryAlphaPct))),
        bootSize: Math.max(1200, Math.min(4200, parseNumberWithFallback(source.bootSize, defaults.bootSize))),
        bootAlphaPct: Math.max(0, Math.min(45, parseNumberWithFallback(source.bootAlphaPct, defaults.bootAlphaPct))),
        mainBgColor: normalizeHexColor(source.mainBgColor, defaults.mainBgColor),
        sidebarBgColor: normalizeHexColor(source.sidebarBgColor, defaults.sidebarBgColor),
        headerBgColor: normalizeHexColor(source.headerBgColor, defaults.headerBgColor),
        cardBgColor: normalizeHexColor(source.cardBgColor, defaults.cardBgColor),
        buttonBgColor: normalizeHexColor(source.buttonBgColor, defaults.buttonBgColor),
        useThemeMainBg: resolveThemeStudioUseThemeFlag(source.useThemeMainBg, source.mainBgColor, darkDefaults.mainBgColor, lightDefaults.mainBgColor),
        useThemeSidebarBg: resolveThemeStudioUseThemeFlag(source.useThemeSidebarBg, source.sidebarBgColor, darkDefaults.sidebarBgColor, lightDefaults.sidebarBgColor),
        useThemeHeaderBg: resolveThemeStudioUseThemeFlag(source.useThemeHeaderBg, source.headerBgColor, darkDefaults.headerBgColor, lightDefaults.headerBgColor),
        useThemeCardBg: resolveThemeStudioUseThemeFlag(source.useThemeCardBg, source.cardBgColor, darkDefaults.cardBgColor, lightDefaults.cardBgColor),
        useThemeButtonBg: resolveThemeStudioUseThemeFlag(source.useThemeButtonBg, source.buttonBgColor, darkDefaults.buttonBgColor, lightDefaults.buttonBgColor),
        colorblindEnabled: source.colorblindEnabled === true || source.colorblindEnabled === 'true',
        colorblindMode: normalizeColorblindMode(source.colorblindMode)
    };
}

function getSavedThemeStudioSettings() {
    return normalizeThemeStudioSettings(safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.THEME_STUDIO), getDefaultThemeStudioSettings()));
}

function applyThemeStudioSettings(settingsLike, { persist = false } = {}) {
    const settings = normalizeThemeStudioSettings(settingsLike);
    const root = document.documentElement;
    const body = document.body;
    const colorDefaults = getThemeStudioColorDefaults();
    const resolvedMainBgColor = settings.useThemeMainBg ? colorDefaults.mainBgColor : settings.mainBgColor;
    const resolvedSidebarBgColor = settings.useThemeSidebarBg ? colorDefaults.sidebarBgColor : settings.sidebarBgColor;
    const resolvedHeaderBgColor = settings.useThemeHeaderBg ? colorDefaults.headerBgColor : settings.headerBgColor;
    const resolvedCardBgColor = settings.useThemeCardBg ? colorDefaults.cardBgColor : settings.cardBgColor;
    const resolvedButtonBgColor = settings.useThemeButtonBg ? colorDefaults.buttonBgColor : settings.buttonBgColor;
    root.style.setProperty('--bg-orb-main-size', `${settings.mainSize}px`);
    root.style.setProperty('--bg-orb-main-alpha', String(settings.mainAlphaPct / 100));
    root.style.setProperty('--bg-orb-secondary-alpha', String(settings.secondaryAlphaPct / 100));
    root.style.setProperty('--bg-orb-tertiary-alpha', String(settings.tertiaryAlphaPct / 100));
    root.style.setProperty('--boot-orb-size', `${settings.bootSize}px`);
    root.style.setProperty('--boot-orb-alpha', String(settings.bootAlphaPct / 100));
    root.style.setProperty('--theme-studio-main-bg', resolvedMainBgColor);
    root.style.setProperty('--theme-studio-sidebar-bg', resolvedSidebarBgColor);
    root.style.setProperty('--theme-studio-header-bg', resolvedHeaderBgColor);
    root.style.setProperty('--theme-studio-card-bg', resolvedCardBgColor);
    root.style.setProperty('--theme-studio-button-bg', resolvedButtonBgColor);
    root.classList.remove('colorblind-mode-protanopia', 'colorblind-mode-deuteranopia', 'colorblind-mode-tritanopia', 'colorblind-mode-high-contrast');
    if (settings.colorblindEnabled) {
        root.classList.add(`colorblind-mode-${settings.colorblindMode}`);
    }
    if (body) {
        body.classList.toggle('colorblind-mode', Boolean(settings.colorblindEnabled));
        body.classList.remove('colorblind-mode-protanopia', 'colorblind-mode-deuteranopia', 'colorblind-mode-tritanopia', 'colorblind-mode-high-contrast');
        if (settings.colorblindEnabled) {
            body.classList.add(`colorblind-mode-${settings.colorblindMode}`);
        }
    }
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.THEME_STUDIO, JSON.stringify(settings));
    }
    return settings;
}

function getSavedAutoSaveEnabled() {
    return localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_ENABLED) === 'true';
}

function getSavedAutoSaveIntervalMs() {
    const raw = parseNumberWithFallback(localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_INTERVAL_MS), AUTO_SAVE_INTERVAL_MS_DEFAULT);
    return Math.max(AUTO_SAVE_INTERVAL_MS_MIN, Math.min(AUTO_SAVE_INTERVAL_MS_MAX, raw));
}

function setAutoSaveIntervalMs(value, { persist = true } = {}) {
    const normalized = Math.max(AUTO_SAVE_INTERVAL_MS_MIN, Math.min(AUTO_SAVE_INTERVAL_MS_MAX, parseNumberWithFallback(value, AUTO_SAVE_INTERVAL_MS_DEFAULT)));
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_INTERVAL_MS, String(normalized));
    }
    return normalized;
}

function setAutoSaveEnabled(enabled, { persist = true } = {}) {
    const nextEnabled = Boolean(enabled);
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, String(nextEnabled));
    }
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
    }
    if (nextEnabled) {
        const intervalMs = getSavedAutoSaveIntervalMs();
        autoSaveIntervalId = setInterval(() => {
            saveAutoRecoverySnapshot('interval');
            updateAutoSaveStatusUi();
        }, intervalMs);
    }
}

function getSavedCrashReport() {
    return safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.LAST_CRASH_REPORT), null);
}

function buildCrashReport(reason, extra = {}) {
    const enabledPluginCount = plugins.filter(plugin => Boolean(plugin && plugin.enabled)).length;
    return {
        id: `crash-${Date.now()}`,
        createdAt: new Date().toISOString(),
        reason: String(reason || 'Unexpected shutdown'),
        page: getActivePageName(),
        profile: localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default',
        role: getCurrentProfileRole(),
        activeHacks: getHackToggles().filter(toggle => toggle.checked).length,
        enabledPlugins: enabledPluginCount,
        userAgent: navigator.userAgent,
        ...extra
    };
}

function storeCrashReport(reason, extra = {}) {
    const report = buildCrashReport(reason, extra);
    localStorage.setItem(STORAGE_KEYS.LAST_CRASH_REPORT, JSON.stringify(report));
    return report;
}

function setupCrashLifecycle() {
    const wasPreviouslyActive = localStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE) === 'true';
    if (wasPreviouslyActive) {
        storeCrashReport('Previous session did not close cleanly.');
    }
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
    const markSessionClosed = () => {
        localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'false');
    };
    window.addEventListener('beforeunload', markSessionClosed);
    window.addEventListener('pagehide', markSessionClosed);
    window.addEventListener('error', (event) => {
        const msg = event?.message ? String(event.message) : 'Runtime error';
        storeCrashReport(`Runtime error: ${msg}`);
    });
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event?.reason ? String(event.reason) : 'Unhandled promise rejection';
        storeCrashReport(`Unhandled rejection: ${reason}`);
    });
}

function saveAutoRecoverySnapshot(reason = 'manual') {
    const storageSnapshot = captureLocalStorageSnapshot();
    const uiSnapshot = captureResetSnapshot().ui;
    const payload = {
        type: 'nexus-auto-save',
        version: 1,
        reason: String(reason || 'manual'),
        savedAt: new Date().toISOString(),
        summary: captureWorkspaceSummaryFromStorageSnapshot(storageSnapshot),
        storage: storageSnapshot,
        ui: uiSnapshot
    };
    localStorage.setItem(STORAGE_KEYS.LAST_AUTO_SAVE, JSON.stringify(payload));
    return payload;
}

function getSavedAutoRecoverySnapshot() {
    const parsed = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.LAST_AUTO_SAVE), null);
    if (!parsed || typeof parsed !== 'object' || !parsed.storage || typeof parsed.storage !== 'object') {
        return null;
    }
    return parsed;
}

function initializeAutoSaveSystem() {
    ensureProfilesAndRolesConsistency();
    applyThemeStudioSettings(getSavedThemeStudioSettings(), { persist: false });
    setAutoSaveEnabled(getSavedAutoSaveEnabled(), { persist: false });
    updateAutoSaveStatusUi();
    updateCrashReportStatusUi();
}

function formatAutoSaveIntervalLabel(intervalMs) {
    const seconds = Math.max(1, Math.round((Number(intervalMs) || AUTO_SAVE_INTERVAL_MS_DEFAULT) / 1000));
    return `${seconds}s`;
}

function setAutoSaveStatusText(text) {
    const status = document.getElementById('autoSaveStatus');
    if (status) status.textContent = String(text || '');
}

function updateAutoSaveStatusUi() {
    const enabled = getSavedAutoSaveEnabled();
    const intervalMs = getSavedAutoSaveIntervalMs();
    const snapshot = getSavedAutoRecoverySnapshot();
    const intervalPreview = document.getElementById('autoSaveIntervalPreview');
    if (intervalPreview) intervalPreview.textContent = formatAutoSaveIntervalLabel(intervalMs);

    if (!enabled) {
        setAutoSaveStatusText('Autosave is currently off.');
        return;
    }
    if (!snapshot) {
        setAutoSaveStatusText(`Autosave on (${formatAutoSaveIntervalLabel(intervalMs)}). Waiting for first snapshot...`);
        return;
    }
    const when = snapshot.savedAt ? new Date(snapshot.savedAt).toLocaleTimeString() : 'unknown time';
    setAutoSaveStatusText(`Autosave on (${formatAutoSaveIntervalLabel(intervalMs)}). Last snapshot: ${when}.`);
}

function updateCrashReportStatusUi() {
    const report = getSavedCrashReport();
    const status = document.getElementById('crashReportStatus');
    if (!status) return;
    if (!report) {
        status.textContent = 'No crash report detected.';
        return;
    }
    const when = report.createdAt ? new Date(report.createdAt).toLocaleString() : 'unknown time';
    status.textContent = `Crash report available (${when})`;
}

function recoverLastAutoSaveSnapshot() {
    if (!isRoleAllowed('workspace')) {
        showNotification('Recovery is blocked for this profile role.');
        return;
    }
    const snapshot = getSavedAutoRecoverySnapshot();
    if (!snapshot) {
        showNotification('No auto-save snapshot found.');
        return;
    }
    const previousStorage = captureLocalStorageSnapshot();
    restoreLocalStorageSnapshot(snapshot.storage);
    refreshWorkspaceStateFromStorage();
    if (snapshot.ui && typeof snapshot.ui === 'object') {
        applyUiSnapshot(snapshot.ui);
    }
    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfileName !== 'Incognito') {
        const profilesData = getProfilesDataFromStorage();
        profilesData[currentProfileName] = buildCurrentProfileData();
        saveProfilesDataToStorage(profilesData);
    }
    applyRoleBasedControlState();
    updateAutoSaveStatusUi();
    showNotification('Recovered from latest auto-save snapshot.');
    recordRecentChange('Recovered from latest auto-save snapshot', () => {
        restoreLocalStorageSnapshot(previousStorage);
        refreshWorkspaceStateFromStorage();
        applyRoleBasedControlState();
        updateAutoSaveStatusUi();
    });
}

function renderCrashReportModalBody() {
    const body = document.getElementById('crashReportModalBody');
    if (!body) return;
    const report = getSavedCrashReport();
    body.innerHTML = '';
    if (!report) {
        const empty = document.createElement('p');
        empty.className = 'setting-note';
        empty.textContent = 'No crash report is currently stored.';
        body.appendChild(empty);
        return;
    }

    const fields = [
        ['Created', report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'],
        ['Reason', report.reason || 'N/A'],
        ['Page', report.page || 'N/A'],
        ['Profile', report.profile || 'N/A'],
        ['Role', report.role || 'N/A'],
        ['Active Hacks', String(report.activeHacks ?? 'N/A')],
        ['Enabled Plugins', String(report.enabledPlugins ?? 'N/A')]
    ];
    fields.forEach(([label, value]) => {
        const row = document.createElement('p');
        row.className = 'setting-note';
        row.textContent = `${label}: ${value}`;
        body.appendChild(row);
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn-secondary';
    clearBtn.textContent = 'CLEAR REPORT';
    clearBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.LAST_CRASH_REPORT);
        renderCrashReportModalBody();
        updateCrashReportStatusUi();
    });
    body.appendChild(clearBtn);
}

function openCrashReportModal() {
    const modal = document.getElementById('crashReportModal');
    if (!modal) return;
    renderCrashReportModalBody();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeCrashReportModal() {
    const modal = document.getElementById('crashReportModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function openThemeStudio() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    themeStudioDraftState.bgPattern = getSavedBgPattern();
    themeStudioDraftState.sidebarIcons = { ...getSavedSidebarIconOverrides() };
    settingsContainer.classList.add('theme-studio-config-mode');
    applyBackgroundPattern(themeStudioDraftState.bgPattern, { persist: false });
    applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
    renderSidebarIconEditor();
    applyMicroCardAnimations(document.getElementById('settingsThemeStudioPage'));
    syncSidebarKeybindLink();
}

function closeThemeStudio() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    const savedThemeStudio = getSavedThemeStudioSettings();
    applyThemeStudioSettings(savedThemeStudio, { persist: false });
    syncThemeStudioControlsFromSettings(savedThemeStudio);
    themeStudioDraftState.bgPattern = getSavedBgPattern();
    themeStudioDraftState.sidebarIcons = { ...getSavedSidebarIconOverrides() };
    applyBackgroundPattern(themeStudioDraftState.bgPattern, { persist: false });
    applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
    renderSidebarIconEditor();
    settingsContainer.classList.remove('theme-studio-config-mode');
    syncSidebarKeybindLink();
}

function persistThemeStudioToCurrentProfile(themeStudioSettingsLike) {
    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfileName === 'Incognito') {
        return false;
    }

    const profilesData = getProfilesDataFromStorage();
    const existingProfileData = profilesData[currentProfileName];
    const profileData = existingProfileData && typeof existingProfileData === 'object' && !Array.isArray(existingProfileData)
        ? existingProfileData
        : buildCurrentProfileData();

    profileData.themeStudio = normalizeThemeStudioSettings(themeStudioSettingsLike || getSavedThemeStudioSettings());
    profilesData[currentProfileName] = profileData;
    saveProfilesDataToStorage(profilesData);
    return true;
}

function clearBackgroundPatternAnimation() {
    if (bgPatternRuntimeState.frameId) {
        cancelAnimationFrame(bgPatternRuntimeState.frameId);
        bgPatternRuntimeState.frameId = null;
    }
    if (typeof bgPatternRuntimeState.resizeHandler === 'function') {
        window.removeEventListener('resize', bgPatternRuntimeState.resizeHandler);
    }
    bgPatternRuntimeState.resizeHandler = null;
}

function clearBackgroundPatternStyle() {
    const style = document.getElementById('nexus-bg-pattern-style');
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
}

function ensureBackgroundPatternOverlay() {
    const host = document.querySelector('.main-content');
    if (!host) return null;
    let overlay = document.getElementById('bgPatternOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bgPatternOverlay';
        host.insertBefore(overlay, host.firstChild || null);
    }
    bgPatternRuntimeState.overlay = overlay;
    return overlay;
}

function removeBackgroundPatternOverlay() {
    const overlay = document.getElementById('bgPatternOverlay');
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    bgPatternRuntimeState.overlay = null;
}

function removeBackgroundPatternCanvas() {
    const canvas = document.getElementById('bgPatternCanvas');
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
    bgPatternRuntimeState.canvas = null;
    bgPatternRuntimeState.ctx = null;
}

function ensureBackgroundPatternCanvas() {
    const host = document.querySelector('.main-content');
    if (!host) return null;
    let canvas = document.getElementById('bgPatternCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bgPatternCanvas';
        host.insertBefore(canvas, host.firstChild || null);
    }
    bgPatternRuntimeState.canvas = canvas;
    bgPatternRuntimeState.ctx = canvas.getContext('2d');
    return canvas;
}

function resizeBackgroundPatternCanvas() {
    const canvas = bgPatternRuntimeState.canvas || document.getElementById('bgPatternCanvas');
    if (!canvas) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = bgPatternRuntimeState.ctx || canvas.getContext('2d');
    if (!ctx) return;
    bgPatternRuntimeState.ctx = ctx;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function clearBackgroundPatternRuntime({ removeCanvas = false } = {}) {
    clearBackgroundPatternAnimation();
    clearBackgroundPatternStyle();
    const overlay = bgPatternRuntimeState.overlay || document.getElementById('bgPatternOverlay');
    if (overlay) {
        overlay.className = '';
        overlay.style.removeProperty('opacity');
    }
    const ctx = bgPatternRuntimeState.ctx;
    const canvas = bgPatternRuntimeState.canvas;
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (removeCanvas) {
        removeBackgroundPatternOverlay();
        removeBackgroundPatternCanvas();
    }
}

function getRuntimeAccentRgbTuple() {
    const raw = String(getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb') || '').trim();
    const parts = raw.split(',').map(part => Number(String(part || '').trim()));
    if (parts.length === 3 && parts.every(value => Number.isFinite(value))) {
        return parts.map(value => Math.max(0, Math.min(255, Math.round(value))));
    }
    return [0, 217, 255];
}

function startHexPulsePattern() {
    const canvas = ensureBackgroundPatternCanvas();
    if (!canvas) return;
    canvas.style.opacity = '0.34';
    resizeBackgroundPatternCanvas();

    const draw = (now) => {
        const ctx = bgPatternRuntimeState.ctx;
        if (!ctx) return;
        const [r, g, b] = getRuntimeAccentRgbTuple();
        const width = window.innerWidth;
        const height = window.innerHeight;
        const radius = 40;
        const hexWidth = Math.sqrt(3) * radius;
        const rowHeight = 1.5 * radius;
        const cols = Math.ceil(width / hexWidth) + 3;
        const rows = Math.ceil(height / rowHeight) + 3;
        const waveBase = now / 4000;

        ctx.clearRect(0, 0, width, height);
        for (let row = -1; row < rows; row += 1) {
            for (let col = -1; col < cols; col += 1) {
                const offsetX = row % 2 === 0 ? 0 : hexWidth / 2;
                const centerX = col * hexWidth + offsetX;
                const centerY = row * rowHeight;
                const idx = row * cols + col;
                const pulse = 0.05 + (0.09 * (0.5 + (Math.sin((waveBase * Math.PI * 2) + (idx * 0.3)) * 0.5)));
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pulse.toFixed(4)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < 6; i += 1) {
                    const angle = (Math.PI / 180) * (60 * i);
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
    };

    bgPatternRuntimeState.resizeHandler = () => resizeBackgroundPatternCanvas();
    window.addEventListener('resize', bgPatternRuntimeState.resizeHandler);
    bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
}

function startNexusPattern() {
    const canvas = ensureBackgroundPatternCanvas();
    if (!canvas) return;
    canvas.style.opacity = '0.41';
    resizeBackgroundPatternCanvas();

    const draw = (now) => {
        const ctx = bgPatternRuntimeState.ctx;
        if (!ctx) return;

        const [r, g, b] = getRuntimeAccentRgbTuple();
        const width = window.innerWidth;
        const height = window.innerHeight;
        const phase = now / 1800;
        const spacingX = 220;
        const spacingY = 140;

        ctx.clearRect(0, 0, width, height);

        for (let y = -spacingY; y < height + spacingY; y += spacingY) {
            for (let x = -spacingX; x < width + spacingX; x += spacingX) {
                const pulse = 0.08 + ((Math.sin((x + y) * 0.008 + phase) + 1) * 0.035);
                ctx.save();
                ctx.translate(x + 110, y + 70);
                ctx.rotate(-0.22);
                ctx.font = '700 34px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulse.toFixed(4)})`;
                ctx.fillText('NEXUS', 0, 0);
                ctx.restore();
            }
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.10)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i += 1) {
            const radius = 130 + (i * 120) + ((Math.sin(phase + i) + 1) * 18);
            ctx.beginPath();
            ctx.arc(width - 150, 120, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.045)`;
        for (let line = 0; line < height; line += 6) {
            ctx.fillRect(0, line, width, 1);
        }

        bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
    };

    bgPatternRuntimeState.resizeHandler = () => resizeBackgroundPatternCanvas();
    window.addEventListener('resize', bgPatternRuntimeState.resizeHandler);
    bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
}

function getMatrixCharacterPool() {
    return 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
}

function startMatrixPattern() {
    const canvas = ensureBackgroundPatternCanvas();
    if (!canvas) return;
    canvas.style.opacity = '0.39';
    resizeBackgroundPatternCanvas();
    const ctx = bgPatternRuntimeState.ctx;
    if (!ctx) return;

    const charPool = getMatrixCharacterPool();
    const columnWidth = 18;
    const resetColumns = () => {
        const columns = Math.ceil(window.innerWidth / columnWidth);
        bgPatternRuntimeState.matrixDrops = Array.from({ length: columns }, () => Math.floor(Math.random() * Math.max(1, Math.floor(window.innerHeight / 16))));
    };
    resetColumns();
    bgPatternRuntimeState.matrixLastStepAt = 0;

    const draw = (now) => {
        const [r, g, b] = getRuntimeAccentRgbTuple();
        if (!bgPatternRuntimeState.matrixLastStepAt) {
            bgPatternRuntimeState.matrixLastStepAt = now;
        }
        if (now - bgPatternRuntimeState.matrixLastStepAt >= 80) {
            bgPatternRuntimeState.matrixLastStepAt = now;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.font = '13px monospace';

            bgPatternRuntimeState.matrixDrops.forEach((drop, colIndex) => {
                const x = colIndex * columnWidth;
                const y = drop * 16;
                const char = charPool.charAt(Math.floor(Math.random() * charPool.length));
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
                ctx.fillText(char, x, y);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.10)`;
                ctx.fillText(char, x, y - 16);
                if (y > window.innerHeight && Math.random() > 0.975) {
                    bgPatternRuntimeState.matrixDrops[colIndex] = 0;
                } else {
                    bgPatternRuntimeState.matrixDrops[colIndex] += 1;
                }
            });
        }
        bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
    };

    bgPatternRuntimeState.resizeHandler = () => {
        resizeBackgroundPatternCanvas();
        resetColumns();
    };
    window.addEventListener('resize', bgPatternRuntimeState.resizeHandler);
    bgPatternRuntimeState.frameId = requestAnimationFrame(draw);
}

function applyBackgroundPattern(patternRaw, { persist = true } = {}) {
    const allowed = new Set(['none', 'nexus', 'dots', 'grid', 'hexagon', 'matrix']);
    const pattern = allowed.has(String(patternRaw || '').trim().toLowerCase())
        ? String(patternRaw).trim().toLowerCase()
        : 'none';

    if (persist) {
        localStorage.setItem(STORAGE_KEYS.BG_PATTERN, pattern);
    }

    clearBackgroundPatternRuntime({ removeCanvas: true });

    if (pattern === 'none') return;
    if (pattern === 'nexus') {
        startNexusPattern();
        return;
    }
    if (pattern === 'dots') {
        const overlay = ensureBackgroundPatternOverlay();
        if (!overlay) return;
        overlay.className = 'is-visible pattern-dots';
        return;
    }
    if (pattern === 'grid') {
        const overlay = ensureBackgroundPatternOverlay();
        if (!overlay) return;
        overlay.className = 'is-visible pattern-grid';
        return;
    }
    if (pattern === 'hexagon') {
        startHexPulsePattern();
        return;
    }
    if (pattern === 'matrix') {
        startMatrixPattern();
    }
}

function captureSidebarOriginalIcons() {
    document.querySelectorAll('.nav-btn[data-page]').forEach(button => {
        const page = String(button.getAttribute('data-page') || '').trim();
        const iconEl = button.querySelector('.nav-icon');
        if (!page || !iconEl) return;
        if (!sidebarOriginalIcons.has(page)) {
            sidebarOriginalIcons.set(page, iconEl.textContent);
        }
    });
}

function saveSidebarIconOverrides(overrides) {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_ICONS, JSON.stringify(overrides || {}));
}

function applySidebarIconOverrides(overridesRaw = null) {
    captureSidebarOriginalIcons();
    const overrides = overridesRaw && typeof overridesRaw === 'object' && !Array.isArray(overridesRaw)
        ? overridesRaw
        : getSavedSidebarIconOverrides();
    document.querySelectorAll('.nav-btn[data-page]').forEach(button => {
        const page = String(button.getAttribute('data-page') || '').trim();
        const iconEl = button.querySelector('.nav-icon');
        if (!page || !iconEl) return;
        const override = String(overrides[page] || '').trim();
        const original = sidebarOriginalIcons.get(page) || iconEl.textContent || '';
        iconEl.textContent = override || original;
    });
}

function renderSidebarIconEditor() {
    const editor = document.getElementById('sidebarIconEditor');
    if (!editor) return;
    captureSidebarOriginalIcons();
    applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
    const overrides = themeStudioDraftState.sidebarIcons && typeof themeStudioDraftState.sidebarIcons === 'object'
        ? themeStudioDraftState.sidebarIcons
        : {};

    editor.innerHTML = '';
    document.querySelectorAll('.nav-btn[data-page]').forEach(button => {
        const page = String(button.getAttribute('data-page') || '').trim();
        const iconEl = button.querySelector('.nav-icon');
        const navText = button.querySelector('.nav-text');
        if (!page || !iconEl || !navText) return;

        const originalIcon = sidebarOriginalIcons.get(page) || iconEl.textContent || '';
        const currentIcon = String(overrides[page] || iconEl.textContent || originalIcon).trim() || originalIcon;
        const row = document.createElement('div');
        row.className = 'sidebar-icon-row';
        row.innerHTML = `
            <span class="sidebar-icon-current">${currentIcon}</span>
            <span class="sidebar-icon-name">${navText.textContent.trim()}</span>
            <input type="text" class="sidebar-icon-input" maxlength="4" placeholder="emoji or char" value="${currentIcon.replace(/"/g, '&quot;')}">
            <button class="sidebar-icon-reset" type="button">↺</button>
        `;

        const currentEl = row.querySelector('.sidebar-icon-current');
        const input = row.querySelector('.sidebar-icon-input');
        const resetBtn = row.querySelector('.sidebar-icon-reset');
        if (!currentEl || !input || !resetBtn) return;

        const commitValue = (valueRaw) => {
            const value = String(valueRaw || '').slice(0, 4);
            const nextOverrides = { ...(themeStudioDraftState.sidebarIcons || {}) };
            if (value.trim()) {
                nextOverrides[page] = value;
                iconEl.textContent = value;
                currentEl.textContent = value;
            } else {
                delete nextOverrides[page];
                iconEl.textContent = originalIcon;
                currentEl.textContent = originalIcon;
            }
            themeStudioDraftState.sidebarIcons = nextOverrides;
            applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
            updateProfileUnsavedIndicator();
        };

        input.addEventListener('input', () => {
            const key = `sidebar-icon-${page}`;
            if (sidebarIconDebounceMap.has(key)) {
                clearTimeout(sidebarIconDebounceMap.get(key));
            }
            const timeoutId = setTimeout(() => {
                commitValue(input.value);
                sidebarIconDebounceMap.delete(key);
            }, 300);
            sidebarIconDebounceMap.set(key, timeoutId);
        });

        resetBtn.addEventListener('click', () => {
            const nextOverrides = { ...(themeStudioDraftState.sidebarIcons || {}) };
            delete nextOverrides[page];
            themeStudioDraftState.sidebarIcons = nextOverrides;
            iconEl.textContent = originalIcon;
            currentEl.textContent = originalIcon;
            input.value = originalIcon;
            applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
            updateProfileUnsavedIndicator();
        });

        editor.appendChild(row);
    });
}

function initializeThemeStudio() {
    const openBtn = document.getElementById('openThemeStudioBtn');
    const closeBtn = document.getElementById('closeThemeStudioBtn');
    const saveBtn = document.getElementById('saveThemeStudioBtn');
    const resetBtn = document.getElementById('resetThemeStudioBtn');
    const bgPatternSelect = document.getElementById('bgPatternSelect');
    const status = document.getElementById('themeStudioStatus');
    const controls = [
        ['themeStudioMainSizeSlider', 'themeStudioMainSizeInput', 'mainSize'],
        ['themeStudioMainAlphaSlider', 'themeStudioMainAlphaInput', 'mainAlphaPct'],
        ['themeStudioSecondaryAlphaSlider', 'themeStudioSecondaryAlphaInput', 'secondaryAlphaPct'],
        ['themeStudioTertiaryAlphaSlider', 'themeStudioTertiaryAlphaInput', 'tertiaryAlphaPct'],
        ['themeStudioBootSizeSlider', 'themeStudioBootSizeInput', 'bootSize'],
        ['themeStudioBootAlphaSlider', 'themeStudioBootAlphaInput', 'bootAlphaPct']
    ];
    const mainBgColor = document.getElementById('themeStudioMainBgColor');
    const sidebarBgColor = document.getElementById('themeStudioSidebarBgColor');
    const headerBgColor = document.getElementById('themeStudioHeaderBgColor');
    const cardBgColor = document.getElementById('themeStudioCardBgColor');
    const buttonBgColor = document.getElementById('themeStudioButtonBgColor');
    const colorblindEnabled = document.getElementById('themeStudioColorblindEnabled');
    const colorblindMode = document.getElementById('themeStudioColorblindMode');
    const applyFromControls = (persist) => {
        const savedThemeStudio = getSavedThemeStudioSettings();
        const colorDefaults = getThemeStudioColorDefaults();
        const payload = {};
        controls.forEach(([sliderId, inputId, key]) => {
            const slider = document.getElementById(sliderId);
            const input = document.getElementById(inputId);
            const rawValue = slider ? slider.value : (input ? input.value : '');
            payload[key] = parseNumberWithFallback(rawValue, THEME_STUDIO_DEFAULTS[key]);
        });
        payload.mainBgColor = mainBgColor ? mainBgColor.value : savedThemeStudio.mainBgColor;
        payload.sidebarBgColor = sidebarBgColor ? sidebarBgColor.value : savedThemeStudio.sidebarBgColor;
        payload.headerBgColor = headerBgColor ? headerBgColor.value : savedThemeStudio.headerBgColor;
        payload.cardBgColor = cardBgColor ? cardBgColor.value : savedThemeStudio.cardBgColor;
        payload.buttonBgColor = buttonBgColor ? buttonBgColor.value : savedThemeStudio.buttonBgColor;
        payload.useThemeMainBg = normalizeHexColor(payload.mainBgColor, colorDefaults.mainBgColor) === colorDefaults.mainBgColor;
        payload.useThemeSidebarBg = normalizeHexColor(payload.sidebarBgColor, colorDefaults.sidebarBgColor) === colorDefaults.sidebarBgColor;
        payload.useThemeHeaderBg = normalizeHexColor(payload.headerBgColor, colorDefaults.headerBgColor) === colorDefaults.headerBgColor;
        payload.useThemeCardBg = normalizeHexColor(payload.cardBgColor, colorDefaults.cardBgColor) === colorDefaults.cardBgColor;
        payload.useThemeButtonBg = normalizeHexColor(payload.buttonBgColor, colorDefaults.buttonBgColor) === colorDefaults.buttonBgColor;
        payload.colorblindEnabled = Boolean(colorblindEnabled && colorblindEnabled.checked);
        payload.colorblindMode = colorblindMode ? colorblindMode.value : savedThemeStudio.colorblindMode;
        const applied = applyThemeStudioSettings(payload, { persist });
        const appliedColorDefaults = getThemeStudioColorDefaults();
        const appliedMainBg = applied.useThemeMainBg ? appliedColorDefaults.mainBgColor : applied.mainBgColor;
        const appliedSidebarBg = applied.useThemeSidebarBg ? appliedColorDefaults.sidebarBgColor : applied.sidebarBgColor;
        const appliedHeaderBg = applied.useThemeHeaderBg ? appliedColorDefaults.headerBgColor : applied.headerBgColor;
        const appliedCardBg = applied.useThemeCardBg ? appliedColorDefaults.cardBgColor : applied.cardBgColor;
        const appliedButtonBg = applied.useThemeButtonBg ? appliedColorDefaults.buttonBgColor : applied.buttonBgColor;
        controls.forEach(([sliderId, inputId, key]) => {
            const slider = document.getElementById(sliderId);
            const input = document.getElementById(inputId);
            if (slider) slider.value = String(applied[key]);
            if (input) input.value = String(applied[key]);
        });
        if (mainBgColor) mainBgColor.value = appliedMainBg;
        if (sidebarBgColor) sidebarBgColor.value = appliedSidebarBg;
        if (headerBgColor) headerBgColor.value = appliedHeaderBg;
        if (cardBgColor) cardBgColor.value = appliedCardBg;
        if (buttonBgColor) buttonBgColor.value = appliedButtonBg;
        if (colorblindEnabled) colorblindEnabled.checked = Boolean(applied.colorblindEnabled);
        if (colorblindMode) colorblindMode.value = applied.colorblindMode;
        if (status) {
            status.textContent = persist ? 'Theme studio saved.' : 'Previewing studio changes (not saved yet).';
        }
        updateProfileUnsavedIndicator();
        return applied;
    };

    const saved = getSavedThemeStudioSettings();
    themeStudioDraftState.bgPattern = getSavedBgPattern();
    themeStudioDraftState.sidebarIcons = { ...getSavedSidebarIconOverrides() };
    applyThemeStudioSettings(saved, { persist: false });
    syncThemeStudioControlsFromSettings(saved);
    if (bgPatternSelect) {
        bgPatternSelect.value = themeStudioDraftState.bgPattern;
    }
    applyBackgroundPattern(themeStudioDraftState.bgPattern, { persist: false });
    renderSidebarIconEditor();
    controls.forEach(([sliderId, inputId, key]) => {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);
        if (slider && input) {
            slider.addEventListener('input', () => {
                input.value = slider.value;
                applyFromControls(false);
            });
            input.addEventListener('input', () => {
                slider.value = input.value;
                applyFromControls(false);
            });
        }
    });
    [mainBgColor, sidebarBgColor, headerBgColor, cardBgColor, buttonBgColor, colorblindEnabled, colorblindMode]
        .filter(Boolean)
        .forEach(control => {
            control.addEventListener('input', () => applyFromControls(false));
            control.addEventListener('change', () => applyFromControls(false));
        });
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            openThemeStudio();
            renderSidebarIconEditor();
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeThemeStudio);
    if (bgPatternSelect) {
        bgPatternSelect.addEventListener('change', () => {
            themeStudioDraftState.bgPattern = bgPatternSelect.value;
            applyBackgroundPattern(themeStudioDraftState.bgPattern, { persist: false });
            if (status) {
                status.textContent = `Previewing pattern: ${bgPatternSelect.options[bgPatternSelect.selectedIndex]?.textContent || bgPatternSelect.value}`;
            }
            updateProfileUnsavedIndicator();
        });
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const applied = applyFromControls(true);
            localStorage.setItem(STORAGE_KEYS.BG_PATTERN, themeStudioDraftState.bgPattern || 'none');
            saveSidebarIconOverrides(themeStudioDraftState.sidebarIcons || {});
            applyBackgroundPattern(themeStudioDraftState.bgPattern || 'none', { persist: false });
            applySidebarIconOverrides(themeStudioDraftState.sidebarIcons || {});
            const savedToProfile = persistThemeStudioToCurrentProfile(applied);
            if (status) {
                status.textContent = savedToProfile
                    ? 'Theme studio saved to current profile.'
                    : 'Theme studio saved locally.';
            }
            showNotification(savedToProfile
                ? 'Theme studio settings saved to profile.'
                : 'Theme studio settings saved.');
            updateProfileUnsavedIndicator();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const defaults = applyThemeStudioSettings(getDefaultThemeStudioSettings(), { persist: false });
            syncThemeStudioControlsFromSettings(defaults);
            themeStudioDraftState.bgPattern = 'none';
            themeStudioDraftState.sidebarIcons = {};
            if (bgPatternSelect) bgPatternSelect.value = 'none';
            applyBackgroundPattern('none', { persist: false });
            applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
            renderSidebarIconEditor();
            if (status) {
                status.textContent = 'Theme studio reset to defaults. Click save to keep it.';
            }
            showNotification('Theme studio preview reset.');
            updateProfileUnsavedIndicator();
        });
    }
}

function syncThemeStudioControlsFromSettings(settingsLike) {
    const settings = normalizeThemeStudioSettings(settingsLike || getSavedThemeStudioSettings());
    const colorDefaults = getThemeStudioColorDefaults();
    const resolvedMainBg = settings.useThemeMainBg ? colorDefaults.mainBgColor : settings.mainBgColor;
    const resolvedSidebarBg = settings.useThemeSidebarBg ? colorDefaults.sidebarBgColor : settings.sidebarBgColor;
    const resolvedHeaderBg = settings.useThemeHeaderBg ? colorDefaults.headerBgColor : settings.headerBgColor;
    const resolvedCardBg = settings.useThemeCardBg ? colorDefaults.cardBgColor : settings.cardBgColor;
    const resolvedButtonBg = settings.useThemeButtonBg ? colorDefaults.buttonBgColor : settings.buttonBgColor;
    const controlMap = [
        ['themeStudioMainSizeSlider', 'themeStudioMainSizeInput', 'mainSize'],
        ['themeStudioMainAlphaSlider', 'themeStudioMainAlphaInput', 'mainAlphaPct'],
        ['themeStudioSecondaryAlphaSlider', 'themeStudioSecondaryAlphaInput', 'secondaryAlphaPct'],
        ['themeStudioTertiaryAlphaSlider', 'themeStudioTertiaryAlphaInput', 'tertiaryAlphaPct'],
        ['themeStudioBootSizeSlider', 'themeStudioBootSizeInput', 'bootSize'],
        ['themeStudioBootAlphaSlider', 'themeStudioBootAlphaInput', 'bootAlphaPct']
    ];
    controlMap.forEach(([sliderId, inputId, key]) => {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);
        if (slider) slider.value = String(settings[key]);
        if (input) input.value = String(settings[key]);
    });
    const mainBgColor = document.getElementById('themeStudioMainBgColor');
    const sidebarBgColor = document.getElementById('themeStudioSidebarBgColor');
    const headerBgColor = document.getElementById('themeStudioHeaderBgColor');
    const cardBgColor = document.getElementById('themeStudioCardBgColor');
    const buttonBgColor = document.getElementById('themeStudioButtonBgColor');
    const colorblindEnabled = document.getElementById('themeStudioColorblindEnabled');
    const colorblindMode = document.getElementById('themeStudioColorblindMode');
    if (mainBgColor) mainBgColor.value = resolvedMainBg;
    if (sidebarBgColor) sidebarBgColor.value = resolvedSidebarBg;
    if (headerBgColor) headerBgColor.value = resolvedHeaderBg;
    if (cardBgColor) cardBgColor.value = resolvedCardBg;
    if (buttonBgColor) buttonBgColor.value = resolvedButtonBg;
    if (colorblindEnabled) colorblindEnabled.checked = Boolean(settings.colorblindEnabled);
    if (colorblindMode) colorblindMode.value = settings.colorblindMode;
    refreshCustomColorInputDisplays();
    return settings;
}

function resolveStartupPage() {
    const startup = getSavedStartupPageSetting();
    if (startup === 'last') {
        const last = String(localStorage.getItem(STORAGE_KEYS.LAST_PAGE) || '').trim().toLowerCase();
        return PAGE_OPTIONS.includes(last) ? last : 'combat';
    }
    return PAGE_OPTIONS.includes(startup) ? startup : 'combat';
}

function applyStartupPageSelection() {
    const startupPage = resolveStartupPage();
    selectPage(startupPage);
    updatePageTitle(startupPage);
}

function getActivePageName() {
    const activePage = document.querySelector('.page.active');
    const pageId = String(activePage?.id || '').trim().toLowerCase();
    return PAGE_OPTIONS.find(page => `page-${page}` === pageId) || 'combat';
}

function getComparableThemeStudioSettings(settingsLike) {
    const settings = normalizeThemeStudioSettings(settingsLike || getSavedThemeStudioSettings());
    return {
        ...settings,
        mainBgColor: settings.useThemeMainBg ? '__theme_main__' : settings.mainBgColor,
        sidebarBgColor: settings.useThemeSidebarBg ? '__theme_sidebar__' : settings.sidebarBgColor,
        headerBgColor: settings.useThemeHeaderBg ? '__theme_header__' : settings.headerBgColor,
        cardBgColor: settings.useThemeCardBg ? '__theme_card__' : settings.cardBgColor,
        buttonBgColor: settings.useThemeButtonBg ? '__theme_button__' : settings.buttonBgColor
    };
}

function getSavedSettingsForUnsavedIndicator() {
    const savedThemeStudioComparable = getComparableThemeStudioSettings(getSavedThemeStudioSettings());
    return {
        theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'dark',
        accent: localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff',
        gradientAccentEnabled: getSavedGradientAccentEnabled(),
        gradientAccent2: getSavedGradientAccentColor2(),
        borderRadius: String(Math.max(0, Math.min(20, parseNumberWithFallback(localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS), 8)))),
        opacity: String(Math.max(50, Math.min(100, parseNumberWithFallback(localStorage.getItem(STORAGE_KEYS.OPACITY), 100)))),
        buttonSoundsEnabled: getSavedButtonSoundEnabled(),
        buttonSoundType: getSavedButtonSoundType(),
        buttonSoundVolume: clampVolumePercent(localStorage.getItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME), 65),
        switchSoundsEnabled: getSavedSwitchSoundEnabled(),
        switchSoundType: getSavedSwitchSoundType(),
        switchSoundVolume: clampVolumePercent(localStorage.getItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME), 70),
        performanceMode: getSavedPerformanceMode(),
        uiLockMode: getSavedUiLockMode(),
        focusMode: getSavedFocusMode(),
        safetyLockMode: getSavedSafetyLockMode(),
        safetyLockHoldMs: getSavedSafetyLockHoldMs(),
        startupPage: getSavedStartupPageSetting(),
        bootPowerConfirm: getSavedBootPowerConfirm(),
        welcomeSplash: getSavedWelcomeSplashEnabled(),
        autoSaveEnabled: getSavedAutoSaveEnabled(),
        autoSaveIntervalMs: getSavedAutoSaveIntervalMs(),
        themeStudio: savedThemeStudioComparable,
        bgPattern: getSavedBgPattern(),
        sidebarIcons: getSavedSidebarIconOverrides()
    };
}

function getCurrentSettingsForUnsavedIndicator() {
    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const enablePerformanceMode = document.getElementById('enablePerformanceMode');
    const enableUiLockMode = document.getElementById('enableUiLockMode');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const startupPageSelect = document.getElementById('startupPageSelect');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const enableWelcomeSplash = document.getElementById('enableWelcomeSplash');
    const enableAutoSaveMode = document.getElementById('enableAutoSaveMode');
    const autoSaveIntervalSlider = document.getElementById('autoSaveIntervalSlider');
    const bgPatternSelect = document.getElementById('bgPatternSelect');
    const themeStudioMainSizeSlider = document.getElementById('themeStudioMainSizeSlider');
    const themeStudioMainAlphaSlider = document.getElementById('themeStudioMainAlphaSlider');
    const themeStudioSecondaryAlphaSlider = document.getElementById('themeStudioSecondaryAlphaSlider');
    const themeStudioTertiaryAlphaSlider = document.getElementById('themeStudioTertiaryAlphaSlider');
    const themeStudioBootSizeSlider = document.getElementById('themeStudioBootSizeSlider');
    const themeStudioBootAlphaSlider = document.getElementById('themeStudioBootAlphaSlider');
    const themeStudioMainBgColor = document.getElementById('themeStudioMainBgColor');
    const themeStudioSidebarBgColor = document.getElementById('themeStudioSidebarBgColor');
    const themeStudioHeaderBgColor = document.getElementById('themeStudioHeaderBgColor');
    const themeStudioCardBgColor = document.getElementById('themeStudioCardBgColor');
    const themeStudioButtonBgColor = document.getElementById('themeStudioButtonBgColor');
    const themeStudioColorblindEnabled = document.getElementById('themeStudioColorblindEnabled');
    const themeStudioColorblindMode = document.getElementById('themeStudioColorblindMode');
    const savedThemeStudio = getSavedThemeStudioSettings();
    const startupValue = startupPageSelect ? startupPageSelect.value : 'combat';
    const currentThemeStudioComparable = getComparableThemeStudioSettings(normalizeThemeStudioSettings({
        mainSize: themeStudioMainSizeSlider ? themeStudioMainSizeSlider.value : savedThemeStudio.mainSize,
        mainAlphaPct: themeStudioMainAlphaSlider ? themeStudioMainAlphaSlider.value : savedThemeStudio.mainAlphaPct,
        secondaryAlphaPct: themeStudioSecondaryAlphaSlider ? themeStudioSecondaryAlphaSlider.value : savedThemeStudio.secondaryAlphaPct,
        tertiaryAlphaPct: themeStudioTertiaryAlphaSlider ? themeStudioTertiaryAlphaSlider.value : savedThemeStudio.tertiaryAlphaPct,
        bootSize: themeStudioBootSizeSlider ? themeStudioBootSizeSlider.value : savedThemeStudio.bootSize,
        bootAlphaPct: themeStudioBootAlphaSlider ? themeStudioBootAlphaSlider.value : savedThemeStudio.bootAlphaPct,
        mainBgColor: themeStudioMainBgColor ? themeStudioMainBgColor.value : savedThemeStudio.mainBgColor,
        sidebarBgColor: themeStudioSidebarBgColor ? themeStudioSidebarBgColor.value : savedThemeStudio.sidebarBgColor,
        headerBgColor: themeStudioHeaderBgColor ? themeStudioHeaderBgColor.value : savedThemeStudio.headerBgColor,
        cardBgColor: themeStudioCardBgColor ? themeStudioCardBgColor.value : savedThemeStudio.cardBgColor,
        buttonBgColor: themeStudioButtonBgColor ? themeStudioButtonBgColor.value : savedThemeStudio.buttonBgColor,
        colorblindEnabled: Boolean(themeStudioColorblindEnabled && themeStudioColorblindEnabled.checked),
        colorblindMode: themeStudioColorblindMode ? themeStudioColorblindMode.value : savedThemeStudio.colorblindMode
    }));

    return {
        theme: themeSelect ? themeSelect.value : 'dark',
        accent: accentColor ? accentColor.value : '#00d9ff',
        gradientAccentEnabled: Boolean(gradientAccentEnabled && gradientAccentEnabled.checked),
        gradientAccent2: /^#[0-9a-fA-F]{6}$/.test(String(gradientAccentColor2 ? gradientAccentColor2.value : '').trim())
            ? gradientAccentColor2.value
            : '#7c3aed',
        borderRadius: String(Math.max(0, Math.min(20, parseNumberWithFallback(borderRadiusSlider ? borderRadiusSlider.value : 8, 8)))),
        opacity: String(Math.max(50, Math.min(100, parseNumberWithFallback(opacitySlider ? opacitySlider.value : 100, 100)))),
        buttonSoundsEnabled: Boolean(enableButtonSounds && enableButtonSounds.checked),
        buttonSoundType: BUTTON_SOUND_PRESETS[buttonSoundSelect ? buttonSoundSelect.value : 'nexus-soft']
            ? (buttonSoundSelect ? buttonSoundSelect.value : 'nexus-soft')
            : 'nexus-soft',
        buttonSoundVolume: clampVolumePercent(buttonSoundVolume ? buttonSoundVolume.value : 65, 65),
        switchSoundsEnabled: Boolean(enableSwitchSounds && enableSwitchSounds.checked),
        switchSoundType: FEATURE_SWITCH_SOUND_PRESETS[switchSoundSelect ? switchSoundSelect.value : 'clean-toggle']
            ? (switchSoundSelect ? switchSoundSelect.value : 'clean-toggle')
            : 'clean-toggle',
        switchSoundVolume: clampVolumePercent(switchSoundVolume ? switchSoundVolume.value : 70, 70),
        performanceMode: Boolean(enablePerformanceMode && enablePerformanceMode.checked),
        uiLockMode: Boolean(enableUiLockMode && enableUiLockMode.checked),
        focusMode: Boolean(enableFocusMode && enableFocusMode.checked),
        safetyLockMode: Boolean(enableSafetyLockMode && enableSafetyLockMode.checked),
        safetyLockHoldMs: normalizeSafetyLockHoldMs(safetyLockHoldSlider ? safetyLockHoldSlider.value : getSavedSafetyLockHoldMs()),
        startupPage: STARTUP_PAGE_OPTIONS.includes(startupValue) ? startupValue : 'combat',
        bootPowerConfirm: Boolean(enableBootPowerConfirm ? enableBootPowerConfirm.checked : getSavedBootPowerConfirm()),
        welcomeSplash: Boolean(enableWelcomeSplash ? enableWelcomeSplash.checked : getSavedWelcomeSplashEnabled()),
        autoSaveEnabled: Boolean(enableAutoSaveMode && enableAutoSaveMode.checked),
        autoSaveIntervalMs: setAutoSaveIntervalMs((autoSaveIntervalSlider ? autoSaveIntervalSlider.value : Math.round(getSavedAutoSaveIntervalMs() / 1000)) * 1000, { persist: false }),
        bgPattern: bgPatternSelect ? bgPatternSelect.value : getSavedBgPattern(),
        sidebarIcons: { ...(themeStudioDraftState.sidebarIcons || {}) },
        themeStudio: currentThemeStudioComparable
    };
}

function getStableIndicatorState(value) {
    if (Array.isArray(value)) {
        return value.map(getStableIndicatorState);
    }
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((acc, key) => {
            acc[key] = getStableIndicatorState(value[key]);
            return acc;
        }, {});
    }
    return value;
}

function serializeSettingsForUnsavedIndicator(state) {
    return JSON.stringify(getStableIndicatorState(state));
}

function updateProfileUnsavedIndicator() {
    const indicator = document.getElementById('profileUnsavedIndicator');
    if (!indicator) return;

    const currentStateSerialized = serializeSettingsForUnsavedIndicator(getCurrentSettingsForUnsavedIndicator());
    const storedStateSerialized = serializeSettingsForUnsavedIndicator(getSavedSettingsForUnsavedIndicator());
    const isDirty = currentStateSerialized !== storedStateSerialized;

    indicator.textContent = isDirty ? 'UNSAVED CHANGES' : 'ALL CHANGES SAVED';
    indicator.classList.toggle('is-dirty', isDirty);
    indicator.classList.remove('is-default');
}

function initializeProfileUnsavedIndicator() {
    if (profileUnsavedTrackingInitialized) {
        updateProfileUnsavedIndicator();
        return;
    }
    profileUnsavedTrackingInitialized = true;

    const watchedSelectors = [
        '#themeSelect',
        '#accentColor',
        '#gradientAccentEnabled',
        '#gradientAccentColor2',
        '#borderRadiusSlider',
        '#borderRadiusInput',
        '#opacitySlider',
        '#opacityInput',
        '#enableButtonSounds',
        '#buttonSoundSelect',
        '#buttonSoundVolume',
        '#buttonSoundVolumeInput',
        '#enableSwitchSounds',
        '#switchSoundSelect',
        '#switchSoundVolume',
        '#switchSoundVolumeInput',
        '#enablePerformanceMode',
        '#enableUiLockMode',
        '#enableFocusMode',
        '#enableSafetyLockMode',
        '#safetyLockHoldSlider',
        '#safetyLockHoldInput',
        '#startupPageSelect',
        '#enableBootPowerConfirm',
        '#enableWelcomeSplash',
        '#enableAutoSaveMode',
        '#autoSaveIntervalSlider',
        '#autoSaveIntervalInput',
        '#themeStudioMainSizeSlider',
        '#themeStudioMainSizeInput',
        '#themeStudioMainAlphaSlider',
        '#themeStudioMainAlphaInput',
        '#themeStudioSecondaryAlphaSlider',
        '#themeStudioSecondaryAlphaInput',
        '#themeStudioTertiaryAlphaSlider',
        '#themeStudioTertiaryAlphaInput',
        '#themeStudioBootSizeSlider',
        '#themeStudioBootSizeInput',
        '#themeStudioBootAlphaSlider',
        '#themeStudioBootAlphaInput',
        '#themeStudioMainBgColor',
        '#themeStudioSidebarBgColor',
        '#themeStudioHeaderBgColor',
        '#themeStudioCardBgColor',
        '#themeStudioButtonBgColor',
        '#themeStudioColorblindEnabled',
        '#themeStudioColorblindMode',
        '#bgPatternSelect'
    ];

    document.addEventListener('input', (event) => {
        if (event.target && event.target.matches(watchedSelectors.join(','))) {
            updateProfileUnsavedIndicator();
        }
    }, true);

    document.addEventListener('change', (event) => {
        if (event.target && event.target.matches(watchedSelectors.join(','))) {
            updateProfileUnsavedIndicator();
        }
    }, true);

    ['gridLayoutBtn', 'listLayoutBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                updateProfileUnsavedIndicator();
            });
        }
    });

    updateProfileUnsavedIndicator();
}

function formatSessionTime(totalSeconds) {
    const sec = Math.max(0, Number(totalSeconds) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isDocumentPipSupported() {
    return 'documentPictureInPicture' in window && typeof window.documentPictureInPicture.requestWindow === 'function';
}

function isMiniHudPipOpen() {
    return Boolean(miniHudPipWindow && !miniHudPipWindow.closed);
}

function getMiniHudElement() {
    const localHud = document.getElementById('miniHud');
    if (localHud) return localHud;
    if (miniHudElementRef) return miniHudElementRef;
    if (isMiniHudPipOpen()) {
        return miniHudPipWindow.document.getElementById('miniHud');
    }
    return null;
}

function getMiniHudDocument() {
    if (isMiniHudPipOpen() && miniHudPipWindow.document.getElementById('miniHud')) {
        return miniHudPipWindow.document;
    }
    return document;
}

function syncMiniHudPipStyles() {
    if (!isMiniHudPipOpen()) return;

    let pipDoc = null;
    try {
        pipDoc = miniHudPipWindow.document;
    } catch (error) {
        return;
    }
    if (!pipDoc || !pipDoc.documentElement || !pipDoc.body) return;

    const sourceRootStyles = getComputedStyle(document.documentElement);
    for (let i = 0; i < sourceRootStyles.length; i++) {
        const key = sourceRootStyles[i];
        if (key.startsWith('--')) {
            pipDoc.documentElement.style.setProperty(key, sourceRootStyles.getPropertyValue(key));
        }
    }

    pipDoc.body.className = document.body.className;
}

function updateMiniHudToggleButton(enabled, pip = false) {
    const toggleBtn = document.getElementById('toggleMiniHudBtn');
    if (!toggleBtn) return;
    if (!enabled) {
        toggleBtn.textContent = 'HUD OFF';
        return;
    }
    toggleBtn.textContent = pip ? 'HUD PIP ON' : 'HUD ON';
}

function updateSessionTimerDisplays() {
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTimestamp) / 1000);
    const value = formatSessionTime(elapsedSeconds);
    const headerTimer = document.getElementById('sessionTimerBadge');
    const hudDoc = getMiniHudDocument();
    const hudTimer = hudDoc.getElementById('miniHudTimer');
    if (headerTimer) headerTimer.textContent = value;
    if (hudTimer) hudTimer.textContent = value;
}

function getActiveHackNames() {
    return getHackToggles()
        .filter(toggle => toggle.checked)
        .map(toggle => toggle.closest('.feature-card')?.querySelector('h3')?.textContent?.trim() || '')
        .filter(Boolean);
}

function updateMiniHudData() {
    const activeNames = getActiveHackNames();
    const total = getHackToggles().length;
    const hudDoc = getMiniHudDocument();
    const activeCount = hudDoc.getElementById('miniHudActiveCount');
    const profile = hudDoc.getElementById('miniHudProfile');
    const list = hudDoc.getElementById('miniHudActiveList');

    if (activeCount) {
        activeCount.textContent = `${activeNames.length}/${total}`;
    }
    if (profile) {
        profile.textContent = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    }
    if (list) {
        list.innerHTML = '';
        if (!activeNames.length) {
            const empty = document.createElement('span');
            empty.className = 'mini-hud-chip';
            empty.textContent = 'No active hacks';
            list.appendChild(empty);
        } else {
            activeNames.slice(0, 6).forEach(name => {
                const chip = document.createElement('span');
                chip.className = 'mini-hud-chip';
                chip.textContent = name;
                list.appendChild(chip);
            });
        }
    }
}

function getSavedDebugRefreshRate() {
    const raw = parseInt(localStorage.getItem(STORAGE_KEYS.DEBUG_REFRESH_RATE) || '750', 10);
    return [250, 500, 750, 1000, 1500].includes(raw) ? raw : 750;
}

function getSavedDebugCompactMode() {
    return localStorage.getItem(STORAGE_KEYS.DEBUG_COMPACT_MODE) === 'true';
}

function getSavedDebugAutoScroll() {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBUG_AUTO_SCROLL);
    if (raw === null) return true;
    return raw !== 'false';
}

function getActiveHackFeatureIds() {
    return getHackToggles()
        .filter(toggle => toggle.checked)
        .map(toggle => (toggle.getAttribute('data-feature') || '').trim().toLowerCase())
        .filter(Boolean);
}

function getFeatureDisplayName(featureId) {
    const toggle = document.querySelector(`.toggle-input[data-feature="${featureId}"]`);
    return toggle?.closest('.feature-card')?.querySelector('h3')?.textContent?.trim() || featureId;
}

function updateHackDemoButtonState() {
    const btn = document.getElementById('toggleHackDemoBtn');
    if (!btn) return;
    btn.textContent = hackDemoState.running ? 'DEBUG ON' : 'DEBUG OFF';
    btn.classList.toggle('is-active', hackDemoState.running);
    btn.classList.toggle('active', hackDemoState.running);
}

function isHackDemoPanelVisible() {
    const panel = document.getElementById('hackDemoPanel');
    if (!panel) return false;
    return !panel.classList.contains('hidden');
}

function updateHackDemoMiniWindowButtonState() {
    const btn = document.getElementById('debugDashMiniWindowBtn');
    if (!btn) return;
    const visible = hackDemoState.running && isHackDemoPanelVisible();
    btn.textContent = visible ? 'MINI WINDOW ON' : 'MINI WINDOW OFF';
    btn.classList.toggle('is-active', visible);
}

function setHackDemoPanelVisibility(visible) {
    const panel = document.getElementById('hackDemoPanel');
    if (!panel) return;
    const nextVisible = Boolean(visible) && hackDemoState.running;
    panel.classList.toggle('hidden', !nextVisible);
    panel.setAttribute('aria-hidden', String(!nextVisible));
    updateHackDemoMiniWindowButtonState();
}

function getHackDemoLogElements() {
    const logs = [
        document.getElementById('hackDemoLog'),
        document.getElementById('debugDashboardLog')
    ];
    return logs.filter(Boolean);
}

function clearHackDemoLog(useEmptyState = true) {
    getHackDemoLogElements().forEach(log => {
        log.innerHTML = '';
        if (!useEmptyState) return;
        const empty = document.createElement('div');
        empty.className = 'demo-log-empty';
        empty.textContent = 'Start debug monitor to collect live telemetry.';
        log.appendChild(empty);
    });
}

function appendHackDemoLog(message, options = {}) {
    const force = Boolean(options && options.force);
    if (!force && !hackDemoState.autoScroll) return;

    const elapsed = hackDemoState.startedAt ? Math.floor((Date.now() - hackDemoState.startedAt) / 1000) : 0;
    getHackDemoLogElements().forEach(log => {
        const empty = log.querySelector('.demo-log-empty');
        if (empty) empty.remove();

        const item = document.createElement('div');
        item.className = 'demo-log-item';
        item.textContent = `${formatSessionTime(elapsed)}  ${message}`;
        log.appendChild(item);

        while (log.children.length > DEMO_LOG_LIMIT) {
            log.removeChild(log.firstElementChild);
        }

        if (hackDemoState.autoScroll) {
            requestAnimationFrame(() => {
                log.scrollTop = log.scrollHeight;
            });
        }
    });
}

function setHackDemoCompactMode(enabled, persist = true) {
    const panel = document.getElementById('hackDemoPanel');
    hackDemoState.compactMode = Boolean(enabled);
    if (panel) {
        panel.classList.toggle('compact', hackDemoState.compactMode);
    }
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.DEBUG_COMPACT_MODE, String(hackDemoState.compactMode));
    }
}

function setHackDemoAutoScroll(enabled, persist = true) {
    hackDemoState.autoScroll = Boolean(enabled);
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.DEBUG_AUTO_SCROLL, String(hackDemoState.autoScroll));
    }
}

function updateHackDemoControlsUi() {
    const refreshSelects = [
        document.getElementById('hackDemoRefreshRate'),
        document.getElementById('debugDashRefreshRate')
    ].filter(Boolean);
    const compactButtons = [document.getElementById('hackDemoCompactBtn')].filter(Boolean);
    const autoButtons = [document.getElementById('hackDemoAutoScrollBtn')].filter(Boolean);

    refreshSelects.forEach(select => {
        select.value = String(hackDemoState.refreshMs);
    });
    compactButtons.forEach(btn => {
        btn.textContent = hackDemoState.compactMode ? 'COMPACT ON' : 'COMPACT OFF';
        btn.classList.toggle('is-active', hackDemoState.compactMode);
    });
    autoButtons.forEach(btn => {
        btn.textContent = hackDemoState.autoScroll ? 'AUTO LOG ON' : 'AUTO LOG OFF';
        btn.classList.toggle('is-active', hackDemoState.autoScroll);
    });
    updateHackDemoMiniWindowButtonState();
}

function resetDebugHistory() {
    hackDemoState.history = {
        speed: [],
        fps: [],
        latency: [],
        active: [],
        heap: [],
        packets: []
    };
}

function pushDebugHistorySample(activeCount) {
    const history = hackDemoState.history || {};
    const seriesByMetric = {
        speed: hackDemoState.speed,
        fps: Math.max(0, Math.round(hackDemoState.fps)),
        latency: hackDemoState.latencyMs === null ? null : Math.max(0, Math.round(hackDemoState.latencyMs)),
        active: Math.max(0, Number(activeCount) || 0),
        heap: hackDemoState.heapMb === null ? null : Math.max(0, Number(hackDemoState.heapMb.toFixed(1))),
        packets: hackDemoState.packetRate === null ? null : Math.max(0, Number(hackDemoState.packetRate.toFixed(1)))
    };

    Object.keys(DEBUG_METRICS).forEach(metric => {
        if (!Array.isArray(history[metric])) {
            history[metric] = [];
        }
        history[metric].push(seriesByMetric[metric]);
        while (history[metric].length > DEBUG_HISTORY_LIMIT) {
            history[metric].shift();
        }
    });
}

function setActiveDebugMetric(metric) {
    const nextMetric = DEBUG_METRICS[metric] ? metric : 'speed';
    hackDemoState.activeMetric = nextMetric;

    document.querySelectorAll('.debug-chart-tab').forEach(tab => {
        const isActive = tab.getAttribute('data-debug-metric') === nextMetric;
        tab.classList.toggle('is-active', isActive);
    });

    const meta = document.getElementById('debugChartMeta');
    if (meta) {
        meta.textContent = `${DEBUG_METRICS[nextMetric].label} - latest ${DEBUG_HISTORY_LIMIT} samples`;
    }

    renderDebugDashboardChart();
}

function renderDebugDashboardChart() {
    const canvas = document.getElementById('debugDashboardChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = Math.max(120, Math.floor(canvas.clientWidth || 0));
    const height = Math.max(120, Math.floor(canvas.clientHeight || 0));
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const metric = DEBUG_METRICS[hackDemoState.activeMetric] ? hackDemoState.activeMetric : 'speed';
    const series = Array.isArray(hackDemoState.history?.[metric]) ? hackDemoState.history[metric] : [];
    const values = series.map(item => Number(item)).filter(Number.isFinite);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);

    const pad = 12;
    const chartW = Math.max(10, width - pad * 2);
    const chartH = Math.max(10, height - pad * 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad + (chartH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(pad + chartW, y);
        ctx.stroke();
    }

    if (!values.length) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '12px Segoe UI';
        ctx.fillText('No data yet. Start debug monitor.', pad + 4, pad + chartH / 2);
        return;
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = Math.max(0.001, maxValue - minValue);

    ctx.strokeStyle = DEBUG_METRICS[metric].color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    series.forEach((raw, index) => {
        const value = Number(raw);
        if (!Number.isFinite(value)) return;
        const x = pad + (chartW * index) / Math.max(1, series.length - 1);
        const y = pad + chartH - ((value - minValue) / range) * chartH;
        if (!started) {
            ctx.moveTo(x, y);
            started = true;
        } else {
            ctx.lineTo(x, y);
        }
    });
    if (started) {
        ctx.stroke();
    }
}

function applyHackDemoPanelPositionFromStorage(panel) {
    const savedPosRaw = localStorage.getItem(STORAGE_KEYS.DEBUG_PANEL_POSITION);
    if (!savedPosRaw) return;
    try {
        const pos = JSON.parse(savedPosRaw);
        if (Number.isFinite(pos.left) && Number.isFinite(pos.top)) {
            panel.style.left = `${pos.left}px`;
            panel.style.top = `${pos.top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
    } catch (error) {
        // ignore invalid position
    }
}

function saveHackDemoPanelPosition(panel) {
    const left = parseFloat(panel.style.left);
    const top = parseFloat(panel.style.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;
    localStorage.setItem(STORAGE_KEYS.DEBUG_PANEL_POSITION, JSON.stringify({ left, top }));
}

function resetHackDemoPanelPosition(panel) {
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.style.bottom = '';
    localStorage.removeItem(STORAGE_KEYS.DEBUG_PANEL_POSITION);
}

function resetHackDemoState() {
    hackDemoState.startedAt = 0;
    hackDemoState.lastTickAt = 0;
    hackDemoState.tick = 0;
    hackDemoState.speed = 4.3;
    hackDemoState.fps = 0;
    hackDemoState.latencyMs = null;
    hackDemoState.jitterMs = null;
    hackDemoState.packetRate = null;
    hackDemoState.networkLabel = navigator.onLine ? 'ONLINE' : 'OFFLINE';
    hackDemoState.downlinkMbps = null;
    hackDemoState.heapMb = null;
    hackDemoState.cores = Number.isFinite(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : null;
    hackDemoState.activePage = 'combat';
    hackDemoState.profileName = 'Default';
    if (!DEBUG_METRICS[hackDemoState.activeMetric]) {
        hackDemoState.activeMetric = 'speed';
    }
    resetDebugHistory();
}

async function sampleDebugLatency() {
    if (hackDemoState.pingInFlight) return;
    if (!navigator.onLine) {
        hackDemoState.latencyMs = null;
        return;
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && Number.isFinite(connection.rtt) && connection.rtt > 0) {
        hackDemoState.latencyMs = connection.rtt;
        return;
    }
    if (window.location.protocol === 'file:') return;

    hackDemoState.pingInFlight = true;
    const start = performance.now();
    const pingUrl = new URL(window.location.href);
    pingUrl.hash = '';
    pingUrl.searchParams.set('debugPing', String(Date.now()));
    try {
        await fetch(pingUrl.toString(), { method: 'HEAD', cache: 'no-store' });
        hackDemoState.latencyMs = Math.max(1, Math.round(performance.now() - start));
    } catch (error) {
        // keep last known value
    } finally {
        hackDemoState.pingInFlight = false;
    }
}

function refreshDebugEnvironmentMetrics() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const activePage = document.querySelector('.page.active')?.getAttribute('data-page') || 'combat';
    const profileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';

    hackDemoState.activePage = activePage;
    hackDemoState.profileName = profileName;

    const effectiveType = connection && connection.effectiveType ? String(connection.effectiveType).toUpperCase() : '';
    hackDemoState.networkLabel = navigator.onLine
        ? (effectiveType ? `ONLINE ${effectiveType}` : 'ONLINE')
        : 'OFFLINE';
    hackDemoState.downlinkMbps = connection && Number.isFinite(connection.downlink) ? connection.downlink : null;
    if (connection && Number.isFinite(connection.rtt) && connection.rtt > 0) {
        hackDemoState.latencyMs = connection.rtt;
    }

    const memory = performance && performance.memory ? performance.memory : null;
    hackDemoState.heapMb = memory && Number.isFinite(memory.usedJSHeapSize)
        ? (memory.usedJSHeapSize / (1024 * 1024))
        : null;
}

function renderHackDemoPanel() {
    const activeIds = getActiveHackFeatureIds();
    const total = getHackToggles().length;
    const elapsed = hackDemoState.startedAt ? Math.floor((Date.now() - hackDemoState.startedAt) / 1000) : 0;

    const setText = (ids, value) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    };

    setText(['hackDemoRuntime', 'debugDashRuntime'], formatSessionTime(elapsed));
    setText(['hackDemoActive', 'debugDashActive'], `${activeIds.length}/${total}`);
    setText(['hackDemoSpeed', 'debugDashSpeed'], `${hackDemoState.speed.toFixed(2)} b/s`);
    setText(['hackDemoLatency', 'debugDashLatency'], hackDemoState.latencyMs === null ? 'N/A' : `${Math.round(hackDemoState.latencyMs)} ms`);
    setText(['hackDemoPacketRate', 'debugDashPacketRate'], hackDemoState.packetRate === null ? 'N/A' : `${Math.round(hackDemoState.packetRate)} pkt/s`);
    setText(['hackDemoJitter', 'debugDashJitter'], hackDemoState.jitterMs === null ? 'N/A' : `${hackDemoState.jitterMs.toFixed(1)} ms`);
    setText(['hackDemoNetwork', 'debugDashNetwork'], hackDemoState.networkLabel);
    setText(['hackDemoDownlink', 'debugDashDownlink'], hackDemoState.downlinkMbps === null ? 'N/A' : `${hackDemoState.downlinkMbps.toFixed(1)} Mbps`);
    setText(['hackDemoFps', 'debugDashFps'], `${Math.max(0, Math.round(hackDemoState.fps))}`);
    setText(['hackDemoHeap', 'debugDashHeap'], hackDemoState.heapMb === null ? 'N/A' : `${hackDemoState.heapMb.toFixed(1)} MB`);
    setText(['hackDemoCores', 'debugDashCores'], hackDemoState.cores === null ? 'N/A' : String(hackDemoState.cores));
    setText(['hackDemoPage', 'debugDashPage'], hackDemoState.activePage.toUpperCase());
    setText(['hackDemoProfile', 'debugDashProfile'], hackDemoState.profileName);
    renderDebugDashboardChart();
}

function runHackDemoTick(source = 'tick') {
    if (!hackDemoState.running) return;
    hackDemoState.tick += 1;

    const now = performance.now();
    if (hackDemoState.lastTickAt > 0) {
        const delta = Math.max(1, now - hackDemoState.lastTickAt);
        hackDemoState.fps = 1000 / delta;
    }
    hackDemoState.lastTickAt = now;

    const activeIds = getActiveHackFeatureIds();
    const has = (id) => activeIds.includes(id);

    const baseSpeed = 4.3 + (has('speed') ? 2.5 : 0) + (has('fly') ? 0.9 : 0) + (has('scaffold') ? 0.4 : 0);
    hackDemoState.speed = Math.max(0.1, baseSpeed + ((Math.random() - 0.5) * 0.5));

    refreshDebugEnvironmentMetrics();
    if (debugPacketsLiteRuntimeEnabled) {
        const downlink = Number.isFinite(hackDemoState.downlinkMbps) ? hackDemoState.downlinkMbps : 4.5;
        const latencyBase = Number.isFinite(hackDemoState.latencyMs) ? hackDemoState.latencyMs : 45;
        const basePackets = 90 + (activeIds.length * 18) + (downlink * 6) + (has('speed') ? 24 : 0) + (has('fly') ? 12 : 0);
        const packetNoise = (Math.random() - 0.5) * 28;
        hackDemoState.packetRate = navigator.onLine ? Math.max(8, basePackets + packetNoise) : 0;
        hackDemoState.jitterMs = Math.max(0.2, (latencyBase * 0.06) + Math.abs((Math.random() - 0.5) * 8));
        hackDemoState.networkLabel = `${hackDemoState.networkLabel} | PACKETS LITE`;
    } else {
        hackDemoState.packetRate = null;
        hackDemoState.jitterMs = null;
    }

    pushDebugHistorySample(activeIds.length);
    if (hackDemoState.tick % Math.max(1, Math.round(4000 / hackDemoState.refreshMs)) === 0) {
        sampleDebugLatency();
    }

    if (source !== 'toggle' && hackDemoState.tick % Math.max(1, Math.round(6000 / hackDemoState.refreshMs)) === 0) {
        if (!activeIds.length) {
            appendHackDemoLog('Debug snapshot captured: idle (no active hacks).');
        } else {
            const picked = activeIds[Math.floor(Math.random() * activeIds.length)];
            appendHackDemoLog(DEBUG_FEATURE_MESSAGES[picked] || `${getFeatureDisplayName(picked)} refreshed telemetry.`);
        }
    }

    if (debugPacketsLiteRuntimeEnabled && source !== 'toggle' && hackDemoState.tick % Math.max(1, Math.round(8500 / hackDemoState.refreshMs)) === 0) {
        const packetsText = hackDemoState.packetRate === null ? 'N/A' : `${Math.round(hackDemoState.packetRate)} pkt/s`;
        const jitterText = hackDemoState.jitterMs === null ? 'N/A' : `${hackDemoState.jitterMs.toFixed(1)} ms`;
        appendHackDemoLog(`Debug Packets Lite trace: ${packetsText}, jitter ${jitterText}.`);
    }

    renderHackDemoPanel();
}

function restartHackDemoTicker() {
    if (hackDemoState.intervalId) {
        clearInterval(hackDemoState.intervalId);
        hackDemoState.intervalId = null;
    }
    if (!hackDemoState.running) return;
    hackDemoState.intervalId = setInterval(() => runHackDemoTick('tick'), hackDemoState.refreshMs);
}

function stopHackDemo(notify = true) {
    if (hackDemoState.intervalId) {
        clearInterval(hackDemoState.intervalId);
        hackDemoState.intervalId = null;
    }
    hackDemoState.running = false;
    hackDemoState.lastTickAt = 0;
    updateHackDemoButtonState();
    setHackDemoPanelVisibility(false);
    if (notify) {
        showNotification('Debug monitor stopped.');
    }
}

function startHackDemo(options = {}) {
    const notify = options.notify !== false;
    const showPanel = options.showPanel === true;

    if (hackDemoState.running) {
        setHackDemoPanelVisibility(showPanel);
        return;
    }

    resetHackDemoState();
    hackDemoState.startedAt = Date.now();
    hackDemoState.running = true;

    clearHackDemoLog(false);
    appendHackDemoLog('Debug monitor started.', { force: true });
    appendHackDemoLog('Safe simulation mode active. No real game modifications.', { force: true });

    updateHackDemoButtonState();
    setHackDemoPanelVisibility(showPanel);
    renderHackDemoPanel();
    runHackDemoTick('start');
    restartHackDemoTicker();
    if (notify) {
        showNotification('Debug monitor started.');
    }
}

function toggleHackDemo() {
    if (hackDemoState.running) {
        stopHackDemo(true);
    } else {
        startHackDemo();
    }
}

function initializeHackDemo() {
    const btn = document.getElementById('toggleHackDemoBtn');
    const panel = document.getElementById('hackDemoPanel');
    const panelHeader = document.getElementById('hackDemoPanelHeader');
    const refreshSelect = document.getElementById('hackDemoRefreshRate');
    const debugDashRefreshSelect = document.getElementById('debugDashRefreshRate');
    const debugDashMiniWindowBtn = document.getElementById('debugDashMiniWindowBtn');
    const compactBtn = document.getElementById('hackDemoCompactBtn');
    const autoBtn = document.getElementById('hackDemoAutoScrollBtn');
    const clearLogBtn = document.getElementById('hackDemoClearLogBtn');
    const debugDashClearLogBtn = document.getElementById('debugDashClearLogBtn');
    const resetPosBtn = document.getElementById('hackDemoResetPosBtn');
    const closeBtn = document.getElementById('hackDemoCloseBtn');
    if (!btn || !panel || !panelHeader) return;

    hackDemoState.refreshMs = getSavedDebugRefreshRate();
    hackDemoState.compactMode = getSavedDebugCompactMode();
    hackDemoState.autoScroll = getSavedDebugAutoScroll();
    applyHackDemoPanelPositionFromStorage(panel);
    setHackDemoCompactMode(hackDemoState.compactMode, false);
    setHackDemoAutoScroll(hackDemoState.autoScroll, false);
    updateHackDemoControlsUi();

    stopHackDemo(false);
    resetHackDemoState();
    clearHackDemoLog(true);
    refreshDebugEnvironmentMetrics();
    renderHackDemoPanel();
    setActiveDebugMetric(hackDemoState.activeMetric);

    btn.addEventListener('click', () => {
        toggleHackDemo();
    });

    const applyRefreshMs = (valueRaw) => {
        const next = parseInt(valueRaw, 10);
        hackDemoState.refreshMs = [250, 500, 750, 1000, 1500].includes(next) ? next : 750;
        localStorage.setItem(STORAGE_KEYS.DEBUG_REFRESH_RATE, String(hackDemoState.refreshMs));
        updateHackDemoControlsUi();
        restartHackDemoTicker();
        if (hackDemoState.running) {
            appendHackDemoLog(`Refresh rate set to ${hackDemoState.refreshMs}ms.`, { force: true });
        }
    };

    [refreshSelect, debugDashRefreshSelect].forEach(select => {
        if (!select) return;
        select.addEventListener('change', () => {
            applyRefreshMs(select.value);
        });
    });

    [compactBtn].forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            const next = !hackDemoState.compactMode;
            setHackDemoCompactMode(next, true);
            updateHackDemoControlsUi();
        });
    });

    [autoBtn].forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            const next = !hackDemoState.autoScroll;
            setHackDemoAutoScroll(next, true);
            updateHackDemoControlsUi();
        });
    });

    if (debugDashMiniWindowBtn) {
        debugDashMiniWindowBtn.addEventListener('click', () => {
            if (!hackDemoState.running) {
                showNotification('Enable debug first.');
                return;
            }
            setHackDemoPanelVisibility(!isHackDemoPanelVisible());
            updateHackDemoControlsUi();
        });
    }

    [clearLogBtn, debugDashClearLogBtn].forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            clearHackDemoLog(true);
            if (hackDemoState.running) {
                appendHackDemoLog('Log cleared manually.', { force: true });
            }
        });
    });

    [resetPosBtn].forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            resetHackDemoPanelPosition(panel);
            if (hackDemoState.running) {
                appendHackDemoLog('Panel position reset.', { force: true });
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            setHackDemoPanelVisibility(false);
        });
    }

    document.querySelectorAll('.debug-chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const metric = tab.getAttribute('data-debug-metric') || 'speed';
            setActiveDebugMetric(metric);
        });
    });

    panelHeader.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        if (event.target.closest('button, select, input, option, label')) return;
        const rect = panel.getBoundingClientRect();
        debugPanelDragState.active = true;
        debugPanelDragState.offsetX = event.clientX - rect.left;
        debugPanelDragState.offsetY = event.clientY - rect.top;
    });

    document.addEventListener('mousemove', (event) => {
        if (!debugPanelDragState.active) return;
        const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
        const left = Math.max(0, Math.min(maxLeft, event.clientX - debugPanelDragState.offsetX));
        const top = Math.max(0, Math.min(maxTop, event.clientY - debugPanelDragState.offsetY));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (!debugPanelDragState.active) return;
        debugPanelDragState.active = false;
        saveHackDemoPanelPosition(panel);
    });

    window.addEventListener('online', () => {
        if (hackDemoState.running) appendHackDemoLog('Network status: ONLINE');
    });
    window.addEventListener('offline', () => {
        if (hackDemoState.running) appendHackDemoLog('Network status: OFFLINE');
    });
    window.addEventListener('resize', () => {
        renderDebugDashboardChart();
    });

    document.addEventListener('change', (event) => {
        const toggle = event.target.closest('.toggle-input[data-feature]');
        if (!toggle || !hackDemoState.running) return;

        const featureId = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        if (!featureId) return;

        appendHackDemoLog(`${getFeatureDisplayName(featureId)} ${toggle.checked ? 'enabled' : 'disabled'} in debug simulation.`, { force: true });
        runHackDemoTick('toggle');
    }, true);

    // Debug monitor should run by default, mini window stays hidden until opened manually.
    startHackDemo({ notify: false, showPanel: false });
}

function normalizeUiLayoutRemixConfig(configRaw) {
    const config = configRaw && typeof configRaw === 'object' ? configRaw : {};
    const sidebarPositionRaw = String(config.sidebarPosition || 'left').trim().toLowerCase();
    const legacyHeaderFlowRaw = String(config.headerFlow || '').trim().toLowerCase();
    const headerPositionRaw = String(config.headerPosition || (legacyHeaderFlowRaw === 'column' ? 'bottom' : 'top')).trim().toLowerCase();
    return {
        sidebarPosition: sidebarPositionRaw === 'right' ? 'right' : 'left',
        headerPosition: headerPositionRaw === 'bottom' ? 'bottom' : 'top'
    };
}

function getDefaultRequiredPermissionsByBehavior(behaviorValue) {
    const behavior = String(behaviorValue || '').trim();
    if (behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) return ['ui'];
    if (behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX) return ['ui'];
    if (behavior === PLUGIN_BEHAVIOR_PROFILE_BADGES_PLUS) return ['ui'];
    if (behavior === PLUGIN_BEHAVIOR_DEBUG_PACKETS_LITE) return ['debug'];
    if (behavior === PLUGIN_BEHAVIOR_CRASH_TEST_TOOLS) return ['debug'];
    if (behavior === PLUGIN_BEHAVIOR_MACRO_TOOLS_PACK) return ['automation'];
    if (behavior === PLUGIN_BEHAVIOR_WORKSPACE_TOOLS) return ['storage'];
    if (behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS) return ['ui', 'automation'];
    if (behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO) return ['ui'];
    return [];
}

function normalizePluginRequiredPermissions(rawPermissions, behaviorValue = '') {
    const defaults = getDefaultRequiredPermissionsByBehavior(behaviorValue);
    const source = Array.isArray(rawPermissions) ? rawPermissions : defaults;
    return Array.from(new Set(
        source
            .map(item => String(item || '').trim().toLowerCase())
            .filter(item => Object.prototype.hasOwnProperty.call(PLUGIN_PERMISSION_DEFINITIONS, item))
    ));
}

function normalizePluginPermissionMap(rawPermissions, requiredPermissions = []) {
    const source = rawPermissions && typeof rawPermissions === 'object' ? rawPermissions : {};
    const normalized = {};
    Object.keys(PLUGIN_PERMISSION_DEFINITIONS).forEach(permissionId => {
        if (source[permissionId] === undefined) {
            normalized[permissionId] = requiredPermissions.includes(permissionId);
            return;
        }
        normalized[permissionId] = Boolean(source[permissionId]);
    });
    return normalized;
}

function normalizePluginDependencies(rawDependencies) {
    if (!Array.isArray(rawDependencies)) return [];
    return rawDependencies
        .map(dep => {
            if (typeof dep === 'string') {
                const id = dep.trim();
                if (!id) return null;
                return { id, minVersion: '' };
            }
            const safeDep = dep && typeof dep === 'object' ? dep : {};
            const id = String(safeDep.id || safeDep.name || '').trim();
            const minVersion = String(safeDep.minVersion || '').trim();
            if (!id) return null;
            return { id, minVersion };
        })
        .filter(Boolean);
}

function getPluginDependencyIssues(plugin, installedPlugins = plugins) {
    const deps = Array.isArray(plugin?.dependencies) ? plugin.dependencies : [];
    if (!deps.length) return [];

    return deps.map(dep => {
        const installed = installedPlugins.find(candidate => candidate.id === dep.id);
        if (!installed) {
            return {
                severity: 'error',
                message: `Missing dependency: ${dep.id}${dep.minVersion ? ` (>= ${dep.minVersion})` : ''}`
            };
        }
        if (dep.minVersion && compareSemanticVersions(installed.version, dep.minVersion) < 0) {
            return {
                severity: 'warn',
                message: `Dependency version too low: ${dep.id} is ${installed.version}, needs ${dep.minVersion}+`
            };
        }
        return null;
    }).filter(Boolean);
}

function closePluginDependencyModal() {
    const modal = document.getElementById('pluginDepModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function openPluginDependencyModal(plugin, missingDependencies) {
    const modal = document.getElementById('pluginDepModal');
    const body = document.getElementById('pluginDepModalBody');
    const closeBtn = document.getElementById('closePluginDepModal');
    if (!modal || !body) return;

    const safePluginName = String(plugin?.name || plugin?.id || 'Unknown Plugin').trim() || 'Unknown Plugin';
    const uniqueMissing = Array.from(new Map(
        (Array.isArray(missingDependencies) ? missingDependencies : [])
            .map(item => [String(item.id || item.displayName || '').toLowerCase(), item])
    ).values());
    if (!uniqueMissing.length) return;

    pluginDependencyPromptState = {
        pluginId: String(plugin?.id || '').trim(),
        missingDependencies: uniqueMissing
    };

    const dependencyText = uniqueMissing
        .map(item => `<strong>${String(item.displayName || item.id || '').trim()}</strong>`)
        .join(', ');

    body.innerHTML = `
        <p class="setting-note">
            Plugin "<strong>${safePluginName}</strong>" requires the following plugins to be enabled:
            ${dependencyText}. Enable them or this plugin may not work correctly.
        </p>
        <div class="modal-buttons">
            <button class="modal-btn confirm" id="enableAllMissingDepsBtn" type="button">Enable All Missing</button>
            <button class="modal-btn cancel" id="continueMissingDepsBtn" type="button">Continue Anyway</button>
        </div>
    `;

    const enableBtn = body.querySelector('#enableAllMissingDepsBtn');
    const continueBtn = body.querySelector('#continueMissingDepsBtn');
    if (enableBtn) {
        enableBtn.addEventListener('click', () => {
            const missing = Array.isArray(pluginDependencyPromptState.missingDependencies)
                ? pluginDependencyPromptState.missingDependencies
                : [];
            let enabledCount = 0;
            missing.forEach(item => {
                const installedPlugin = plugins.find(candidate => candidate.id === item.id || String(candidate.name || '').toLowerCase() === String(item.id || '').toLowerCase());
                if (installedPlugin && !installedPlugin.enabled) {
                    installedPlugin.enabled = true;
                    enabledCount += 1;
                }
            });
            savePluginsToStorage();
            renderPluginsList();
            applyPluginRuntimeEffects();
            syncDynamicKeybindActions(true);
            showNotification(enabledCount > 0
                ? `Enabled ${enabledCount} dependency plugin${enabledCount === 1 ? '' : 's'}.`
                : 'No installable missing dependencies were found.');
            closePluginDependencyModal();
        });
    }
    if (continueBtn) {
        continueBtn.addEventListener('click', closePluginDependencyModal);
    }
    if (closeBtn) {
        closeBtn.onclick = closePluginDependencyModal;
    }
    if (modal.dataset.overlayBound !== 'true') {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closePluginDependencyModal();
            }
        });
        modal.dataset.overlayBound = 'true';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function checkPluginDependencies(plugin) {
    const normalizedDeps = normalizePluginDependencies(plugin?.dependencies || []);
    if (!normalizedDeps.length) return [];

    const missing = normalizedDeps
        .map(dep => {
            const id = String(dep.id || '').trim();
            if (!id) return null;
            const installed = plugins.find(candidate =>
                candidate.id === id ||
                String(candidate.name || '').trim().toLowerCase() === id.toLowerCase()
            );
            if (!installed) {
                return { id, displayName: id, installed: false, enabled: false };
            }
            if (!installed.enabled) {
                return { id: installed.id, displayName: installed.name || installed.id, installed: true, enabled: false };
            }
            return null;
        })
        .filter(Boolean);

    if (missing.length) {
        openPluginDependencyModal(plugin, missing);
    }
    return missing;
}

function getMissingRequiredPluginPermissions(plugin) {
    const required = Array.isArray(plugin?.requiredPermissions) ? plugin.requiredPermissions : [];
    const granted = plugin?.permissions && typeof plugin.permissions === 'object' ? plugin.permissions : {};
    return required.filter(permissionId => granted[permissionId] !== true);
}

function normalizePluginList(rawList) {
    if (!Array.isArray(rawList)) return [];
    const seenIds = new Set();
    return rawList.map((entry, index) => {
        const item = entry && typeof entry === 'object' ? entry : {};
        const normalizeLegacyCustomPageText = (value) => String(value || '')
            .replace(/Kust Page Studio/gi, 'Custom Page Studio')
            .replace(/Kust Page/gi, 'Custom Page');
        const name = String(item.name || `Plugin ${index + 1}`).trim() || `Plugin ${index + 1}`;
        const slug = String(item.slug || name || '')
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const id = String(item.id || slug || `plugin-${Date.now()}-${index}`).trim();
        const version = String(item.version || '1.0.0').trim() || '1.0.0';
        const author = String(item.author || '').trim();
        const sourceUrl = String(item.sourceUrl || item.source || '').trim();
        const description = String(item.description || '').trim();
        const enabled = Boolean(item.enabled);
        let behavior = String(item.behavior || '').trim();
        if (behavior === 'cards-containers-power') {
            behavior = PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL;
        }
        const normalizedName = (id === 'custom-page-studio' || behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO)
            ? normalizeLegacyCustomPageText(name)
            : name;
        let stability = String(item.stability || '').trim().toLowerCase();
        let experimental = item.experimental === true || stability === 'beta';
        if (id === 'custom-page-studio' || behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO) {
            if (!stability) stability = 'beta';
            experimental = true;
        }
        const configurable = item.configurable === true
            || behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL
            || behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX
            || behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS
            || behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO;
        const configureRoute = String(item.configureRoute || '').trim();
        const configureHint = normalizeLegacyCustomPageText(item.configureHint || '').trim();
        const requiredPermissions = normalizePluginRequiredPermissions(item.requiredPermissions, behavior);
        const permissions = normalizePluginPermissionMap(item.permissions, requiredPermissions);
        const dependencies = normalizePluginDependencies(item.dependencies);
        const infoSource = item.info && typeof item.info === 'object' ? item.info : {};
        const info = {
            title: normalizeLegacyCustomPageText(infoSource.title || item.infoTitle || '').trim(),
            what: normalizeLegacyCustomPageText(infoSource.what || item.infoWhat || description || '').trim(),
            how: normalizeLegacyCustomPageText(infoSource.how || item.infoHow || '').trim(),
            usage: normalizeLegacyCustomPageText(infoSource.usage || item.infoUsage || configureHint || '').trim(),
            notes: Array.isArray(infoSource.notes)
                ? infoSource.notes.map(note => normalizeLegacyCustomPageText(note).trim()).filter(Boolean)
                : []
        };
        const config = item.config && typeof item.config === 'object' ? JSON.parse(JSON.stringify(item.config)) : {};
        if (behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) {
            const disabledIds = Array.isArray(config.disabledTargetIds)
                ? config.disabledTargetIds.map(idValue => String(idValue || '').trim()).filter(Boolean)
                : [];
            config.disabledTargetIds = Array.from(new Set(disabledIds));
        }
        if (behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX) {
            const normalizedLayoutConfig = normalizeUiLayoutRemixConfig(config);
            config.sidebarPosition = normalizedLayoutConfig.sidebarPosition;
            config.headerPosition = normalizedLayoutConfig.headerPosition;
        }
        if (behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS) {
            Object.assign(config, normalizeWorkflowCanvasConfig(config));
        }
        if (behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO) {
            Object.assign(config, normalizeCustomPageStudioConfig(config));
        }
        return {
            id,
            name: normalizedName,
            version,
            author,
            sourceUrl,
            description,
            enabled,
            behavior,
            configurable,
            configureRoute,
            configureHint,
            info,
            config,
            stability,
            experimental,
            requiredPermissions,
            permissions,
            dependencies
        };
    }).filter(item => {
        if (LEGACY_REMOVED_PLUGIN_IDS.has(item.id)) return false;
        if (!item.id || seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
    });
}

function compareSemanticVersions(left, right) {
    const parse = (value) => String(value || '')
        .split('.')
        .map(part => parseInt(part, 10))
        .map(num => (Number.isFinite(num) ? num : 0));
    const a = parse(left);
    const b = parse(right);
    const len = Math.max(a.length, b.length, 3);
    for (let i = 0; i < len; i += 1) {
        const ai = a[i] || 0;
        const bi = b[i] || 0;
        if (ai > bi) return 1;
        if (ai < bi) return -1;
    }
    return 0;
}

function normalizeMarketplaceCatalogEntry(entry, index) {
    const safe = entry && typeof entry === 'object' ? entry : {};
    const pluginEntry = normalizePluginList([safe.plugin || safe])[0];
    if (!pluginEntry) return null;
    const tags = Array.isArray(safe.tags)
        ? safe.tags.map(tag => String(tag || '').trim()).filter(Boolean)
        : [];
    if (pluginEntry.experimental === true || pluginEntry.stability === 'beta') {
        if (!tags.some(tag => tag.toLowerCase() === 'beta')) tags.push('beta');
        if (!tags.some(tag => tag.toLowerCase() === 'experimental')) tags.push('experimental');
    }
    return {
        id: String(safe.id || pluginEntry.id || `market-${index + 1}`),
        name: String(safe.name || pluginEntry.name || `Marketplace Plugin ${index + 1}`),
        version: String(safe.version || pluginEntry.version || '1.0.0'),
        author: String(safe.author || pluginEntry.author || ''),
        category: String(safe.category || 'utility').toLowerCase(),
        tags,
        popularity: Number.isFinite(Number(safe.popularity)) ? Number(safe.popularity) : 0,
        addedAt: String(safe.addedAt || ''),
        description: String(safe.description || pluginEntry.description || ''),
        plugin: pluginEntry
    };
}

function getMarketplaceCatalog() {
    return MARKETPLACE_CATALOG
        .map((entry, index) => normalizeMarketplaceCatalogEntry(entry, index))
        .filter(Boolean);
}

function findInstalledPluginForMarketplace(entry) {
    if (!entry) return null;
    const pluginId = String(entry.plugin?.id || entry.id || '').trim();
    const byId = plugins.find(plugin => plugin.id === pluginId);
    if (byId) return byId;
    return plugins.find(plugin => plugin.name.toLowerCase() === String(entry.name || '').toLowerCase()) || null;
}

function getMarketplaceEntryStatus(entry) {
    const installed = findInstalledPluginForMarketplace(entry);
    if (!installed) {
        return { code: 'not-installed', label: 'NOT INSTALLED', installed: null, updateAvailable: false };
    }
    const updateAvailable = compareSemanticVersions(entry.version, installed.version) > 0;
    if (updateAvailable) {
        return { code: 'update', label: `UPDATE ${installed.version} -> ${entry.version}`, installed, updateAvailable: true };
    }
    return { code: 'installed', label: `INSTALLED v${installed.version}`, installed, updateAvailable: false };
}

function renderMarketplaceList() {
    const list = document.getElementById('marketplaceList');
    const summary = document.getElementById('marketplaceSummary');
    const searchInput = document.getElementById('marketplaceSearchInput');
    const categoryFilter = document.getElementById('marketplaceCategoryFilter');
    const statusFilter = document.getElementById('marketplaceStatusFilter');
    const sortSelect = document.getElementById('marketplaceSortSelect');
    if (!list) return;
    const canManagePlugins = isRoleAllowed('plugins');

    const allEntries = getMarketplaceCatalog();
    const query = String(searchInput?.value || '').trim().toLowerCase();
    const category = String(categoryFilter?.value || 'all').toLowerCase();
    const status = String(statusFilter?.value || 'all').toLowerCase();
    const sort = String(sortSelect?.value || 'popular').toLowerCase();

    let entries = allEntries.filter(entry => {
        if (category !== 'all' && entry.category !== category) return false;
        if (query) {
            const searchable = `${entry.name} ${entry.description} ${entry.author} ${entry.category} ${entry.tags.join(' ')}`.toLowerCase();
            if (!searchable.includes(query)) return false;
        }

        const state = getMarketplaceEntryStatus(entry);
        if (status === 'installed' && state.code !== 'installed') return false;
        if (status === 'not-installed' && state.code !== 'not-installed') return false;
        if (status === 'updates' && !state.updateAvailable) return false;
        return true;
    });

    entries = entries.sort((a, b) => {
        if (sort === 'name') {
            return a.name.localeCompare(b.name);
        }
        if (sort === 'newest') {
            return String(b.addedAt || '').localeCompare(String(a.addedAt || ''));
        }
        if (sort === 'installed') {
            const aInstalled = getMarketplaceEntryStatus(a).code !== 'not-installed' ? 1 : 0;
            const bInstalled = getMarketplaceEntryStatus(b).code !== 'not-installed' ? 1 : 0;
            if (aInstalled !== bInstalled) return bInstalled - aInstalled;
            return b.popularity - a.popularity;
        }
        return b.popularity - a.popularity;
    });

    list.innerHTML = '';
    if (!entries.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card';
        empty.innerHTML = '<div class="setting-note">No marketplace plugins match your filters.</div>';
        list.appendChild(empty);
        if (summary) summary.textContent = `Showing 0 of ${allEntries.length} plugins`;
        return;
    }

    entries.forEach(entry => {
        const state = getMarketplaceEntryStatus(entry);

        const card = document.createElement('div');
        card.className = 'setting-card marketplace-item';

        const header = document.createElement('div');
        header.className = 'marketplace-item-header';

        const meta = document.createElement('div');
        const name = document.createElement('div');
        name.className = 'marketplace-item-name';
        name.textContent = entry.name;
        const details = document.createElement('div');
        details.className = 'marketplace-item-meta';
        const parts = [`v${entry.version}`];
        if (entry.author) parts.push(`by ${entry.author}`);
        if (entry.addedAt) parts.push(`added ${entry.addedAt}`);
        details.textContent = parts.join(' | ');
        meta.appendChild(name);
        meta.appendChild(details);

        const statusBadge = document.createElement('span');
        statusBadge.className = `marketplace-status ${state.code}`;
        statusBadge.textContent = state.label;

        header.appendChild(meta);
        header.appendChild(statusBadge);
        card.appendChild(header);

        if (entry.description) {
            const note = document.createElement('p');
            note.className = 'setting-note';
            note.textContent = entry.description;
            card.appendChild(note);
        }

        const dependencyIssues = getPluginDependencyIssues(entry.plugin);
        const dependencyNote = document.createElement('p');
        dependencyNote.className = `debug-plugin-state-note${dependencyIssues.length ? ' warn' : ''}`;
        dependencyNote.textContent = (entry.plugin.dependencies && entry.plugin.dependencies.length)
            ? (dependencyIssues.length
                ? `Dependencies: ${dependencyIssues.map(item => item.message).join(' | ')}`
                : `Dependencies OK (${entry.plugin.dependencies.map(dep => dep.id).join(', ')})`)
            : 'Dependencies: none (standalone)';
        card.appendChild(dependencyNote);

        const tags = document.createElement('div');
        tags.className = 'marketplace-item-tags';
        [entry.category.toUpperCase(), ...entry.tags.slice(0, 5)].forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'marketplace-tag';
            chip.textContent = tag;
            tags.appendChild(chip);
        });
        card.appendChild(tags);

        const controls = document.createElement('div');
        controls.className = 'marketplace-item-controls';

        const infoBtn = document.createElement('button');
        infoBtn.className = 'btn-secondary';
        infoBtn.textContent = 'INFO';
        infoBtn.addEventListener('click', () => openPluginInfoModal(
            {
                ...entry.plugin,
                name: entry.name,
                version: entry.version,
                author: entry.author,
                description: entry.description
            },
            { category: entry.category, tags: entry.tags }
        ));
        controls.appendChild(infoBtn);

        if (state.code === 'not-installed') {
            const installBtn = document.createElement('button');
            installBtn.className = 'btn-primary';
            installBtn.textContent = 'INSTALL';
            installBtn.addEventListener('click', () => installMarketplacePlugin(entry.id));
            installBtn.disabled = !canManagePlugins;
            controls.appendChild(installBtn);
        } else {
            if (state.updateAvailable) {
                const updateBtn = document.createElement('button');
                updateBtn.className = 'btn-primary';
                updateBtn.textContent = 'UPDATE';
                updateBtn.addEventListener('click', () => installMarketplacePlugin(entry.id));
                updateBtn.disabled = !canManagePlugins;
                controls.appendChild(updateBtn);
            } else {
                const installedBtn = document.createElement('button');
                installedBtn.className = 'btn-secondary';
                installedBtn.textContent = 'INSTALLED';
                installedBtn.disabled = true;
                controls.appendChild(installedBtn);
            }

            const uninstallBtn = document.createElement('button');
            uninstallBtn.className = 'btn-secondary';
            uninstallBtn.textContent = 'UNINSTALL';
            uninstallBtn.setAttribute('data-safety-lock', 'required');
            uninstallBtn.addEventListener('click', () => uninstallMarketplacePlugin(entry.id));
            uninstallBtn.disabled = !canManagePlugins;
            controls.appendChild(uninstallBtn);

            if (state.installed && pluginNeedsConfigureButton(state.installed)) {
                const configureBtn = document.createElement('button');
                configureBtn.className = 'btn-secondary';
                configureBtn.textContent = 'CONFIGURE';
                configureBtn.addEventListener('click', () => openPluginConfiguration(state.installed.id));
                configureBtn.disabled = !canManagePlugins;
                controls.appendChild(configureBtn);
            }
        }

        card.appendChild(controls);
        list.appendChild(card);
    });

    if (summary) {
        summary.textContent = `Showing ${entries.length} of ${allEntries.length} plugins`;
    }
    applyRoleBasedControlState();
}

function installMarketplacePlugin(marketEntryId) {
    if (!isRoleAllowed('plugins')) {
        showNotification('Plugin install is blocked for this profile role.');
        return;
    }
    const entry = getMarketplaceCatalog().find(item => item.id === marketEntryId);
    if (!entry) return;

    const snapshot = getPluginsSnapshot();
    const payload = normalizePluginList([entry.plugin])[0];
    if (!payload) return;

    const existingIndex = plugins.findIndex(plugin => plugin.id === payload.id);
    if (existingIndex >= 0) {
        const previous = plugins[existingIndex];
        const hasUpdate = compareSemanticVersions(payload.version, previous.version) > 0;
        if (!hasUpdate) {
            showNotification(`${payload.name} is already up to date.`);
            return;
        }
        plugins[existingIndex] = {
            ...previous,
            ...payload,
            enabled: previous.enabled,
            config: previous.config && typeof previous.config === 'object' ? previous.config : payload.config
        };
        savePluginsToStorage();
        renderPluginsList();
        applyPluginRuntimeEffects();
        renderMarketplaceList();
        showNotification(`Plugin updated: ${payload.name}`);
        recordRecentChange(`Plugin updated from marketplace: ${payload.name}`, () => restorePluginsSnapshot(snapshot));
        return;
    }

    plugins.unshift(payload);
    savePluginsToStorage();
    renderPluginsList();
    applyPluginRuntimeEffects();
    renderMarketplaceList();
    showNotification(`Plugin installed: ${payload.name}`);
    recordRecentChange(`Plugin installed from marketplace: ${payload.name}`, () => restorePluginsSnapshot(snapshot));
}

function uninstallMarketplacePlugin(marketEntryId) {
    if (!isRoleAllowed('plugins')) {
        showNotification('Plugin uninstall is blocked for this profile role.');
        return;
    }
    const entry = getMarketplaceCatalog().find(item => item.id === marketEntryId);
    if (!entry) return;
    const installed = findInstalledPluginForMarketplace(entry);
    if (!installed) return;

    const snapshot = getPluginsSnapshot();
    if (pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === installed.id) {
        setPluginTargetSelectionMode(false);
        closePluginConfigModal();
    }
    plugins = plugins.filter(plugin => plugin.id !== installed.id);
    savePluginsToStorage();
    renderPluginsList();
    applyPluginRuntimeEffects();
    renderMarketplaceList();
    showNotification(`Plugin uninstalled: ${installed.name}`);
    recordRecentChange(`Plugin uninstalled from marketplace: ${installed.name}`, () => restorePluginsSnapshot(snapshot));
}

function findPluginById(pluginId) {
    return plugins.find(plugin => plugin.id === pluginId) || null;
}

function findEnabledPluginByBehavior(behaviorId) {
    return plugins.find(plugin => plugin.enabled && (plugin.behavior === behaviorId || plugin.id === behaviorId)) || null;
}

function getPluginConfigurableTargets() {
    const root = document.querySelector('.main-content');
    if (!root) return [];
    const targets = Array.from(root.querySelectorAll(PLUGIN_TARGET_SELECTORS.join(',')))
        .filter(el => !el.closest('#pluginConfigModal'))
        .filter(el => !el.closest('.toast-feed'))
        .filter(el => el.id !== 'pluginsSection')
        .filter(el => !el.closest('#pluginsSection'))
        .filter(el => el.id !== 'pluginManagerCard')
        .filter(el => !el.closest('#pluginManagerCard'));

    targets.forEach(target => {
        const existingId = String(target.getAttribute('data-plugin-target-id') || '').trim();
        if (existingId) {
            const match = existingId.match(/^plugin-target-(\d+)$/);
            if (match) {
                const usedId = Number(match[1]);
                if (Number.isFinite(usedId) && usedId >= pluginTargetIdCounter) {
                    pluginTargetIdCounter = usedId + 1;
                }
            }
            return;
        }
        target.setAttribute('data-plugin-target-id', `plugin-target-${pluginTargetIdCounter}`);
        pluginTargetIdCounter += 1;
    });
    return targets;
}

function getPluginTargetLabel(target) {
    if (!target) return 'Unknown';
    if (target.classList.contains('feature-card')) {
        return `Feature: ${target.querySelector('h3')?.textContent?.trim() || 'Card'}`;
    }
    if (target.classList.contains('setting-card')) {
        const section = target.closest('.settings-section')?.querySelector('h2')?.textContent?.trim() || 'Settings';
        const label = target.querySelector('label, h3')?.textContent?.trim() || 'Card';
        return `${section} - ${label}`;
    }
    if (target.classList.contains('settings-section')) {
        return `Section: ${target.querySelector('h2')?.textContent?.trim() || 'Settings Section'}`;
    }
    if (target.id === 'quickToggleBar') return 'Quick Toggle Bar';
    if (target.id === 'multiSelectToolbar') return 'Multi Select Toolbar';
    if (target.id === 'profilesList') return 'Profiles List';
    return target.className || target.tagName;
}

function pluginNeedsConfigureButton(plugin) {
    if (!plugin) return false;
    return Boolean(
        plugin.configurable
        || plugin.configureRoute
        || plugin.behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL
        || plugin.behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX
        || plugin.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS
        || plugin.behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO
    );
}

function createProfileRuntimeBadge(text, variant = '') {
    const badge = document.createElement('span');
    badge.className = `profile-plugin-badge${variant ? ` ${variant}` : ''}`;
    badge.textContent = String(text || '').toUpperCase();
    return badge;
}

function setProfileBadgesPlusRuntime(enabled) {
    const nextEnabled = Boolean(enabled);
    document.body.classList.toggle('plugin-profile-badges-plus-active', nextEnabled);
    if (profileBadgesPlusRuntimeEnabled === nextEnabled) return;
    profileBadgesPlusRuntimeEnabled = nextEnabled;
    if (document.getElementById('profilesList')) {
        loadProfiles();
    }
}

function setMacroToolsPackRuntime(enabled) {
    const nextEnabled = Boolean(enabled);
    document.body.classList.toggle('plugin-macro-tools-pack-active', nextEnabled);
    if (macroToolsPackRuntimeEnabled === nextEnabled) return;
    macroToolsPackRuntimeEnabled = nextEnabled;
    if (document.getElementById('macrosList')) {
        renderMacrosList();
    }
}

function setWorkspaceToolsRuntime(enabled) {
    const nextEnabled = Boolean(enabled);
    document.body.classList.toggle('plugin-workspace-tools-active', nextEnabled);
    if (workspaceToolsRuntimeEnabled === nextEnabled) return;
    workspaceToolsRuntimeEnabled = nextEnabled;
    ensureWorkspaceToolsControls();
}

function triggerIntentionalCrashTest() {
    if (!crashTestToolsRuntimeEnabled) return;
    if (!isRoleAllowed('destructive')) {
        showNotification('Crash test is blocked for this profile role.');
        return;
    }
    storeCrashReport('Intentional crash test triggered by Crash Test Tools plugin.', { source: 'crash-test-tools' });
    updateCrashReportStatusUi();
    showNotification('Crash test started. Expect a forced runtime error...');
    setTimeout(() => {
        throw new Error('[Crash Test Tools] Intentional crash for recovery validation');
    }, 60);
}

function renderCrashTestPluginAction() {
    const host = document.getElementById('crashRecoveryPluginActions');
    if (!host) return;
    host.innerHTML = '';
    if (!crashTestToolsRuntimeEnabled) return;

    const btn = document.createElement('button');
    btn.className = 'btn-secondary';
    btn.id = 'forceCrashTestBtn';
    btn.textContent = 'FORCE CRASH TEST';
    btn.setAttribute('data-safety-lock', 'required');
    btn.addEventListener('click', triggerIntentionalCrashTest);
    host.appendChild(btn);
    applyRoleBasedControlState();
}

function setCrashTestToolsRuntime(enabled) {
    const nextEnabled = Boolean(enabled);
    if (crashTestToolsRuntimeEnabled === nextEnabled) {
        renderCrashTestPluginAction();
        return;
    }
    crashTestToolsRuntimeEnabled = nextEnabled;
    renderCrashTestPluginAction();
}

function applyUiLayoutRemixPlugin(plugin) {
    document.body.classList.remove('plugin-ui-layout-remix-active');
    document.body.classList.remove('plugin-ui-layout-sidebar-right');
    document.body.classList.remove('plugin-ui-layout-header-bottom');

    if (!plugin || !plugin.enabled) return;
    const config = normalizeUiLayoutRemixConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };

    document.body.classList.add('plugin-ui-layout-remix-active');
    if (config.sidebarPosition === 'right') {
        document.body.classList.add('plugin-ui-layout-sidebar-right');
    }
    if (config.headerPosition === 'bottom') {
        document.body.classList.add('plugin-ui-layout-header-bottom');
    }
}

function getPluginRuntimePageKey(pluginId) {
    const safeId = String(pluginId || 'plugin')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'plugin';
    return `plugin-${safeId}`;
}

function ensureRuntimePluginPage(plugin, options = {}) {
    if (!plugin || typeof plugin !== 'object') return null;
    const pageKey = getPluginRuntimePageKey(plugin.id);
    const titleText = String(options.title || plugin.name || 'PLUGIN').trim() || 'PLUGIN';
    const navLabel = String(options.navLabel || titleText).trim() || 'PLUGIN';
    const iconText = String(options.iconText || 'PL').trim() || 'PL';

    const sidebarNav = document.querySelector('.sidebar-nav');
    const pagesContainer = document.querySelector('.pages-container');
    if (!sidebarNav || !pagesContainer) return null;

    const ownerId = String(plugin.ownerPluginId || plugin.id || '').trim();
    let navBtn = sidebarNav.querySelector(`.nav-btn[data-plugin-page="${plugin.id}"]`);
    if (!navBtn) {
        navBtn = document.createElement('button');
        navBtn.className = 'nav-btn plugin-runtime-nav';
        navBtn.setAttribute('data-plugin-page', plugin.id);
        navBtn.setAttribute('data-plugin-owner', ownerId);
        navBtn.setAttribute('type', 'button');
        const firstSubButton = sidebarNav.querySelector('.nav-sub-btn');
        if (firstSubButton) {
            sidebarNav.insertBefore(navBtn, firstSubButton);
        } else {
            sidebarNav.appendChild(navBtn);
        }
    }
    navBtn.setAttribute('data-plugin-owner', ownerId);

    navBtn.setAttribute('data-page', pageKey);
    navBtn.innerHTML = `
        <span class="nav-icon">${iconText.toUpperCase().slice(0, 2)}</span>
        <span class="nav-text">${navLabel.toUpperCase().slice(0, 22)}</span>
    `;
    navBtn.onclick = () => {
        selectPage(pageKey);
        updatePageTitle(pageKey);
    };

    let page = document.getElementById(`page-${pageKey}`);
    if (!page) {
        page = document.createElement('div');
        page.className = 'page plugin-runtime-page';
        page.id = `page-${pageKey}`;
        page.setAttribute('data-page', pageKey);
        page.style.display = 'none';
        pagesContainer.appendChild(page);
    }

    dynamicPluginPageTitles.set(pageKey, titleText.toUpperCase());
    return { pageKey, page, navBtn };
}

function removeRuntimePluginPage(pluginId) {
    const pageKey = getPluginRuntimePageKey(pluginId);
    const navBtn = document.querySelector(`.nav-btn[data-plugin-page="${pluginId}"]`);
    const page = document.getElementById(`page-${pageKey}`);
    const wasActive = Boolean(page && page.classList.contains('active'));
    if (navBtn) navBtn.remove();
    if (page) page.remove();
    dynamicPluginPageTitles.delete(pageKey);
    if (wasActive) {
        selectPage('combat');
        updatePageTitle('combat');
    }
}

function normalizeWorkflowCanvasStep(stepRaw, stepIndex = 0) {
    const safeStep = stepRaw && typeof stepRaw === 'object' ? stepRaw : {};
    const id = String(safeStep.id || `wf-step-${Date.now()}-${stepIndex}`).trim() || `wf-step-${Date.now()}-${stepIndex}`;
    const typeRaw = String(safeStep.type || 'feature-toggle').trim();
    const type = ['feature-toggle', 'macro-run', 'page-open', 'preset-apply', 'save-settings', 'delay-only'].includes(typeRaw)
        ? typeRaw
        : 'feature-toggle';

    const featureOptions = getHackToggles()
        .map(toggle => String(toggle.getAttribute('data-feature') || '').trim().toLowerCase())
        .filter(Boolean);
    const fallbackFeature = featureOptions[0] || 'killaura';
    const feature = featureOptions.includes(String(safeStep.feature || '').trim().toLowerCase())
        ? String(safeStep.feature || '').trim().toLowerCase()
        : fallbackFeature;
    const featureMode = ['toggle', 'on', 'off'].includes(String(safeStep.featureMode || '').trim().toLowerCase())
        ? String(safeStep.featureMode || '').trim().toLowerCase()
        : 'on';
    const page = PAGE_OPTIONS.includes(String(safeStep.page || '').trim().toLowerCase())
        ? String(safeStep.page || '').trim().toLowerCase()
        : 'combat';
    const preset = Object.prototype.hasOwnProperty.call(BUILTIN_HACK_PRESETS, String(safeStep.preset || '').trim().toLowerCase())
        ? String(safeStep.preset || '').trim().toLowerCase()
        : 'pvp';
    const delayMs = Math.max(0, Math.min(5000, Math.round(parseNumberWithFallback(safeStep.delayMs, 200))));
    const label = String(safeStep.label || '').trim();
    const macroId = String(safeStep.macroId || '').trim();

    return { id, type, feature, featureMode, macroId, page, preset, delayMs, label };
}

function normalizeWorkflowCanvasConfig(configRaw) {
    const config = configRaw && typeof configRaw === 'object' ? configRaw : {};
    const steps = Array.isArray(config.steps)
        ? config.steps.map((step, index) => normalizeWorkflowCanvasStep(step, index))
        : [];
    const nodes = Array.isArray(config.nodes)
        ? config.nodes.map((node, index) => normalizeWorkflowCanvasNode(node, index))
        : [];
    const connections = Array.isArray(config.connections)
        ? config.connections
            .map(link => normalizeWorkflowCanvasConnection(link))
            .filter(Boolean)
        : [];
    const usingLegacySteps = !nodes.length && steps.length > 0;
    const fallbackNodes = nodes.length ? nodes : convertLegacyWorkflowStepsToNodes(steps);
    const fallbackConnections = connections.length
        ? connections
        : (usingLegacySteps ? buildLinearWorkflowConnections(fallbackNodes) : []);
    const selectedNodeId = String(config.selectedNodeId || fallbackNodes[0]?.id || '').trim();
    return {
        pageTitle: String(config.pageTitle || 'Workflow Canvas').trim() || 'Workflow Canvas',
        loopCount: Math.max(1, Math.min(10, Math.round(parseNumberWithFallback(config.loopCount, 1)))),
        steps,
        nodes: fallbackNodes,
        connections: fallbackConnections,
        selectedNodeId
    };
}

function normalizeWorkflowCanvasNode(nodeRaw, nodeIndex = 0) {
    const node = nodeRaw && typeof nodeRaw === 'object' ? nodeRaw : {};
    const typeRaw = String(node.type || 'macro').trim().toLowerCase();
    const type = ['macro', 'automation', 'keybind'].includes(typeRaw) ? typeRaw : 'macro';
    const id = String(node.id || `wf-node-${Date.now()}-${nodeIndex}`).trim() || `wf-node-${Date.now()}-${nodeIndex}`;
    const x = Math.round(parseNumberWithFallback(node.x, 60 + (nodeIndex % 4) * 280));
    const y = Math.round(parseNumberWithFallback(node.y, 50 + Math.floor(nodeIndex / 4) * 180));
    return {
        id,
        type,
        targetId: String(node.targetId || '').trim(),
        delayMs: Math.max(0, Math.min(5000, Math.round(parseNumberWithFallback(node.delayMs, 0)))),
        x,
        y,
        title: String(node.title || '').trim()
    };
}

function normalizeWorkflowCanvasConnection(linkRaw) {
    const link = linkRaw && typeof linkRaw === 'object' ? linkRaw : {};
    const from = String(link.from || '').trim();
    const to = String(link.to || '').trim();
    if (!from || !to || from === to) return null;
    return { from, to };
}

function convertLegacyWorkflowStepsToNodes(steps) {
    if (!Array.isArray(steps) || !steps.length) return [];
    return steps.map((step, index) => {
        const node = {
            id: `wf-node-legacy-${index + 1}`,
            type: 'keybind',
            targetId: '',
            delayMs: Math.max(0, Math.min(5000, Math.round(parseNumberWithFallback(step.delayMs, 0)))),
            x: 60 + (index % 4) * 280,
            y: 60 + Math.floor(index / 4) * 180
        };
        if (step.type === 'macro-run' && step.macroId) {
            node.type = 'macro';
            node.targetId = step.macroId;
            return normalizeWorkflowCanvasNode(node, index);
        }
        if (step.type === 'page-open' && step.page) {
            node.targetId = `nav-${step.page}`;
            return normalizeWorkflowCanvasNode(node, index);
        }
        if (step.type === 'save-settings') {
            node.targetId = 'action-save';
            return normalizeWorkflowCanvasNode(node, index);
        }
        if (step.type === 'preset-apply' && step.preset) {
            node.targetId = `keybind:preset:${step.preset}`;
            return normalizeWorkflowCanvasNode(node, index);
        }
        if (step.type === 'feature-toggle' && step.feature) {
            if (step.featureMode === 'on') {
                node.targetId = `keybind:feature-on:${step.feature}`;
            } else if (step.featureMode === 'off') {
                node.targetId = `keybind:feature-off:${step.feature}`;
            } else {
                node.targetId = `toggle-${step.feature}`;
            }
            return normalizeWorkflowCanvasNode(node, index);
        }
        return normalizeWorkflowCanvasNode(node, index);
    });
}

function buildLinearWorkflowConnections(nodes) {
    if (!Array.isArray(nodes) || nodes.length < 2) return [];
    const links = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
        links.push({ from: nodes[i].id, to: nodes[i + 1].id });
    }
    return links;
}

function getWorkflowNodeTargetOptions(type) {
    if (type === 'macro') {
        return macros.map(item => ({ value: item.id, label: item.name }));
    }
    if (type === 'automation') {
        return automations.map(item => ({ value: item.id, label: item.name }));
    }
    return getAllKeybindActions()
        .map(action => ({
            value: action.id,
            label: `${KEYBIND_GROUP_TITLES[action.group] || action.group.toUpperCase()} | ${getActionDisplayName(action.id)}`
        }));
}

function buildWorkflowExecutionOrder(config) {
    const nodes = Array.isArray(config.nodes) ? config.nodes : [];
    const links = Array.isArray(config.connections) ? config.connections : [];
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const incoming = new Map(nodes.map(node => [node.id, 0]));
    const nextMap = new Map(nodes.map(node => [node.id, []]));

    links.forEach(link => {
        if (!nodeById.has(link.from) || !nodeById.has(link.to)) return;
        nextMap.get(link.from).push(link.to);
        incoming.set(link.to, (incoming.get(link.to) || 0) + 1);
    });

    const roots = nodes
        .filter(node => (incoming.get(node.id) || 0) === 0)
        .sort((a, b) => (a.x - b.x) || (a.y - b.y));
    const order = [];
    const visited = new Set();

    const visit = (nodeId, depth = 0) => {
        if (depth > 120) return;
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        const node = nodeById.get(nodeId);
        if (!node) return;
        order.push(node);
        const nextNodes = (nextMap.get(nodeId) || [])
            .slice()
            .sort((left, right) => {
                const a = nodeById.get(left);
                const b = nodeById.get(right);
                return ((a?.x || 0) - (b?.x || 0)) || ((a?.y || 0) - (b?.y || 0));
            });
        nextNodes.forEach(nextId => visit(nextId, depth + 1));
    };

    roots.forEach(root => visit(root.id));
    nodes.forEach(node => visit(node.id));
    return order;
}

async function executeWorkflowCanvasNodeAction(node) {
    if (!node) return false;
    if (node.type === 'macro') {
        if (!node.targetId) return false;
        await runMacroById(node.targetId);
        return true;
    }
    if (node.type === 'automation') {
        if (!node.targetId) return false;
        return runAutomationByKeybind(node.targetId);
    }
    if (!node.targetId) return false;
    const action = findKeybindActionById(node.targetId);
    if (action && typeof action.run === 'function') {
        action.run();
        return true;
    }
    if (node.targetId.startsWith('keybind:feature-on:')) {
        const feature = node.targetId.replace('keybind:feature-on:', '').trim();
        if (feature) setFeatureStateByKeybind(feature, true);
        return Boolean(feature);
    }
    if (node.targetId.startsWith('keybind:feature-off:')) {
        const feature = node.targetId.replace('keybind:feature-off:', '').trim();
        if (feature) setFeatureStateByKeybind(feature, false);
        return Boolean(feature);
    }
    if (node.targetId.startsWith('keybind:preset:')) {
        const preset = node.targetId.replace('keybind:preset:', '').trim().toLowerCase();
        if (BUILTIN_HACK_PRESETS[preset]) {
            applyPresetById(`builtin:${preset}`);
            return true;
        }
    }
    return false;
}

async function runWorkflowCanvasPlugin(pluginId) {
    const plugin = findPluginById(pluginId);
    if (!plugin || !plugin.enabled) return;
    const config = normalizeWorkflowCanvasConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };

    if (!config.nodes.length) {
        showNotification('Workflow Canvas has no nodes yet.');
        return;
    }

    const existing = workflowCanvasRunState.get(plugin.id);
    if (existing && existing.running) {
        showNotification('Workflow Canvas is already running.');
        return;
    }

    const state = { running: true, token: Date.now() };
    workflowCanvasRunState.set(plugin.id, state);
    showNotification(`Workflow started: ${plugin.name}`);

    let executed = 0;
    try {
        const executionOrder = buildWorkflowExecutionOrder(config);
        for (let loop = 0; loop < config.loopCount; loop += 1) {
            for (const node of executionOrder) {
                const latest = workflowCanvasRunState.get(plugin.id);
                if (!latest || latest.token !== state.token || !latest.running) {
                    return;
                }

                const handled = await executeWorkflowCanvasNodeAction(node);
                if (handled) executed += 1;
                if (node.delayMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, node.delayMs));
                }
            }
        }
        showNotification(`Workflow completed (${executed} steps).`);
        recordRecentChange(`Workflow run: ${plugin.name} (${executed} steps)`);
    } finally {
        const latest = workflowCanvasRunState.get(plugin.id);
        if (latest && latest.token === state.token) {
            workflowCanvasRunState.set(plugin.id, { running: false, token: state.token });
        }
        renderWorkflowCanvasSettingsPage(plugin);
    }
}

function renderWorkflowCanvasPluginPage(plugin) {
    if (!plugin || plugin.behavior !== PLUGIN_BEHAVIOR_WORKFLOW_CANVAS || !plugin.enabled) return;
    const config = normalizeWorkflowCanvasConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };

    const mount = ensureRuntimePluginPage(plugin, {
        title: config.pageTitle,
        navLabel: 'Workflow',
        iconText: 'WF'
    });
    if (!mount) return;

    const { page } = mount;
    const running = Boolean(workflowCanvasRunState.get(plugin.id)?.running);
    const featureOptions = getHackToggles().map(toggle => {
        const feature = String(toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        const label = toggle.closest('.feature-card')?.querySelector('h3')?.textContent?.trim() || feature;
        return { value: feature, label };
    }).filter(entry => entry.value);
    const macroOptions = macros.map(macro => ({ value: macro.id, label: macro.name }));

    page.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'plugin-page-wrap workflow-canvas-page';

    const controlsCard = document.createElement('div');
    controlsCard.className = 'setting-card';
    controlsCard.innerHTML = `
        <label>Workflow Canvas</label>
        <p class="setting-note">Build ordered steps and run them in real Nexus runtime. Supports hacks, macros, pages, presets and delays.</p>
        <div class="setting-inline-controls">
            <button class="btn-secondary" id="workflowAddStepBtn-${plugin.id}" type="button">ADD STEP</button>
            <button class="btn-secondary" id="workflowClearStepsBtn-${plugin.id}" data-safety-lock="required" type="button">CLEAR</button>
            <button class="btn-primary" id="workflowRunBtn-${plugin.id}" type="button">${running ? 'RUNNING...' : 'RUN WORKFLOW'}</button>
        </div>
    `;

    const titleRow = document.createElement('div');
    titleRow.className = 'setting-inline-controls';
    const titleInput = document.createElement('input');
    titleInput.className = 'modal-input';
    titleInput.value = config.pageTitle;
    titleInput.placeholder = 'Page title...';
    titleInput.style.maxWidth = '260px';
    const loopLabel = document.createElement('span');
    loopLabel.className = 'setting-note';
    loopLabel.textContent = 'Loops';
    const loopInput = document.createElement('input');
    loopInput.type = 'number';
    loopInput.className = 'spinbox';
    loopInput.min = '1';
    loopInput.max = '10';
    loopInput.value = String(config.loopCount);
    loopInput.style.maxWidth = '90px';
    titleRow.appendChild(titleInput);
    titleRow.appendChild(loopLabel);
    titleRow.appendChild(loopInput);
    controlsCard.appendChild(titleRow);
    wrap.appendChild(controlsCard);

    const list = document.createElement('div');
    list.className = 'workflow-canvas-list';
    if (!config.steps.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'No workflow steps yet. Press ADD STEP.';
        list.appendChild(empty);
    }

    config.steps.forEach((step, index) => {
        const card = document.createElement('div');
        card.className = 'setting-card workflow-step-card';

        const header = document.createElement('div');
        header.className = 'workflow-step-header';
        const heading = document.createElement('strong');
        heading.textContent = `STEP ${index + 1}`;
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'keybind-control-btn';
        moveUpBtn.textContent = 'UP';
        moveUpBtn.disabled = index === 0;
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'keybind-control-btn';
        moveDownBtn.textContent = 'DOWN';
        moveDownBtn.disabled = index >= config.steps.length - 1;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        header.appendChild(heading);
        header.appendChild(moveUpBtn);
        header.appendChild(moveDownBtn);
        header.appendChild(deleteBtn);
        card.appendChild(header);

        const labelInput = document.createElement('input');
        labelInput.className = 'modal-input';
        labelInput.placeholder = 'Optional step label...';
        labelInput.value = step.label;
        card.appendChild(labelInput);

        const typeSelect = document.createElement('select');
        typeSelect.className = 'combo-box';
        [
            ['feature-toggle', 'Feature Toggle'],
            ['macro-run', 'Run Macro'],
            ['page-open', 'Open Page'],
            ['preset-apply', 'Apply Preset'],
            ['save-settings', 'Save Settings'],
            ['delay-only', 'Delay Only']
        ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            typeSelect.appendChild(option);
        });
        typeSelect.value = step.type;
        card.appendChild(typeSelect);

        const detailRow = document.createElement('div');
        detailRow.className = 'workflow-step-details';
        if (step.type === 'feature-toggle') {
            const featureSelect = document.createElement('select');
            featureSelect.className = 'combo-box';
            featureOptions.forEach(optionData => {
                const option = document.createElement('option');
                option.value = optionData.value;
                option.textContent = optionData.label.toUpperCase();
                featureSelect.appendChild(option);
            });
            if (featureSelect.options.length === 0) {
                const option = document.createElement('option');
                option.value = 'killaura';
                option.textContent = 'KILLAURA';
                featureSelect.appendChild(option);
            }
            featureSelect.value = step.feature;

            const modeSelect = document.createElement('select');
            modeSelect.className = 'combo-box';
            [
                ['on', 'SET ON'],
                ['off', 'SET OFF'],
                ['toggle', 'TOGGLE']
            ].forEach(([value, label]) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = label;
                modeSelect.appendChild(option);
            });
            modeSelect.value = step.featureMode;
            detailRow.appendChild(featureSelect);
            detailRow.appendChild(modeSelect);

            featureSelect.addEventListener('change', () => {
                step.feature = featureSelect.value;
                savePluginsToStorage();
            });
            modeSelect.addEventListener('change', () => {
                step.featureMode = modeSelect.value;
                savePluginsToStorage();
            });
        } else if (step.type === 'macro-run') {
            const macroSelect = document.createElement('select');
            macroSelect.className = 'combo-box';
            if (!macroOptions.length) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'NO MACROS AVAILABLE';
                macroSelect.appendChild(option);
            } else {
                macroOptions.forEach(optionData => {
                    const option = document.createElement('option');
                    option.value = optionData.value;
                    option.textContent = optionData.label.toUpperCase();
                    macroSelect.appendChild(option);
                });
            }
            macroSelect.value = step.macroId;
            macroSelect.addEventListener('change', () => {
                step.macroId = macroSelect.value;
                savePluginsToStorage();
            });
            detailRow.appendChild(macroSelect);
        } else if (step.type === 'page-open') {
            const pageSelect = document.createElement('select');
            pageSelect.className = 'combo-box';
            PAGE_OPTIONS.filter(pageName => pageName !== 'last').forEach(pageName => {
                const option = document.createElement('option');
                option.value = pageName;
                option.textContent = pageName.toUpperCase();
                pageSelect.appendChild(option);
            });
            pageSelect.value = step.page;
            pageSelect.addEventListener('change', () => {
                step.page = pageSelect.value;
                savePluginsToStorage();
            });
            detailRow.appendChild(pageSelect);
        } else if (step.type === 'preset-apply') {
            const presetSelect = document.createElement('select');
            presetSelect.className = 'combo-box';
            Object.keys(BUILTIN_HACK_PRESETS).forEach(presetKey => {
                const option = document.createElement('option');
                option.value = presetKey;
                option.textContent = presetKey.toUpperCase();
                presetSelect.appendChild(option);
            });
            presetSelect.value = step.preset;
            presetSelect.addEventListener('change', () => {
                step.preset = presetSelect.value;
                savePluginsToStorage();
            });
            detailRow.appendChild(presetSelect);
        } else {
            const info = document.createElement('span');
            info.className = 'setting-note';
            info.textContent = step.type === 'save-settings'
                ? 'This step runs SAVE SETTINGS.'
                : 'Delay-only step (wait then continue).';
            detailRow.appendChild(info);
        }
        card.appendChild(detailRow);

        const delayRow = document.createElement('div');
        delayRow.className = 'setting-inline-controls';
        const delayLabel = document.createElement('span');
        delayLabel.className = 'setting-note';
        delayLabel.textContent = 'Delay (ms)';
        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.className = 'spinbox';
        delayInput.min = '0';
        delayInput.max = '5000';
        delayInput.value = String(step.delayMs);
        delayInput.style.maxWidth = '120px';
        delayRow.appendChild(delayLabel);
        delayRow.appendChild(delayInput);
        card.appendChild(delayRow);

        labelInput.addEventListener('change', () => {
            step.label = String(labelInput.value || '').trim();
            savePluginsToStorage();
        });
        typeSelect.addEventListener('change', () => {
            step.type = typeSelect.value;
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
        });
        delayInput.addEventListener('change', () => {
            step.delayMs = Math.max(0, Math.min(5000, Math.round(parseNumberWithFallback(delayInput.value, step.delayMs))));
            delayInput.value = String(step.delayMs);
            savePluginsToStorage();
        });

        moveUpBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            const prev = config.steps[index - 1];
            config.steps[index - 1] = step;
            config.steps[index] = prev;
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
            recordRecentChange('Workflow step moved up', () => restorePluginsSnapshot(snapshot));
        });
        moveDownBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            const next = config.steps[index + 1];
            config.steps[index + 1] = step;
            config.steps[index] = next;
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
            recordRecentChange('Workflow step moved down', () => restorePluginsSnapshot(snapshot));
        });
        deleteBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            config.steps = config.steps.filter(item => item.id !== step.id);
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
            recordRecentChange('Workflow step deleted', () => restorePluginsSnapshot(snapshot));
        });

        list.appendChild(card);
    });
    wrap.appendChild(list);
    page.appendChild(wrap);

    const addBtn = document.getElementById(`workflowAddStepBtn-${plugin.id}`);
    const clearBtn = document.getElementById(`workflowClearStepsBtn-${plugin.id}`);
    const runBtn = document.getElementById(`workflowRunBtn-${plugin.id}`);
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            config.steps.push(normalizeWorkflowCanvasStep({}, config.steps.length));
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
            recordRecentChange('Workflow step added', () => restorePluginsSnapshot(snapshot));
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            config.steps = [];
            plugin.config = normalizeWorkflowCanvasConfig(config);
            savePluginsToStorage();
            renderWorkflowCanvasPluginPage(plugin);
            recordRecentChange('Workflow steps cleared', () => restorePluginsSnapshot(snapshot));
        });
    }
    if (runBtn) {
        runBtn.disabled = running;
        runBtn.addEventListener('click', () => {
            runWorkflowCanvasPlugin(plugin.id);
        });
    }

    titleInput.addEventListener('change', () => {
        config.pageTitle = String(titleInput.value || '').trim() || 'Workflow Canvas';
        plugin.config = normalizeWorkflowCanvasConfig(config);
        savePluginsToStorage();
        renderWorkflowCanvasPluginPage(plugin);
    });
    loopInput.addEventListener('change', () => {
        config.loopCount = Math.max(1, Math.min(10, Math.round(parseNumberWithFallback(loopInput.value, config.loopCount))));
        plugin.config = normalizeWorkflowCanvasConfig(config);
        savePluginsToStorage();
        renderWorkflowCanvasPluginPage(plugin);
    });

    applyMicroCardAnimations(page);
}

function setWorkflowCanvasRuntime(activePlugins, installedPlugins = []) {
    const runtimePlugins = Array.isArray(activePlugins) ? activePlugins : [];
    const installed = Array.isArray(installedPlugins) ? installedPlugins : [];
    workflowCanvasRuntimeEnabled = runtimePlugins.length > 0;

    plugins.forEach(plugin => {
        if (plugin.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS && !plugin.enabled) {
            removeRuntimePluginPage(plugin.id);
            workflowCanvasRunState.delete(plugin.id);
            workflowCanvasEditorState.delete(plugin.id);
        }
    });
    const workflowInstalled = installed.length > 0;
    const workflowAvailable = runtimePlugins.length > 0;
    const workflowBtn = document.getElementById('openWorkflowCanvasBtn');
    const workflowCard = document.getElementById('workflowCanvasSettingsCard');
    const workflowGroupBtn = document.getElementById('keybindGroupWorkflowBtn');
    if (workflowCard) workflowCard.hidden = !workflowInstalled;
    if (workflowGroupBtn) workflowGroupBtn.hidden = !workflowInstalled;
    if (workflowBtn) {
        workflowBtn.disabled = !workflowAvailable;
        workflowBtn.textContent = workflowAvailable
            ? 'OPEN WORKFLOW CANVAS'
            : (workflowInstalled ? 'ENABLE WORKFLOW PLUGIN' : 'INSTALL WORKFLOW PLUGIN');
    }
    if (!workflowAvailable) {
        if (activeKeybindGroup === 'workflow') {
            setActiveKeybindGroup('navigation');
        }
        closeWorkflowCanvasConfigurator();
    }
    runtimePlugins.forEach(plugin => {
        removeRuntimePluginPage(plugin.id);
        renderWorkflowCanvasSettingsPage(plugin);
    });
}

function getWorkflowEditorState(pluginId) {
    const existing = workflowCanvasEditorState.get(pluginId);
    if (existing) return existing;
    const state = { pendingOutputNodeId: '' };
    workflowCanvasEditorState.set(pluginId, state);
    return state;
}

function commitWorkflowCanvasConfig(plugin, configLike, rerender = true) {
    plugin.config = normalizeWorkflowCanvasConfig(configLike);
    savePluginsToStorage();
    if (rerender) renderWorkflowCanvasSettingsPage(plugin);
}

function renderWorkflowCanvasConnectionsSvg(svg, nodes, links) {
    if (!svg) return;
    svg.innerHTML = '';
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    links.forEach(link => {
        const fromNode = nodeMap.get(link.from);
        const toNode = nodeMap.get(link.to);
        if (!fromNode || !toNode) return;
        const startX = fromNode.x + 236;
        const startY = fromNode.y + 68;
        const endX = toNode.x + 4;
        const endY = toNode.y + 68;
        const bend = Math.max(60, Math.abs(endX - startX) * 0.45);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'workflow-link-path');
        path.setAttribute('d', `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`);
        svg.appendChild(path);
    });
}

function renderWorkflowCanvasSettingsPage(plugin) {
    if (!plugin || !plugin.enabled || plugin.behavior !== PLUGIN_BEHAVIOR_WORKFLOW_CANVAS) return;
    const canManage = isRoleAllowed('plugins');
    const config = normalizeWorkflowCanvasConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };
    const state = getWorkflowEditorState(plugin.id);
    const page = document.getElementById('settingsWorkflowPage');
    if (!page) return;

    const loopInput = document.getElementById('workflowCanvasLoopInput');
    const runBtn = document.getElementById('workflowCanvasRunBtn');
    const addMacroBtn = document.getElementById('workflowCanvasAddMacroNodeBtn');
    const addAutomationBtn = document.getElementById('workflowCanvasAddAutomationNodeBtn');
    const addKeyBtn = document.getElementById('workflowCanvasAddKeyNodeBtn');
    const clearBtn = document.getElementById('workflowCanvasClearBtn');
    const nodesLayer = document.getElementById('workflowCanvasNodesLayer');
    const svg = document.getElementById('workflowCanvasSvg');
    const linksList = document.getElementById('workflowCanvasConnectionsList');
    if (!loopInput || !runBtn || !addMacroBtn || !addAutomationBtn || !addKeyBtn || !clearBtn || !nodesLayer || !svg || !linksList) return;

    loopInput.value = String(config.loopCount);
    loopInput.disabled = !canManage;
    addMacroBtn.disabled = !canManage;
    addAutomationBtn.disabled = !canManage;
    addKeyBtn.disabled = !canManage;
    clearBtn.disabled = !canManage;
    runBtn.disabled = Boolean(workflowCanvasRunState.get(plugin.id)?.running);

    nodesLayer.innerHTML = '';
    renderWorkflowCanvasConnectionsSvg(svg, config.nodes, config.connections);

    const makeNodeCard = (node) => {
        const card = document.createElement('div');
        card.className = 'workflow-node-card';
        card.style.left = `${node.x}px`;
        card.style.top = `${node.y}px`;
        card.setAttribute('data-node-id', node.id);

        const head = document.createElement('div');
        head.className = 'workflow-node-head';
        const title = document.createElement('span');
        title.className = 'workflow-node-title';
        title.textContent = node.title || `${node.type.toUpperCase()} NODE`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        head.appendChild(title);
        head.appendChild(deleteBtn);
        card.appendChild(head);

        const body = document.createElement('div');
        body.className = 'workflow-node-body';

        const typeSelect = document.createElement('select');
        typeSelect.className = 'combo-box';
        [['macro', 'MACRO'], ['automation', 'AUTOMATION'], ['keybind', 'KEY ACTION']].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            typeSelect.appendChild(option);
        });
        typeSelect.value = node.type;
        typeSelect.disabled = !canManage;
        body.appendChild(typeSelect);

        const targetSelect = document.createElement('select');
        targetSelect.className = 'combo-box';
        const bindTargetOptions = () => {
            targetSelect.innerHTML = '';
            const options = getWorkflowNodeTargetOptions(node.type);
            if (!options.length) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'NONE AVAILABLE';
                targetSelect.appendChild(option);
            } else {
                options.forEach(optionData => {
                    const option = document.createElement('option');
                    option.value = optionData.value;
                    option.textContent = optionData.label.toUpperCase();
                    targetSelect.appendChild(option);
                });
            }
            if (Array.from(targetSelect.options).some(item => item.value === node.targetId)) {
                targetSelect.value = node.targetId;
            } else if (targetSelect.options.length) {
                targetSelect.value = targetSelect.options[0].value;
                node.targetId = targetSelect.value;
            }
        };
        bindTargetOptions();
        targetSelect.disabled = !canManage;
        body.appendChild(targetSelect);

        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.min = '0';
        delayInput.max = '5000';
        delayInput.className = 'spinbox';
        delayInput.value = String(node.delayMs || 0);
        delayInput.disabled = !canManage;
        body.appendChild(delayInput);

        const ports = document.createElement('div');
        ports.className = 'workflow-node-ports';
        const inputBtn = document.createElement('button');
        inputBtn.className = 'workflow-port-btn';
        inputBtn.textContent = 'INPUT';
        const outputBtn = document.createElement('button');
        outputBtn.className = 'workflow-port-btn';
        outputBtn.textContent = 'OUTPUT';
        if (state.pendingOutputNodeId === node.id) {
            outputBtn.classList.add('active');
        }
        inputBtn.disabled = !canManage;
        outputBtn.disabled = !canManage;
        deleteBtn.disabled = !canManage;
        ports.appendChild(inputBtn);
        ports.appendChild(outputBtn);
        body.appendChild(ports);
        card.appendChild(body);

        typeSelect.addEventListener('change', () => {
            node.type = typeSelect.value;
            bindTargetOptions();
            commitWorkflowCanvasConfig(plugin, config, false);
            renderWorkflowCanvasSettingsPage(plugin);
        });
        targetSelect.addEventListener('change', () => {
            node.targetId = targetSelect.value;
            commitWorkflowCanvasConfig(plugin, config, false);
        });
        delayInput.addEventListener('change', () => {
            node.delayMs = Math.max(0, Math.min(5000, Math.round(parseNumberWithFallback(delayInput.value, node.delayMs))));
            delayInput.value = String(node.delayMs);
            commitWorkflowCanvasConfig(plugin, config, false);
        });
        deleteBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            config.nodes = config.nodes.filter(item => item.id !== node.id);
            config.connections = config.connections.filter(link => link.from !== node.id && link.to !== node.id);
            if (state.pendingOutputNodeId === node.id) state.pendingOutputNodeId = '';
            commitWorkflowCanvasConfig(plugin, config, true);
            recordRecentChange('Workflow node deleted', () => restorePluginsSnapshot(snapshot));
        });
        outputBtn.addEventListener('click', () => {
            state.pendingOutputNodeId = state.pendingOutputNodeId === node.id ? '' : node.id;
            renderWorkflowCanvasSettingsPage(plugin);
        });
        inputBtn.addEventListener('click', () => {
            const from = state.pendingOutputNodeId;
            if (!from || from === node.id) return;
            const exists = config.connections.some(link => link.from === from && link.to === node.id);
            if (!exists) {
                config.connections.push({ from, to: node.id });
                commitWorkflowCanvasConfig(plugin, config, true);
            } else {
                state.pendingOutputNodeId = '';
                renderWorkflowCanvasSettingsPage(plugin);
            }
        });

        let dragStart = null;
        const handleDragMove = (event) => {
            if (!dragStart) return;
            node.x = Math.max(4, dragStart.baseX + (event.clientX - dragStart.startX));
            node.y = Math.max(4, dragStart.baseY + (event.clientY - dragStart.startY));
            card.style.left = `${node.x}px`;
            card.style.top = `${node.y}px`;
            renderWorkflowCanvasConnectionsSvg(svg, config.nodes, config.connections);
        };
        const handleDragEnd = () => {
            if (!dragStart) return;
            dragStart = null;
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            commitWorkflowCanvasConfig(plugin, config, false);
        };
        head.addEventListener('mousedown', (event) => {
            if (!canManage) return;
            if (event.target.closest('button')) return;
            dragStart = {
                startX: event.clientX,
                startY: event.clientY,
                baseX: node.x,
                baseY: node.y
            };
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        });

        return card;
    };

    config.nodes.forEach(node => nodesLayer.appendChild(makeNodeCard(node)));
    renderWorkflowCanvasConnectionsSvg(svg, config.nodes, config.connections);

    linksList.innerHTML = '';
    if (!config.connections.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-note';
        empty.textContent = 'No connections yet.';
        linksList.appendChild(empty);
    } else {
        config.connections.forEach((link, index) => {
            const row = document.createElement('div');
            row.className = 'setting-card keybind-action-card';
            const label = document.createElement('div');
            label.className = 'keybind-action-name';
            const fromNode = config.nodes.find(node => node.id === link.from);
            const toNode = config.nodes.find(node => node.id === link.to);
            label.textContent = `${fromNode?.title || fromNode?.type || link.from} -> ${toNode?.title || toNode?.type || link.to}`;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'keybind-control-btn';
            removeBtn.textContent = 'REMOVE';
            removeBtn.addEventListener('click', () => {
                config.connections = config.connections.filter((_, i) => i !== index);
                commitWorkflowCanvasConfig(plugin, config, true);
            });
            row.appendChild(label);
            row.appendChild(removeBtn);
            linksList.appendChild(row);
        });
    }

    const createNode = (type) => {
        if (!canManage) {
            showNotification('Plugin editing is blocked for this profile role.');
            return;
        }
        const snapshot = getPluginsSnapshot();
        const node = normalizeWorkflowCanvasNode({
            type,
            title: `${type.toUpperCase()} NODE`,
            x: 40 + (config.nodes.length % 4) * 270,
            y: 30 + Math.floor(config.nodes.length / 4) * 170
        }, config.nodes.length);
        const defaults = getWorkflowNodeTargetOptions(type);
        if (defaults.length) node.targetId = defaults[0].value;
        config.nodes.push(node);
        commitWorkflowCanvasConfig(plugin, config, true);
        recordRecentChange('Workflow node added', () => restorePluginsSnapshot(snapshot));
    };

    addMacroBtn.onclick = () => createNode('macro');
    addAutomationBtn.onclick = () => createNode('automation');
    addKeyBtn.onclick = () => createNode('keybind');
    clearBtn.onclick = () => {
        if (!canManage) {
            showNotification('Plugin editing is blocked for this profile role.');
            return;
        }
        const snapshot = getPluginsSnapshot();
        config.nodes = [];
        config.connections = [];
        state.pendingOutputNodeId = '';
        commitWorkflowCanvasConfig(plugin, config, true);
        recordRecentChange('Workflow canvas cleared', () => restorePluginsSnapshot(snapshot));
    };
    runBtn.onclick = () => runWorkflowCanvasPlugin(plugin.id);
    loopInput.onchange = () => {
        config.loopCount = Math.max(1, Math.min(10, Math.round(parseNumberWithFallback(loopInput.value, config.loopCount))));
        commitWorkflowCanvasConfig(plugin, config, false);
    };
}

function normalizeCustomPageWidget(widgetRaw, widgetIndex = 0) {
    const widget = widgetRaw && typeof widgetRaw === 'object' ? widgetRaw : {};
    const id = String(widget.id || `custom-widget-${Date.now()}-${widgetIndex}`).trim() || `custom-widget-${Date.now()}-${widgetIndex}`;
    const typeRaw = String(widget.type || 'text').trim().toLowerCase();
    const type = ['text', 'select', 'slider', 'switch', 'button'].includes(typeRaw) ? typeRaw : 'text';
    const options = Array.isArray(widget.options)
        ? widget.options.map(option => String(option || '').trim()).filter(Boolean)
        : String(widget.optionsCsv || widget.optionsRaw || 'Option A|Option B')
            .split('|')
            .map(option => option.trim())
            .filter(Boolean);
    return {
        id,
        type,
        label: String(widget.label || 'Widget').trim() || 'Widget',
        value: widget.value,
        placeholder: String(widget.placeholder || '').trim(),
        options: options.length ? options : ['Option A', 'Option B'],
        min: Math.round(parseNumberWithFallback(widget.min, 0)),
        max: Math.round(parseNumberWithFallback(widget.max, 100)),
        step: Math.max(1, Math.round(parseNumberWithFallback(widget.step, 1))),
        buttonText: String(widget.buttonText || widget.label || 'RUN').trim() || 'RUN',
        actionType: String(widget.actionType || 'show-notification').trim(),
        actionTarget: String(widget.actionTarget || '').trim()
    };
}

function normalizeCustomPageCard(cardRaw, cardIndex = 0) {
    const card = cardRaw && typeof cardRaw === 'object' ? cardRaw : {};
    const widgets = Array.isArray(card.widgets)
        ? card.widgets.map((widget, widgetIndex) => normalizeCustomPageWidget(widget, widgetIndex))
        : [];
    return {
        id: String(card.id || `custom-card-${Date.now()}-${cardIndex}`).trim() || `custom-card-${Date.now()}-${cardIndex}`,
        title: String(card.title || `Card ${cardIndex + 1}`).trim() || `Card ${cardIndex + 1}`,
        widgets
    };
}

function normalizeCustomStudioPage(pageRaw, pageIndex = 0) {
    const page = pageRaw && typeof pageRaw === 'object' ? pageRaw : {};
    const cards = Array.isArray(page.cards)
        ? page.cards.map((card, cardIndex) => normalizeCustomPageCard(card, cardIndex))
        : [];
    const icon = String(page.icon || 'CP').trim().toUpperCase().slice(0, 2) || 'CP';
    return {
        id: String(page.id || `custom-page-${Date.now()}-${pageIndex}`).trim() || `custom-page-${Date.now()}-${pageIndex}`,
        title: String(page.title || `Custom ${pageIndex + 1}`).trim() || `Custom ${pageIndex + 1}`,
        icon,
        cards
    };
}

function normalizeCustomPageStudioConfig(configRaw) {
    const config = configRaw && typeof configRaw === 'object' ? configRaw : {};
    const normalizeLegacyCustomPageText = (value) => String(value || '')
        .replace(/Kust Page Studio/gi, 'Custom Page Studio')
        .replace(/Kust Page/gi, 'Custom Page');
    const normalizedPageTitle = normalizeLegacyCustomPageText(config.pageTitle || '').trim() || 'Custom Page Studio';
    const pages = Array.isArray(config.pages)
        ? config.pages.map((page, pageIndex) => normalizeCustomStudioPage(page, pageIndex))
        : [];
    if (!pages.length && Array.isArray(config.cards) && config.cards.length) {
        pages.push(normalizeCustomStudioPage({
            id: 'custom-page-main',
            title: normalizedPageTitle.replace(/Studio/gi, '').trim() || 'Custom Page',
            icon: 'CP',
            cards: config.cards
        }, 0));
    }
    if (!pages.length) {
        pages.push(normalizeCustomStudioPage({ title: 'Custom Page', icon: 'CP', cards: [] }, 0));
    }
    const selectedPageId = String(config.selectedPageId || pages[0].id).trim() || pages[0].id;
    return {
        pageTitle: normalizedPageTitle,
        pages,
        selectedPageId
    };
}

function executeCustomPageButtonWidget(widget) {
    const actionType = String(widget.actionType || 'show-notification').trim().toLowerCase();
    const target = String(widget.actionTarget || '').trim();
    if (actionType === 'toggle-feature') {
        if (!target) return;
        toggleFeatureByKeybind(target.toLowerCase());
        return;
    }
    if (actionType === 'open-page') {
        let page = target.toLowerCase();
        if (!PAGE_OPTIONS.includes(page) && !dynamicPluginPageTitles.has(page)) {
            const byTitle = Array.from(dynamicPluginPageTitles.entries())
                .find(([, title]) => String(title || '').trim().toLowerCase() === page);
            if (byTitle) page = byTitle[0];
        }
        if (!PAGE_OPTIONS.includes(page) && !dynamicPluginPageTitles.has(page)) return;
        selectPage(page);
        updatePageTitle(page);
        return;
    }
    if (actionType === 'run-macro') {
        if (!target) return;
        runMacroById(target);
        return;
    }
    if (actionType === 'save-settings') {
        saveSettings();
        return;
    }
    showNotification(target || `${widget.label || 'Button'} clicked.`);
}

function renderCustomPageStudioPluginPage(plugin) {
    if (!plugin || plugin.behavior !== PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO || !plugin.enabled) return;
    const config = normalizeCustomPageStudioConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };

    const mount = ensureRuntimePluginPage(plugin, {
        title: config.pageTitle,
        navLabel: config.pageTitle,
        iconText: 'CP'
    });
    if (!mount) return;
    const { page } = mount;

    const editMode = customPageStudioEditState.get(plugin.id) === true;
    const canManage = isRoleAllowed('plugins');
    page.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'plugin-page-wrap custom-page-studio-page';

    const controlsCard = document.createElement('div');
    controlsCard.className = 'setting-card';
    controlsCard.innerHTML = `
        <label>Custom Page Studio</label>
        <p class="setting-note">Create your own cards and widgets. Widget buttons can run existing Nexus actions.</p>
        <div class="setting-inline-controls">
            <button class="btn-secondary" id="customPageEditModeBtn-${plugin.id}" type="button">${editMode ? 'EDIT MODE ON' : 'EDIT MODE OFF'}</button>
            <button class="btn-secondary" id="customPageAddCardBtn-${plugin.id}" type="button">ADD CARD</button>
        </div>
    `;
    const titleInput = document.createElement('input');
    titleInput.className = 'modal-input';
    titleInput.placeholder = 'Sidebar page title...';
    titleInput.value = config.pageTitle;
    titleInput.style.maxWidth = '280px';
    controlsCard.appendChild(titleInput);
    wrap.appendChild(controlsCard);

    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'custom-page-cards-grid';
    if (!config.cards.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'No cards yet. Press ADD CARD.';
        cardsGrid.appendChild(empty);
    }

    config.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'setting-card custom-page-card';
        const cardHeader = document.createElement('div');
        cardHeader.className = 'workflow-step-header';
        const titleLabel = document.createElement('strong');
        titleLabel.textContent = card.title;
        cardHeader.appendChild(titleLabel);
        if (editMode) {
            const deleteCardBtn = document.createElement('button');
            deleteCardBtn.className = 'keybind-control-btn';
            deleteCardBtn.textContent = 'DELETE CARD';
            deleteCardBtn.setAttribute('data-safety-lock', 'required');
            deleteCardBtn.disabled = !canManage;
            deleteCardBtn.addEventListener('click', () => {
                if (!canManage) {
                    showNotification('Plugin editing is blocked for this profile role.');
                    return;
                }
                const snapshot = getPluginsSnapshot();
                config.cards = config.cards.filter(item => item.id !== card.id);
                plugin.config = normalizeCustomPageStudioConfig(config);
                savePluginsToStorage();
                renderCustomPageStudioPluginPage(plugin);
                recordRecentChange('Custom card deleted', () => restorePluginsSnapshot(snapshot));
            });
            cardHeader.appendChild(deleteCardBtn);
        }
        cardEl.appendChild(cardHeader);

        if (editMode) {
            const cardTitleInput = document.createElement('input');
            cardTitleInput.className = 'modal-input';
            cardTitleInput.value = card.title;
            cardTitleInput.placeholder = 'Card title...';
            cardTitleInput.disabled = !canManage;
            cardTitleInput.addEventListener('change', () => {
                card.title = String(cardTitleInput.value || '').trim() || card.title;
                plugin.config = normalizeCustomPageStudioConfig(config);
                savePluginsToStorage();
                renderCustomPageStudioPluginPage(plugin);
            });
            cardEl.appendChild(cardTitleInput);
        }

        const widgetsWrap = document.createElement('div');
        widgetsWrap.className = 'custom-page-widgets';
        card.widgets.forEach(widget => {
            const widgetEl = document.createElement('div');
            widgetEl.className = 'custom-page-widget';
            const label = document.createElement('label');
            label.textContent = widget.label;
            widgetEl.appendChild(label);

            if (widget.type === 'text') {
                const input = document.createElement('input');
                input.className = 'modal-input';
                input.placeholder = widget.placeholder || 'Type...';
                input.value = String(widget.value || '');
                input.addEventListener('change', () => {
                    widget.value = input.value;
                    savePluginsToStorage();
                });
                widgetEl.appendChild(input);
            } else if (widget.type === 'select') {
                const select = document.createElement('select');
                select.className = 'combo-box';
                widget.options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue.toUpperCase();
                    select.appendChild(option);
                });
                select.value = String(widget.value || widget.options[0] || '');
                select.addEventListener('change', () => {
                    widget.value = select.value;
                    savePluginsToStorage();
                });
                widgetEl.appendChild(select);
            } else if (widget.type === 'slider') {
                const group = document.createElement('div');
                group.className = 'input-group';
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.className = 'slider';
                slider.min = String(widget.min);
                slider.max = String(Math.max(widget.min + widget.step, widget.max));
                slider.step = String(widget.step);
                slider.value = String(parseNumberWithFallback(widget.value, widget.min));
                const number = document.createElement('input');
                number.type = 'number';
                number.className = 'spinbox';
                number.min = slider.min;
                number.max = slider.max;
                number.step = slider.step;
                number.value = slider.value;
                slider.addEventListener('input', () => { number.value = slider.value; });
                slider.addEventListener('change', () => {
                    widget.value = parseNumberWithFallback(slider.value, widget.min);
                    savePluginsToStorage();
                });
                number.addEventListener('input', () => { slider.value = number.value; });
                number.addEventListener('change', () => {
                    widget.value = parseNumberWithFallback(number.value, widget.min);
                    savePluginsToStorage();
                });
                group.appendChild(slider);
                group.appendChild(number);
                widgetEl.appendChild(group);
            } else if (widget.type === 'switch') {
                const switchWrap = document.createElement('label');
                switchWrap.className = 'toggle-switch';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'toggle-input';
                input.checked = widget.value === true || widget.value === 'true';
                const slider = document.createElement('span');
                slider.className = 'toggle-slider';
                switchWrap.appendChild(input);
                switchWrap.appendChild(slider);
                input.addEventListener('change', () => {
                    widget.value = input.checked;
                    savePluginsToStorage();
                });
                widgetEl.appendChild(switchWrap);
            } else if (widget.type === 'button') {
                const button = document.createElement('button');
                button.className = 'btn-secondary';
                button.type = 'button';
                button.textContent = widget.buttonText || 'RUN';
                button.addEventListener('click', () => executeCustomPageButtonWidget(widget));
                widgetEl.appendChild(button);
            }

            if (editMode) {
                const editRow = document.createElement('div');
                editRow.className = 'setting-inline-controls';

                const labelInput = document.createElement('input');
                labelInput.className = 'modal-input';
                labelInput.value = widget.label;
                labelInput.placeholder = 'Widget label...';
                labelInput.style.maxWidth = '180px';
                labelInput.disabled = !canManage;
                labelInput.addEventListener('change', () => {
                    widget.label = String(labelInput.value || '').trim() || widget.label;
                    savePluginsToStorage();
                    renderCustomPageStudioPluginPage(plugin);
                });
                editRow.appendChild(labelInput);

                if (widget.type === 'select') {
                    const optionsInput = document.createElement('input');
                    optionsInput.className = 'modal-input';
                    optionsInput.style.maxWidth = '220px';
                    optionsInput.placeholder = 'Options: A|B|C';
                    optionsInput.value = widget.options.join('|');
                    optionsInput.disabled = !canManage;
                    optionsInput.addEventListener('change', () => {
                        const next = String(optionsInput.value || '')
                            .split('|')
                            .map(item => item.trim())
                            .filter(Boolean);
                        widget.options = next.length ? next : ['Option A', 'Option B'];
                        if (!widget.options.includes(String(widget.value || ''))) {
                            widget.value = widget.options[0];
                        }
                        savePluginsToStorage();
                        renderCustomPageStudioPluginPage(plugin);
                    });
                    editRow.appendChild(optionsInput);
                }

                if (widget.type === 'slider') {
                    ['min', 'max', 'step'].forEach(key => {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.className = 'spinbox';
                        input.style.maxWidth = '84px';
                        input.value = String(widget[key]);
                        input.disabled = !canManage;
                        input.addEventListener('change', () => {
                            widget[key] = Math.round(parseNumberWithFallback(input.value, widget[key]));
                            if (widget.step < 1) widget.step = 1;
                            if (widget.max <= widget.min) widget.max = widget.min + widget.step;
                            savePluginsToStorage();
                            renderCustomPageStudioPluginPage(plugin);
                        });
                        editRow.appendChild(input);
                    });
                }

                if (widget.type === 'button') {
                    const textInput = document.createElement('input');
                    textInput.className = 'modal-input';
                    textInput.style.maxWidth = '140px';
                    textInput.placeholder = 'Button text...';
                    textInput.value = widget.buttonText;
                    textInput.disabled = !canManage;
                    textInput.addEventListener('change', () => {
                        widget.buttonText = String(textInput.value || '').trim() || widget.buttonText;
                        savePluginsToStorage();
                        renderCustomPageStudioPluginPage(plugin);
                    });
                    editRow.appendChild(textInput);

                    const actionSelect = document.createElement('select');
                    actionSelect.className = 'combo-box';
                    [
                        ['show-notification', 'Toast'],
                        ['toggle-feature', 'Toggle Feature'],
                        ['open-page', 'Open Page'],
                        ['run-macro', 'Run Macro'],
                        ['save-settings', 'Save Settings']
                    ].forEach(([value, labelText]) => {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = labelText.toUpperCase();
                        actionSelect.appendChild(option);
                    });
                    actionSelect.value = widget.actionType;
                    actionSelect.disabled = !canManage;
                    actionSelect.addEventListener('change', () => {
                        widget.actionType = actionSelect.value;
                        savePluginsToStorage();
                    });
                    editRow.appendChild(actionSelect);

                    const targetInput = document.createElement('input');
                    targetInput.className = 'modal-input';
                    targetInput.style.maxWidth = '180px';
                    targetInput.placeholder = 'Action target...';
                    targetInput.value = widget.actionTarget;
                    targetInput.disabled = !canManage;
                    targetInput.addEventListener('change', () => {
                        widget.actionTarget = String(targetInput.value || '').trim();
                        savePluginsToStorage();
                    });
                    editRow.appendChild(targetInput);
                }

                const removeWidgetBtn = document.createElement('button');
                removeWidgetBtn.className = 'keybind-control-btn';
                removeWidgetBtn.textContent = 'REMOVE';
                removeWidgetBtn.setAttribute('data-safety-lock', 'required');
                removeWidgetBtn.disabled = !canManage;
                removeWidgetBtn.addEventListener('click', () => {
                    if (!canManage) {
                        showNotification('Plugin editing is blocked for this profile role.');
                        return;
                    }
                    const snapshot = getPluginsSnapshot();
                    card.widgets = card.widgets.filter(item => item.id !== widget.id);
                    plugin.config = normalizeCustomPageStudioConfig(config);
                    savePluginsToStorage();
                    renderCustomPageStudioPluginPage(plugin);
                    recordRecentChange('Custom widget removed', () => restorePluginsSnapshot(snapshot));
                });
                editRow.appendChild(removeWidgetBtn);
                widgetEl.appendChild(editRow);
            }
            widgetsWrap.appendChild(widgetEl);
        });

        if (editMode) {
            const addWidgetRow = document.createElement('div');
            addWidgetRow.className = 'setting-inline-controls';
            const typeSelect = document.createElement('select');
            typeSelect.className = 'combo-box';
            [
                ['text', 'Text Box'],
                ['select', 'Choice Menu'],
                ['slider', 'Slider'],
                ['switch', 'Switch'],
                ['button', 'Button']
            ].forEach(([value, labelText]) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = labelText.toUpperCase();
                typeSelect.appendChild(option);
            });
            typeSelect.disabled = !canManage;
            const addWidgetBtn = document.createElement('button');
            addWidgetBtn.className = 'btn-secondary';
            addWidgetBtn.type = 'button';
            addWidgetBtn.textContent = 'ADD WIDGET';
            addWidgetBtn.disabled = !canManage;
            addWidgetBtn.addEventListener('click', () => {
                if (!canManage) {
                    showNotification('Plugin editing is blocked for this profile role.');
                    return;
                }
                const snapshot = getPluginsSnapshot();
                const widgetType = typeSelect.value;
                card.widgets.push(normalizeCustomPageWidget({
                    type: widgetType,
                    label: `New ${widgetType}`
                }, card.widgets.length));
                plugin.config = normalizeCustomPageStudioConfig(config);
                savePluginsToStorage();
                renderCustomPageStudioPluginPage(plugin);
                recordRecentChange('Custom widget added', () => restorePluginsSnapshot(snapshot));
            });
            addWidgetRow.appendChild(typeSelect);
            addWidgetRow.appendChild(addWidgetBtn);
            widgetsWrap.appendChild(addWidgetRow);
        }

        cardEl.appendChild(widgetsWrap);
        cardsGrid.appendChild(cardEl);
    });
    wrap.appendChild(cardsGrid);
    page.appendChild(wrap);
    applyMicroCardAnimations(page);

    const editModeBtn = document.getElementById(`customPageEditModeBtn-${plugin.id}`);
    const addCardBtn = document.getElementById(`customPageAddCardBtn-${plugin.id}`);
    if (editModeBtn) {
        editModeBtn.disabled = !canManage;
        editModeBtn.addEventListener('click', () => {
            if (!canManage) {
                showNotification('Plugin editing is blocked for this profile role.');
                return;
            }
            customPageStudioEditState.set(plugin.id, !editMode);
            renderCustomPageStudioPluginPage(plugin);
        });
    }
    if (addCardBtn) {
        addCardBtn.disabled = !canManage;
        addCardBtn.addEventListener('click', () => {
            if (!canManage) {
                showNotification('Plugin editing is blocked for this profile role.');
                return;
            }
            const snapshot = getPluginsSnapshot();
            config.cards.push(normalizeCustomPageCard({}, config.cards.length));
            plugin.config = normalizeCustomPageStudioConfig(config);
            savePluginsToStorage();
            renderCustomPageStudioPluginPage(plugin);
            recordRecentChange('Custom card added', () => restorePluginsSnapshot(snapshot));
        });
    }
    titleInput.addEventListener('change', () => {
        if (!canManage) return;
        config.pageTitle = String(titleInput.value || '').trim() || 'Custom Page';
        plugin.config = normalizeCustomPageStudioConfig(config);
        savePluginsToStorage();
        renderCustomPageStudioPluginPage(plugin);
    });
    titleInput.disabled = !canManage;
}

function getCustomStudioRuntimePluginId(pluginId, pageId) {
    return `${pluginId}--page--${pageId}`;
}

function renderCustomPageRuntimeContent(plugin, pageData) {
    const runtimePlugin = {
        id: getCustomStudioRuntimePluginId(plugin.id, pageData.id),
        ownerPluginId: plugin.id,
        name: pageData.title
    };
    const mount = ensureRuntimePluginPage(runtimePlugin, {
        title: pageData.title,
        navLabel: pageData.title,
        iconText: pageData.icon || 'CP'
    });
    if (!mount) return null;
    const page = mount.page;
    page.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'plugin-page-wrap custom-page-studio-runtime';
    const grid = document.createElement('div');
    grid.className = 'custom-page-cards-grid';
    if (!pageData.cards.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'This custom page has no cards yet.';
        grid.appendChild(empty);
    }
    pageData.cards.forEach(cardData => {
        const card = document.createElement('div');
        card.className = 'setting-card custom-page-card';
        const title = document.createElement('strong');
        title.textContent = cardData.title;
        card.appendChild(title);

        const widgetsWrap = document.createElement('div');
        widgetsWrap.className = 'custom-page-widgets';
        cardData.widgets.forEach(widget => {
            const widgetEl = document.createElement('div');
            widgetEl.className = 'custom-page-widget';
            const label = document.createElement('label');
            label.textContent = widget.label;
            widgetEl.appendChild(label);

            if (widget.type === 'text') {
                const input = document.createElement('input');
                input.className = 'modal-input';
                input.placeholder = widget.placeholder || 'Type...';
                input.value = String(widget.value || '');
                input.addEventListener('change', () => {
                    widget.value = input.value;
                    savePluginsToStorage();
                });
                widgetEl.appendChild(input);
            } else if (widget.type === 'select') {
                const select = document.createElement('select');
                select.className = 'combo-box';
                widget.options.forEach(optionText => {
                    const option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText.toUpperCase();
                    select.appendChild(option);
                });
                select.value = String(widget.value || widget.options[0] || '');
                select.addEventListener('change', () => {
                    widget.value = select.value;
                    savePluginsToStorage();
                });
                widgetEl.appendChild(select);
            } else if (widget.type === 'slider') {
                const row = document.createElement('div');
                row.className = 'input-group';
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.className = 'slider';
                slider.min = String(widget.min);
                slider.max = String(Math.max(widget.min + widget.step, widget.max));
                slider.step = String(widget.step);
                slider.value = String(parseNumberWithFallback(widget.value, widget.min));
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'spinbox';
                input.value = slider.value;
                input.min = slider.min;
                input.max = slider.max;
                input.step = slider.step;
                slider.addEventListener('input', () => { input.value = slider.value; });
                slider.addEventListener('change', () => {
                    widget.value = parseNumberWithFallback(slider.value, widget.min);
                    savePluginsToStorage();
                });
                input.addEventListener('input', () => { slider.value = input.value; });
                input.addEventListener('change', () => {
                    widget.value = parseNumberWithFallback(input.value, widget.min);
                    savePluginsToStorage();
                });
                row.appendChild(slider);
                row.appendChild(input);
                widgetEl.appendChild(row);
            } else if (widget.type === 'switch') {
                const sw = document.createElement('label');
                sw.className = 'toggle-switch';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'toggle-input';
                input.checked = widget.value === true || widget.value === 'true';
                const slider = document.createElement('span');
                slider.className = 'toggle-slider';
                input.addEventListener('change', () => {
                    widget.value = input.checked;
                    savePluginsToStorage();
                });
                sw.appendChild(input);
                sw.appendChild(slider);
                widgetEl.appendChild(sw);
            } else if (widget.type === 'button') {
                const button = document.createElement('button');
                button.className = 'btn-secondary';
                button.type = 'button';
                button.textContent = widget.buttonText || 'RUN';
                button.addEventListener('click', () => executeCustomPageButtonWidget(widget));
                widgetEl.appendChild(button);
            }
            widgetsWrap.appendChild(widgetEl);
        });
        card.appendChild(widgetsWrap);
        grid.appendChild(card);
    });
    wrap.appendChild(grid);
    page.appendChild(wrap);
    applyMicroCardAnimations(page);
    return mount.pageKey;
}

function renderCustomPageRuntimePages(plugin) {
    const config = normalizeCustomPageStudioConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };

    const expectedIds = new Set();
    config.pages.forEach(pageData => {
        const runtimeId = getCustomStudioRuntimePluginId(plugin.id, pageData.id);
        expectedIds.add(runtimeId);
        renderCustomPageRuntimeContent(plugin, pageData);
    });

    document.querySelectorAll(`.nav-btn[data-plugin-owner="${plugin.id}"]`).forEach(button => {
        const runtimeId = String(button.getAttribute('data-plugin-page') || '').trim();
        if (expectedIds.has(runtimeId)) return;
        removeRuntimePluginPage(runtimeId);
    });
}

function getSelectedCustomStudioPage(config) {
    const selectedId = String(config.selectedPageId || '').trim();
    let pageData = config.pages.find(page => page.id === selectedId);
    if (!pageData) pageData = config.pages[0] || null;
    return pageData;
}

function renderCustomPageStudioSettingsPage(plugin) {
    if (!plugin || !plugin.enabled || plugin.behavior !== PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO) return;
    const canManage = isRoleAllowed('plugins');
    const config = normalizeCustomPageStudioConfig(plugin.config);
    plugin.config = {
        ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
        ...config
    };
    customPageStudioSelectedPage.set(plugin.id, config.selectedPageId);

    const pagesList = document.getElementById('customPagesList');
    const cardsList = document.getElementById('customPagesCardsList');
    const pageNameInput = document.getElementById('customPagesNameInput');
    const createBtn = document.getElementById('customPagesCreateBtn');
    const addCardBtn = document.getElementById('customPagesAddCardBtn');
    const openRuntimeBtn = document.getElementById('customPagesOpenRuntimeBtn');
    const title = document.getElementById('customPagesEditorTitle');
    if (!pagesList || !cardsList || !pageNameInput || !createBtn || !addCardBtn || !openRuntimeBtn || !title) return;

    const selectedPage = getSelectedCustomStudioPage(config);
    if (selectedPage) {
        config.selectedPageId = selectedPage.id;
    }

    pagesList.innerHTML = '';
    config.pages.forEach(pageData => {
        const row = document.createElement('div');
        row.className = 'setting-card keybind-action-card';
        const name = document.createElement('div');
        name.className = 'keybind-action-name';
        name.textContent = pageData.title;
        const controls = document.createElement('div');
        controls.className = 'keybind-action-controls';
        const openBtn = document.createElement('button');
        openBtn.className = 'keybind-control-btn';
        openBtn.textContent = config.selectedPageId === pageData.id ? 'SELECTED' : 'SELECT';
        openBtn.disabled = !canManage;
        openBtn.addEventListener('click', () => {
            if (!canManage) return;
            config.selectedPageId = pageData.id;
            commitCustomPageStudioConfig(plugin, config, true);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        deleteBtn.disabled = !canManage || config.pages.length <= 1;
        deleteBtn.addEventListener('click', () => {
            if (!canManage) return;
            if (config.pages.length <= 1) return;
            const snapshot = getPluginsSnapshot();
            config.pages = config.pages.filter(item => item.id !== pageData.id);
            if (config.selectedPageId === pageData.id) {
                config.selectedPageId = config.pages[0]?.id || '';
            }
            commitCustomPageStudioConfig(plugin, config, true);
            recordRecentChange('Custom page deleted', () => restorePluginsSnapshot(snapshot));
        });
        controls.appendChild(openBtn);
        controls.appendChild(deleteBtn);
        row.appendChild(name);
        row.appendChild(controls);
        pagesList.appendChild(row);
    });

    const selected = getSelectedCustomStudioPage(config);
    title.textContent = selected ? `EDITOR | ${selected.title.toUpperCase()}` : 'CUSTOM PAGE EDITOR';
    cardsList.innerHTML = '';

    if (!selected) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'No page selected.';
        cardsList.appendChild(empty);
    } else {
        selected.cards.forEach(cardData => {
            const card = document.createElement('div');
            card.className = 'setting-card custom-page-card';
            const header = document.createElement('div');
            header.className = 'workflow-step-header';
            const titleInput = document.createElement('input');
            titleInput.className = 'modal-input';
            titleInput.value = cardData.title;
            titleInput.placeholder = 'Card title...';
            titleInput.disabled = !canManage;
            titleInput.addEventListener('change', () => {
                if (!canManage) return;
                cardData.title = String(titleInput.value || '').trim() || cardData.title;
                commitCustomPageStudioConfig(plugin, config, false);
                renderCustomPageRuntimePages(plugin);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'keybind-control-btn';
            deleteBtn.textContent = 'DELETE CARD';
            deleteBtn.setAttribute('data-safety-lock', 'required');
            deleteBtn.disabled = !canManage;
            deleteBtn.addEventListener('click', () => {
                if (!canManage) return;
                const snapshot = getPluginsSnapshot();
                selected.cards = selected.cards.filter(item => item.id !== cardData.id);
                commitCustomPageStudioConfig(plugin, config, true);
                recordRecentChange('Custom card deleted', () => restorePluginsSnapshot(snapshot));
            });
            header.appendChild(titleInput);
            header.appendChild(deleteBtn);
            card.appendChild(header);

            const widgetsWrap = document.createElement('div');
            widgetsWrap.className = 'custom-page-widgets';
            cardData.widgets.forEach(widget => {
                const widgetRow = document.createElement('div');
                widgetRow.className = 'custom-page-widget';
                const labelInput = document.createElement('input');
                labelInput.className = 'modal-input';
                labelInput.value = widget.label;
                labelInput.placeholder = 'Widget label...';
                labelInput.disabled = !canManage;
                labelInput.addEventListener('change', () => {
                    if (!canManage) return;
                    widget.label = String(labelInput.value || '').trim() || widget.label;
                    commitCustomPageStudioConfig(plugin, config, false);
                    renderCustomPageRuntimePages(plugin);
                });
                widgetRow.appendChild(labelInput);

                const typeSelect = document.createElement('select');
                typeSelect.className = 'combo-box';
                [['text', 'TEXT'], ['select', 'CHOICE'], ['slider', 'SLIDER'], ['switch', 'SWITCH'], ['button', 'BUTTON']]
                    .forEach(([value, labelText]) => {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = labelText;
                        typeSelect.appendChild(option);
                    });
                typeSelect.value = widget.type;
                typeSelect.disabled = !canManage;
                typeSelect.addEventListener('change', () => {
                    if (!canManage) return;
                    widget.type = typeSelect.value;
                    commitCustomPageStudioConfig(plugin, config, true);
                });
                widgetRow.appendChild(typeSelect);

                if (widget.type === 'select') {
                    const optionsInput = document.createElement('input');
                    optionsInput.className = 'modal-input';
                    optionsInput.placeholder = 'A|B|C';
                    optionsInput.value = widget.options.join('|');
                    optionsInput.disabled = !canManage;
                    optionsInput.addEventListener('change', () => {
                        if (!canManage) return;
                        const next = String(optionsInput.value || '').split('|').map(item => item.trim()).filter(Boolean);
                        widget.options = next.length ? next : ['Option A', 'Option B'];
                        widget.value = widget.options[0];
                        commitCustomPageStudioConfig(plugin, config, false);
                        renderCustomPageRuntimePages(plugin);
                    });
                    widgetRow.appendChild(optionsInput);
                }

                if (widget.type === 'button') {
                    const actionSelect = document.createElement('select');
                    actionSelect.className = 'combo-box';
                    [
                        ['show-notification', 'TOAST'],
                        ['toggle-feature', 'TOGGLE FEATURE'],
                        ['open-page', 'OPEN PAGE'],
                        ['run-macro', 'RUN MACRO'],
                        ['save-settings', 'SAVE SETTINGS']
                    ].forEach(([value, labelText]) => {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = labelText;
                        actionSelect.appendChild(option);
                    });
                    actionSelect.value = widget.actionType;
                    actionSelect.disabled = !canManage;
                    actionSelect.addEventListener('change', () => {
                        if (!canManage) return;
                        widget.actionType = actionSelect.value;
                        commitCustomPageStudioConfig(plugin, config, false);
                    });
                    const targetInput = document.createElement('input');
                    targetInput.className = 'modal-input';
                    targetInput.placeholder = 'Action target...';
                    targetInput.value = widget.actionTarget || '';
                    targetInput.disabled = !canManage;
                    targetInput.addEventListener('change', () => {
                        if (!canManage) return;
                        widget.actionTarget = String(targetInput.value || '').trim();
                        commitCustomPageStudioConfig(plugin, config, false);
                    });
                    widgetRow.appendChild(actionSelect);
                    widgetRow.appendChild(targetInput);
                }

                const removeBtn = document.createElement('button');
                removeBtn.className = 'keybind-control-btn';
                removeBtn.textContent = 'REMOVE';
                removeBtn.disabled = !canManage;
                removeBtn.addEventListener('click', () => {
                    if (!canManage) return;
                    cardData.widgets = cardData.widgets.filter(item => item.id !== widget.id);
                    commitCustomPageStudioConfig(plugin, config, true);
                });
                widgetRow.appendChild(removeBtn);
                widgetsWrap.appendChild(widgetRow);
            });

            const addWidgetRow = document.createElement('div');
            addWidgetRow.className = 'setting-inline-controls';
            const addType = document.createElement('select');
            addType.className = 'combo-box';
            [['text', 'TEXT'], ['select', 'CHOICE'], ['slider', 'SLIDER'], ['switch', 'SWITCH'], ['button', 'BUTTON']]
                .forEach(([value, labelText]) => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = labelText;
                    addType.appendChild(option);
                });
            const addBtn = document.createElement('button');
            addBtn.className = 'btn-secondary';
            addBtn.textContent = 'ADD WIDGET';
            addType.disabled = !canManage;
            addBtn.disabled = !canManage;
            addBtn.addEventListener('click', () => {
                if (!canManage) return;
                cardData.widgets.push(normalizeCustomPageWidget({
                    type: addType.value,
                    label: `New ${addType.value}`
                }, cardData.widgets.length));
                commitCustomPageStudioConfig(plugin, config, true);
            });
            addWidgetRow.appendChild(addType);
            addWidgetRow.appendChild(addBtn);
            widgetsWrap.appendChild(addWidgetRow);

            card.appendChild(widgetsWrap);
            cardsList.appendChild(card);
        });
    }

    createBtn.onclick = () => {
        if (!canManage) {
            showNotification('Plugin editing is blocked for this profile role.');
            return;
        }
        const raw = String(pageNameInput.value || '').trim();
        const name = raw || `Custom Page ${config.pages.length + 1}`;
        const snapshot = getPluginsSnapshot();
        const pageData = normalizeCustomStudioPage({ title: name, cards: [] }, config.pages.length);
        config.pages.push(pageData);
        config.selectedPageId = pageData.id;
        pageNameInput.value = '';
        commitCustomPageStudioConfig(plugin, config, true);
        recordRecentChange('Custom page created', () => restorePluginsSnapshot(snapshot));
    };

    addCardBtn.onclick = () => {
        if (!canManage) {
            showNotification('Plugin editing is blocked for this profile role.');
            return;
        }
        const active = getSelectedCustomStudioPage(config);
        if (!active) return;
        const snapshot = getPluginsSnapshot();
        active.cards.push(normalizeCustomPageCard({}, active.cards.length));
        commitCustomPageStudioConfig(plugin, config, true);
        recordRecentChange('Custom card added', () => restorePluginsSnapshot(snapshot));
    };

    openRuntimeBtn.onclick = () => {
        const active = getSelectedCustomStudioPage(config);
        if (!active) return;
        const runtimeId = getCustomStudioRuntimePluginId(plugin.id, active.id);
        const pageKey = getPluginRuntimePageKey(runtimeId);
        selectPage(pageKey);
        updatePageTitle(pageKey);
    };
    pageNameInput.disabled = !canManage;
    createBtn.disabled = !canManage;
    addCardBtn.disabled = !canManage;
}

function commitCustomPageStudioConfig(plugin, configLike, rerender = true) {
    plugin.config = normalizeCustomPageStudioConfig(configLike);
    savePluginsToStorage();
    renderCustomPageRuntimePages(plugin);
    if (rerender) renderCustomPageStudioSettingsPage(plugin);
}

function setCustomPageStudioRuntime(activePlugins) {
    const runtimePlugins = Array.isArray(activePlugins) ? activePlugins : [];
    customPageStudioRuntimeEnabled = runtimePlugins.length > 0;
    if (!runtimePlugins.length) {
        closeCustomPagesConfigurator();
    }

    plugins.forEach(plugin => {
        if (plugin.behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO && !plugin.enabled) {
            removeRuntimePluginPage(plugin.id);
            customPageStudioEditState.delete(plugin.id);
            customPageStudioSelectedPage.delete(plugin.id);
            document.querySelectorAll(`.nav-btn[data-plugin-owner="${plugin.id}"]`).forEach(btn => {
                const runtimeId = String(btn.getAttribute('data-plugin-page') || '').trim();
                if (runtimeId) removeRuntimePluginPage(runtimeId);
            });
        }
    });

    runtimePlugins.forEach(plugin => {
        removeRuntimePluginPage(plugin.id);
        renderCustomPageRuntimePages(plugin);
        renderCustomPageStudioSettingsPage(plugin);
    });
}

function cleanupOrphanRuntimePluginPages() {
    const knownIds = new Set(plugins.map(plugin => String(plugin.id || '').trim()).filter(Boolean));
    document.querySelectorAll('.nav-btn[data-plugin-page]').forEach(button => {
        const pluginId = String(button.getAttribute('data-plugin-page') || '').trim();
        const ownerId = String(button.getAttribute('data-plugin-owner') || pluginId).trim();
        if (!pluginId || knownIds.has(ownerId)) return;
        removeRuntimePluginPage(pluginId);
    });
}

function updatePluginTargetSelectionVisuals() {
    const targets = getPluginConfigurableTargets();
    const activePlugin = findPluginById(pluginTargetSelectionState.pluginId);
    const selectedIds = new Set(activePlugin?.config?.disabledTargetIds || []);

    targets.forEach(target => {
        const id = target.getAttribute('data-plugin-target-id') || '';
        target.classList.toggle('plugin-config-target', pluginTargetSelectionState.active);
        target.classList.toggle('plugin-config-target-selected', pluginTargetSelectionState.active && selectedIds.has(id));
    });
}

function setPluginTargetSelectionMode(active, pluginId = '') {
    pluginTargetSelectionState.active = Boolean(active);
    pluginTargetSelectionState.pluginId = pluginTargetSelectionState.active ? pluginId : '';
    document.body.classList.toggle('plugin-config-selecting', pluginTargetSelectionState.active);

    if (!pluginTargetSelectionState.active) {
        getPluginConfigurableTargets().forEach(target => {
            target.classList.remove('plugin-config-target');
            target.classList.remove('plugin-config-target-selected');
        });
        return;
    }
    updatePluginTargetSelectionVisuals();
}

function setPluginTargetDisabledState(target, disabled) {
    if (!target) return;
    if (!disabled) {
        target.removeAttribute('aria-disabled');
        target.removeAttribute('data-plugin-disabled');
        target.removeAttribute('inert');
        target.inert = false;
        return;
    }

    target.setAttribute('aria-disabled', 'true');
    target.setAttribute('data-plugin-disabled', 'true');
    target.setAttribute('inert', '');
    target.inert = true;
}

function applyCardsContainersControlPlugin(plugin) {
    const targets = getPluginConfigurableTargets();
    const disabledIds = new Set(plugin?.config?.disabledTargetIds || []);
    targets.forEach(target => {
        const id = target.getAttribute('data-plugin-target-id') || '';
        const shouldDisable = Boolean(plugin?.enabled) && disabledIds.has(id);
        const selectionActiveForThisPlugin = pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id;
        const shouldDisableInteractions = shouldDisable && !selectionActiveForThisPlugin;
        target.classList.toggle('plugin-dim-disabled', shouldDisable);
        setPluginTargetDisabledState(target, shouldDisableInteractions);
    });
}

function setDebugPacketsLiteRuntime(enabled) {
    const nextEnabled = Boolean(enabled);
    document.body.classList.toggle('debug-packets-lite-active', nextEnabled);
    if (debugPacketsLiteRuntimeEnabled === nextEnabled) return;
    debugPacketsLiteRuntimeEnabled = nextEnabled;

    if (hackDemoState.running) {
        appendHackDemoLog(
            nextEnabled
                ? 'Debug Packets Lite enabled: packet telemetry expanded.'
                : 'Debug Packets Lite disabled: packet telemetry returned to default mode.',
            { force: true }
        );
        runHackDemoTick('plugin');
    }
}

function applyPluginRuntimeEffects() {
    getPluginConfigurableTargets().forEach(target => {
        target.classList.remove('plugin-dim-disabled');
        setPluginTargetDisabledState(target, false);
    });
    applyUiLayoutRemixPlugin(null);

    let hasDebugPacketsLite = false;
    let hasProfileBadgesPlus = false;
    let hasMacroToolsPack = false;
    let hasWorkspaceTools = false;
    let hasCrashTestTools = false;
    let activeUiLayoutRemixPlugin = null;
    const workflowPlugins = [];
    const installedWorkflowPlugins = [];
    const customPagePlugins = [];
    plugins.forEach(plugin => {
        if (plugin.behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) {
            applyCardsContainersControlPlugin(plugin);
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_DEBUG_PACKETS_LITE || plugin.id === PLUGIN_BEHAVIOR_DEBUG_PACKETS_LITE)) {
            hasDebugPacketsLite = true;
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_PROFILE_BADGES_PLUS || plugin.id === PLUGIN_BEHAVIOR_PROFILE_BADGES_PLUS)) {
            hasProfileBadgesPlus = true;
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_MACRO_TOOLS_PACK || plugin.id === PLUGIN_BEHAVIOR_MACRO_TOOLS_PACK)) {
            hasMacroToolsPack = true;
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_WORKSPACE_TOOLS || plugin.id === PLUGIN_BEHAVIOR_WORKSPACE_TOOLS)) {
            hasWorkspaceTools = true;
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_CRASH_TEST_TOOLS || plugin.id === PLUGIN_BEHAVIOR_CRASH_TEST_TOOLS)) {
            hasCrashTestTools = true;
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX || plugin.id === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX)) {
            activeUiLayoutRemixPlugin = plugin;
        }
        if (plugin.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS || plugin.id === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS) {
            installedWorkflowPlugins.push(plugin);
            if (plugin.enabled) {
                workflowPlugins.push(plugin);
            }
        }
        if (plugin.enabled && (plugin.behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO || plugin.id === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO)) {
            customPagePlugins.push(plugin);
        }
    });
    setProfileBadgesPlusRuntime(hasProfileBadgesPlus);
    setMacroToolsPackRuntime(hasMacroToolsPack);
    setWorkspaceToolsRuntime(hasWorkspaceTools);
    setCrashTestToolsRuntime(hasCrashTestTools);
    setDebugPacketsLiteRuntime(hasDebugPacketsLite);
    applyUiLayoutRemixPlugin(activeUiLayoutRemixPlugin);
    setWorkflowCanvasRuntime(workflowPlugins, installedWorkflowPlugins);
    setCustomPageStudioRuntime(customPagePlugins);
    cleanupOrphanRuntimePluginPages();

    if (pluginTargetSelectionState.active) {
        document.body.classList.add('plugin-config-selecting');
        updatePluginTargetSelectionVisuals();
    }
}

function loadPluginsFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLUGINS) || '[]');
        plugins = normalizePluginList(parsed);
    } catch (error) {
        plugins = [];
    }
    savePluginsToStorage();
    applyPluginRuntimeEffects();
}

function savePluginsToStorage() {
    localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(plugins));
}

function getPluginsSnapshot() {
    return JSON.parse(JSON.stringify(plugins));
}

function restorePluginsSnapshot(snapshot) {
    plugins = normalizePluginList(snapshot);
    savePluginsToStorage();
    renderPluginsList();
    applyPluginRuntimeEffects();
}

function handlePluginTargetSelectionClick(event) {
    if (!pluginTargetSelectionState.active) return;
    if (event.target.closest('#pluginConfigModal .modal-content')) return;

    const target = event.target.closest('[data-plugin-target-id]');
    if (!target || !target.classList.contains('plugin-config-target')) return;

    const plugin = findPluginById(pluginTargetSelectionState.pluginId);
    if (!plugin || plugin.behavior !== PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) return;

    event.preventDefault();
    event.stopPropagation();

    const targetId = target.getAttribute('data-plugin-target-id') || '';
    if (!targetId) return;
    const disabledSet = new Set(plugin.config?.disabledTargetIds || []);
    if (disabledSet.has(targetId)) {
        disabledSet.delete(targetId);
    } else {
        disabledSet.add(targetId);
    }
    plugin.config = plugin.config || {};
    plugin.config.disabledTargetIds = Array.from(disabledSet);
    savePluginsToStorage();
    applyPluginRuntimeEffects();
}

function closePluginConfigModal() {
    const modal = document.getElementById('pluginConfigModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function closePluginGuideModal() {
    const modal = document.getElementById('pluginGuideModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function getPluginSafetyFindings(plugin) {
    const findings = [];
    if (!plugin || typeof plugin !== 'object') return findings;

    const name = String(plugin.name || plugin.id || 'Plugin').trim();
    const behavior = String(plugin.behavior || '').trim();
    const route = String(plugin.configureRoute || '').trim();
    const sourceUrl = String(plugin.sourceUrl || '').trim();
    const version = String(plugin.version || '').trim();

    if (route) {
        const routeLower = route.toLowerCase();
        if (routeLower.startsWith('javascript:') || routeLower.startsWith('data:')) {
            findings.push({ severity: 'danger', text: `${name}: unsafe configure route (${route}).` });
        } else if (/^https?:\/\//i.test(route)) {
            findings.push({ severity: 'warning', text: `${name}: configure route opens an external page.` });
        }
    }

    if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) {
        findings.push({ severity: 'warning', text: `${name}: external source URL; verify publisher before use.` });
    }

    if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
        findings.push({ severity: 'warning', text: `${name}: non-standard version "${version}".` });
    }

    if (behavior && !KNOWN_RUNTIME_PLUGIN_BEHAVIORS.has(behavior)) {
        findings.push({ severity: 'warning', text: `${name}: unknown behavior "${behavior}".` });
    }

    if (!behavior && !route && !plugin.configurable) {
        findings.push({ severity: 'warning', text: `${name}: no runtime hook; this plugin may only provide metadata/info.` });
    }

    const missingPermissions = getMissingRequiredPluginPermissions(plugin);
    if (missingPermissions.length) {
        findings.push({
            severity: 'warning',
            text: `${name}: missing required permissions (${missingPermissions.join(', ')}).`
        });
    }

    const dependencyIssues = getPluginDependencyIssues(plugin);
    dependencyIssues.forEach(issue => {
        findings.push({
            severity: issue.severity === 'error' ? 'danger' : 'warning',
            text: `${name}: ${issue.message}`
        });
    });

    return findings;
}

function renderPluginGuideModal() {
    const body = document.getElementById('pluginGuideModalBody');
    if (!body) return;
    body.innerHTML = '';

    const section = (title) => {
        const block = document.createElement('div');
        block.className = 'plugin-guide-section';
        const heading = document.createElement('div');
        heading.className = 'plugin-guide-title';
        heading.textContent = title;
        block.appendChild(heading);
        body.appendChild(block);
        return block;
    };
    const addList = (block, items) => {
        const list = document.createElement('ul');
        list.className = 'plugin-guide-list';
        items.forEach(itemText => {
            const li = document.createElement('li');
            li.textContent = itemText;
            list.appendChild(li);
        });
        block.appendChild(list);
    };

    const installedCount = plugins.length;
    const enabledCount = plugins.filter(plugin => Boolean(plugin && plugin.enabled)).length;

    const overview = section('Overview');
    addList(overview, [
        `Installed plugins: ${installedCount}`,
        `Enabled plugins: ${enabledCount}`,
        'A plugin should either change UI/behavior directly or show clear status/log feedback when toggled.'
    ]);

    const install = section('Install / Uninstall / Configure');
    addList(install, [
        'Install: Settings > Plugins > Open Marketplace > INSTALL.',
        'Uninstall: use UNINSTALL in marketplace or DELETE in Plugin Manager.',
        'Configure: click CONFIGURE when available; if no CONFIGURE exists, the plugin usually has default behavior or is info-only.',
        'Import package: use IMPORT PLUGIN PACKAGE (.json).'
    ]);

    const verify = section('How To Verify A Plugin Works');
    addList(verify, [
        'Toggle plugin ON and check for immediate visual/runtime changes.',
        'Check debug log / notifications for plugin status messages.',
        'If nothing changes and no runtime hook exists, it may be metadata-only.',
        'Use this guide safety scan to detect suspicious plugin fields.'
    ]);

    const safety = section('Safety Guide');
    addList(safety, [
        'Prefer marketplace or trusted local plugin JSON files.',
        'Be careful with plugins that use external links/routes.',
        'Avoid plugins with javascript:/data: configure routes.',
        'Keep workspace backups before importing third-party packages.'
    ]);

    const findingsSection = section('Live Safety Scan (Installed Plugins)');
    const allFindings = plugins.flatMap(plugin => getPluginSafetyFindings(plugin));
    const dangerCount = allFindings.filter(item => item.severity === 'danger').length;
    const warningCount = allFindings.filter(item => item.severity === 'warning').length;

    const summaryRow = document.createElement('div');
    summaryRow.className = 'plugin-guide-safety-row';
    const summaryBadge = document.createElement('span');
    summaryBadge.className = `plugin-guide-severity ${dangerCount > 0 ? 'danger' : (warningCount > 0 ? 'warning' : 'safe')}`;
    summaryBadge.textContent = dangerCount > 0
        ? 'DANGER'
        : (warningCount > 0 ? 'WARNINGS' : 'SAFE');
    const summaryText = document.createElement('span');
    summaryText.textContent = dangerCount > 0
        ? `${dangerCount} danger and ${warningCount} warning findings detected.`
        : (warningCount > 0
            ? `${warningCount} warning findings detected.`
            : 'No danger/warning findings detected in installed plugins.');
    summaryRow.appendChild(summaryBadge);
    summaryRow.appendChild(summaryText);
    findingsSection.appendChild(summaryRow);

    if (allFindings.length) {
        allFindings.forEach(item => {
            const row = document.createElement('div');
            row.className = 'plugin-guide-safety-row';
            const badge = document.createElement('span');
            badge.className = `plugin-guide-severity ${item.severity}`;
            badge.textContent = String(item.severity || 'warning').toUpperCase();
            const text = document.createElement('span');
            text.textContent = item.text;
            row.appendChild(badge);
            row.appendChild(text);
            findingsSection.appendChild(row);
        });
    }
}

function openPluginGuideModal() {
    const modal = document.getElementById('pluginGuideModal');
    if (!modal) return;
    renderPluginGuideModal();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function openPluginInfoModal(pluginLike, extraMeta = null) {
    const plugin = pluginLike && typeof pluginLike === 'object' ? pluginLike : null;
    if (!plugin) return;

    const modal = document.getElementById('pluginConfigModal');
    const title = document.getElementById('pluginConfigModalTitle');
    const body = document.getElementById('pluginConfigModalBody');
    if (!modal || !title || !body) return;

    const info = plugin.info && typeof plugin.info === 'object' ? plugin.info : {};
    const what = String(info.what || plugin.description || '').trim();
    const how = String(info.how || '').trim();
    const usage = String(info.usage || plugin.configureHint || '').trim();
    const notes = Array.isArray(info.notes) ? info.notes.map(note => String(note || '').trim()).filter(Boolean) : [];
    const meta = extraMeta && typeof extraMeta === 'object' ? extraMeta : {};

    title.textContent = `Plugin Info - ${plugin.name || 'Plugin'}`;
    body.innerHTML = '';

    const subtitle = document.createElement('p');
    subtitle.className = 'setting-note';
    subtitle.textContent = info.title || plugin.name || 'Plugin information';
    body.appendChild(subtitle);

    const details = [];
    if (plugin.version) details.push(`v${plugin.version}`);
    if (plugin.author) details.push(`by ${plugin.author}`);
    if (meta.category) details.push(`category: ${String(meta.category).toUpperCase()}`);
    if (Array.isArray(meta.tags) && meta.tags.length) details.push(`tags: ${meta.tags.join(', ')}`);
    if (plugin.sourceUrl) details.push(plugin.sourceUrl);
    if (details.length) {
        const detailsEl = document.createElement('p');
        detailsEl.className = 'setting-note';
        detailsEl.textContent = details.join(' | ');
        body.appendChild(detailsEl);
    }

    const appendInfoSection = (label, text) => {
        if (!text) return;
        const sectionTitle = document.createElement('h4');
        sectionTitle.className = 'setting-note';
        sectionTitle.textContent = label;
        body.appendChild(sectionTitle);

        const sectionText = document.createElement('p');
        sectionText.className = 'setting-note';
        sectionText.textContent = text;
        body.appendChild(sectionText);
    };

    appendInfoSection('What It Does', what);
    appendInfoSection('How It Works', how);
    appendInfoSection('How To Use', usage);

    if (notes.length) {
        const notesTitle = document.createElement('h4');
        notesTitle.className = 'setting-note';
        notesTitle.textContent = 'Notes';
        body.appendChild(notesTitle);
        notes.forEach(noteText => {
            const line = document.createElement('p');
            line.className = 'setting-note';
            line.textContent = `- ${noteText}`;
            body.appendChild(line);
        });
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-primary';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', closePluginConfigModal);
    body.appendChild(closeBtn);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function appendPluginDependencySection(body, plugin) {
    if (!body || !plugin) return;
    const deps = Array.isArray(plugin.dependencies) ? plugin.dependencies : [];
    if (!deps.length) return;

    const title = document.createElement('h4');
    title.className = 'setting-note';
    title.textContent = 'Dependencies';
    body.appendChild(title);

    const issues = getPluginDependencyIssues(plugin);
    const issueMap = new Map(issues.map(item => [item.message, item]));
    deps.forEach(dep => {
        const row = document.createElement('p');
        row.className = 'setting-note';
        const requiresText = `${dep.id}${dep.minVersion ? ` >= ${dep.minVersion}` : ''}`;
        const issue = issues.find(item => item.message.toLowerCase().includes(String(dep.id || '').toLowerCase()));
        row.textContent = issue ? `- ${requiresText} (${issue.message})` : `- ${requiresText} (OK)`;
        body.appendChild(row);
    });

    if (!issueMap.size) {
        const ok = document.createElement('p');
        ok.className = 'setting-note';
        ok.textContent = 'All dependencies are currently satisfied.';
        body.appendChild(ok);
    }
}

function appendPluginPermissionSection(body, plugin, canManagePlugins) {
    if (!body || !plugin) return;
    const required = Array.isArray(plugin.requiredPermissions) ? plugin.requiredPermissions : [];
    if (!required.length) return;

    const title = document.createElement('h4');
    title.className = 'setting-note';
    title.textContent = 'Permissions';
    body.appendChild(title);

    const note = document.createElement('p');
    note.className = 'setting-note';
    note.textContent = 'Required permissions must be allowed before this plugin can be enabled.';
    body.appendChild(note);

    required.forEach(permissionId => {
        if (!Object.prototype.hasOwnProperty.call(PLUGIN_PERMISSION_DEFINITIONS, permissionId)) return;
        const def = PLUGIN_PERMISSION_DEFINITIONS[permissionId];
        const row = document.createElement('div');
        row.className = 'setting-inline-controls';

        const text = document.createElement('span');
        text.className = 'setting-note';
        text.textContent = `${def.label} - ${def.description}`;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-secondary';
        const allowed = plugin.permissions && plugin.permissions[permissionId] === true;
        toggleBtn.textContent = allowed ? 'ALLOWED' : 'DENIED';
        toggleBtn.disabled = !canManagePlugins;
        toggleBtn.addEventListener('click', () => {
            if (!isRoleAllowed('plugins')) {
                showNotification('Permission edit is blocked for this profile role.');
                return;
            }
            const snapshot = getPluginsSnapshot();
            plugin.permissions = normalizePluginPermissionMap(
                {
                    ...(plugin.permissions && typeof plugin.permissions === 'object' ? plugin.permissions : {}),
                    [permissionId]: !(plugin.permissions && plugin.permissions[permissionId] === true)
                },
                plugin.requiredPermissions
            );
            savePluginsToStorage();
            renderPluginsList();
            openPluginConfiguration(plugin.id);
            recordRecentChange(`Plugin permission changed: ${plugin.name} (${permissionId})`, () => restorePluginsSnapshot(snapshot));
        });

        row.appendChild(text);
        row.appendChild(toggleBtn);
        body.appendChild(row);
    });
}

function openPluginConfiguration(pluginId) {
    const plugin = findPluginById(pluginId);
    if (!plugin) return;
    const canManagePlugins = isRoleAllowed('plugins');

    const modal = document.getElementById('pluginConfigModal');
    const title = document.getElementById('pluginConfigModalTitle');
    const body = document.getElementById('pluginConfigModalBody');
    if (!modal || !title || !body) return;

    title.textContent = `Plugin Config - ${plugin.name}`;
    body.innerHTML = '';
    if (!canManagePlugins) {
        const roleNote = document.createElement('p');
        roleNote.className = 'setting-note';
        roleNote.textContent = 'Plugin configuration is read-only for the current profile role.';
        body.appendChild(roleNote);
    }

    if (plugin.behavior !== PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) {
        setPluginTargetSelectionMode(false);
    }

    if (plugin.behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) {
        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = 'Tip: use SELECT MODE ON/OFF in the plugin row. You can close this popup and keep selecting cards/containers.';
        body.appendChild(note);

        const controls = document.createElement('div');
        controls.className = 'setting-inline-controls';

        const toggleSelectionBtn = document.createElement('button');
        toggleSelectionBtn.className = 'btn-secondary';
        toggleSelectionBtn.textContent = pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id
            ? 'STOP SELECTION'
            : 'START SELECTION';
        toggleSelectionBtn.addEventListener('click', () => {
            const nextActive = !(pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id);
            setPluginTargetSelectionMode(nextActive, plugin.id);
            applyPluginRuntimeEffects();
            openPluginConfiguration(plugin.id);
        });
        toggleSelectionBtn.disabled = !canManagePlugins;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-secondary';
        clearBtn.textContent = 'CLEAR DISABLED';
        clearBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            plugin.config = plugin.config || {};
            plugin.config.disabledTargetIds = [];
            savePluginsToStorage();
            applyPluginRuntimeEffects();
            openPluginConfiguration(plugin.id);
            recordRecentChange(`Plugin config cleared: ${plugin.name}`, () => restorePluginsSnapshot(snapshot));
        });
        clearBtn.disabled = !canManagePlugins;

        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-primary';
        doneBtn.textContent = 'DONE';
        doneBtn.addEventListener('click', closePluginConfigModal);

        controls.appendChild(toggleSelectionBtn);
        controls.appendChild(clearBtn);
        controls.appendChild(doneBtn);
        body.appendChild(controls);

        const selected = plugin.config?.disabledTargetIds || [];
        const summary = document.createElement('p');
        summary.className = 'setting-note';
        summary.textContent = `Disabled targets: ${selected.length}`;
        body.appendChild(summary);

        const list = document.createElement('div');
        list.className = 'debug-plugins-list';
        if (!selected.length) {
            const empty = document.createElement('div');
            empty.className = 'setting-note';
            empty.textContent = 'No targets selected.';
            list.appendChild(empty);
        } else {
            const targetMap = new Map(getPluginConfigurableTargets().map(target => [target.getAttribute('data-plugin-target-id'), getPluginTargetLabel(target)]));
            selected.forEach(id => {
                const row = document.createElement('div');
                row.className = 'debug-plugin-item';
                row.textContent = targetMap.get(id) || id;
                list.appendChild(row);
            });
        }
        body.appendChild(list);
    } else if (plugin.behavior === PLUGIN_BEHAVIOR_UI_LAYOUT_REMIX) {
        const currentConfig = normalizeUiLayoutRemixConfig(plugin.config);
        plugin.config = {
            ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
            ...currentConfig
        };

        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = 'Switch sidebar side and place the full header block at top or bottom.';
        body.appendChild(note);

        const sidebarRow = document.createElement('div');
        sidebarRow.className = 'setting';
        const sidebarLabel = document.createElement('label');
        sidebarLabel.textContent = 'Sidebar Position';
        const sidebarSelect = document.createElement('select');
        sidebarSelect.className = 'combo-box';
        [
            { value: 'left', label: 'LEFT (DEFAULT)' },
            { value: 'right', label: 'RIGHT' }
        ].forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.label;
            sidebarSelect.appendChild(option);
        });
        sidebarSelect.value = currentConfig.sidebarPosition;
        sidebarSelect.disabled = !canManagePlugins;
        sidebarRow.appendChild(sidebarLabel);
        sidebarRow.appendChild(sidebarSelect);
        body.appendChild(sidebarRow);

        const headerRow = document.createElement('div');
        headerRow.className = 'setting';
        const headerLabel = document.createElement('label');
        headerLabel.textContent = 'Header Position';
        const headerSelect = document.createElement('select');
        headerSelect.className = 'combo-box';
        [
            { value: 'top', label: 'TOP (DEFAULT)' },
            { value: 'bottom', label: 'BOTTOM' }
        ].forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.label;
            headerSelect.appendChild(option);
        });
        headerSelect.value = currentConfig.headerPosition;
        headerSelect.disabled = !canManagePlugins;
        headerRow.appendChild(headerLabel);
        headerRow.appendChild(headerSelect);
        body.appendChild(headerRow);

        const applyLayoutConfig = (nextPartial, reasonLabel) => {
            const snapshot = getPluginsSnapshot();
            const nextConfig = normalizeUiLayoutRemixConfig({
                ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
                ...nextPartial
            });
            plugin.config = {
                ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
                ...nextConfig
            };
            savePluginsToStorage();
            applyPluginRuntimeEffects();
            sidebarSelect.value = nextConfig.sidebarPosition;
            headerSelect.value = nextConfig.headerPosition;
            showNotification(`${plugin.name}: ${reasonLabel}`);
            recordRecentChange(`Plugin config changed: ${plugin.name} (${reasonLabel})`, () => restorePluginsSnapshot(snapshot));
        };

        sidebarSelect.addEventListener('change', () => {
            applyLayoutConfig({ sidebarPosition: sidebarSelect.value }, 'sidebar position');
        });
        headerSelect.addEventListener('change', () => {
            applyLayoutConfig({ headerPosition: headerSelect.value }, 'header position');
        });

        const controls = document.createElement('div');
        controls.className = 'setting-inline-controls';

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-secondary';
        resetBtn.textContent = 'RESET LAYOUT';
        resetBtn.addEventListener('click', () => {
            applyLayoutConfig({ sidebarPosition: 'left', headerPosition: 'top' }, 'layout reset');
        });
        resetBtn.disabled = !canManagePlugins;

        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-primary';
        doneBtn.textContent = 'DONE';
        doneBtn.addEventListener('click', closePluginConfigModal);

        controls.appendChild(resetBtn);
        controls.appendChild(doneBtn);
        body.appendChild(controls);
    } else if (plugin.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS) {
        const config = normalizeWorkflowCanvasConfig(plugin.config);
        plugin.config = {
            ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
            ...config
        };

        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = 'Workflow Canvas opens as a Settings subpage with node whiteboard editing (macro/automation/key-action nodes).';
        body.appendChild(note);

        const summary = document.createElement('p');
        summary.className = 'setting-note';
        summary.textContent = `Nodes: ${config.nodes.length} | Links: ${config.connections.length} | Loops: ${config.loopCount}`;
        body.appendChild(summary);

        const controls = document.createElement('div');
        controls.className = 'setting-inline-controls';

        const openPageBtn = document.createElement('button');
        openPageBtn.className = 'btn-secondary';
        openPageBtn.textContent = 'OPEN WORKFLOW CANVAS';
        openPageBtn.disabled = !canManagePlugins;
        openPageBtn.addEventListener('click', () => {
            if (!plugin.enabled) {
                showNotification('Enable the plugin first.');
                return;
            }
            selectPage('settings');
            updatePageTitle('settings');
            openWorkflowCanvasConfigurator();
            closePluginConfigModal();
        });

        const runNowBtn = document.createElement('button');
        runNowBtn.className = 'btn-secondary';
        runNowBtn.textContent = 'RUN NOW';
        runNowBtn.disabled = !canManagePlugins;
        runNowBtn.addEventListener('click', () => {
            runWorkflowCanvasPlugin(plugin.id);
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-secondary';
        resetBtn.textContent = 'RESET WORKFLOW';
        resetBtn.setAttribute('data-safety-lock', 'required');
        resetBtn.disabled = !canManagePlugins;
        resetBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            plugin.config = normalizeWorkflowCanvasConfig({
                pageTitle: 'Workflow Canvas',
                loopCount: 1,
                steps: [],
                nodes: [],
                connections: [],
                selectedNodeId: ''
            });
            savePluginsToStorage();
            applyPluginRuntimeEffects();
            openPluginConfiguration(plugin.id);
            recordRecentChange(`Plugin config reset: ${plugin.name}`, () => restorePluginsSnapshot(snapshot));
        });

        controls.appendChild(openPageBtn);
        controls.appendChild(runNowBtn);
        controls.appendChild(resetBtn);
        body.appendChild(controls);
    } else if (plugin.behavior === PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO) {
        const config = normalizeCustomPageStudioConfig(plugin.config);
        plugin.config = {
            ...(plugin.config && typeof plugin.config === 'object' ? plugin.config : {}),
            ...config
        };

        const betaNote = document.createElement('p');
        betaNote.className = 'debug-plugin-state-note warn';
        betaNote.textContent = 'BETA / EXPERIMENTAL: this plugin can still be unstable and parts may not work correctly.';
        body.appendChild(betaNote);

        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = 'Custom Page Studio creates extra sidebar pages and lets you build cards/widgets for each page.';
        body.appendChild(note);

        const summary = document.createElement('p');
        summary.className = 'setting-note';
        const totalCards = config.pages.reduce((sum, pageData) => sum + pageData.cards.length, 0);
        summary.textContent = `Pages: ${config.pages.length} | Cards: ${totalCards}`;
        body.appendChild(summary);

        const controls = document.createElement('div');
        controls.className = 'setting-inline-controls';

        const openEditorBtn = document.createElement('button');
        openEditorBtn.className = 'btn-secondary';
        openEditorBtn.textContent = 'OPEN CUSTOM PAGE STUDIO';
        openEditorBtn.disabled = !canManagePlugins;
        openEditorBtn.addEventListener('click', () => {
            if (!plugin.enabled) {
                showNotification('Enable the plugin first.');
                return;
            }
            selectPage('settings');
            updatePageTitle('settings');
            openCustomPagesConfigurator();
            closePluginConfigModal();
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-secondary';
        resetBtn.textContent = 'RESET PAGE';
        resetBtn.setAttribute('data-safety-lock', 'required');
        resetBtn.disabled = !canManagePlugins;
        resetBtn.addEventListener('click', () => {
            const snapshot = getPluginsSnapshot();
            plugin.config = normalizeCustomPageStudioConfig({
                pageTitle: 'Custom Page Studio',
                pages: [],
                selectedPageId: ''
            });
            savePluginsToStorage();
            applyPluginRuntimeEffects();
            openPluginConfiguration(plugin.id);
            recordRecentChange(`Plugin config reset: ${plugin.name}`, () => restorePluginsSnapshot(snapshot));
        });

        controls.appendChild(openEditorBtn);
        controls.appendChild(resetBtn);
        body.appendChild(controls);
    } else if (plugin.configureRoute) {
        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = plugin.configureHint || 'This plugin uses a custom configure route. Developer handles control flow.';
        body.appendChild(note);
        const openRouteBtn = document.createElement('button');
        openRouteBtn.className = 'btn-secondary';
        openRouteBtn.textContent = 'OPEN CONFIG ROUTE';
        openRouteBtn.addEventListener('click', () => {
            try {
                window.open(plugin.configureRoute, '_blank');
            } catch (error) {
                showNotification('Could not open configure route.');
            }
        });
        body.appendChild(openRouteBtn);
    } else {
        const note = document.createElement('p');
        note.className = 'setting-note';
        note.textContent = plugin.configureHint || 'Developer must implement plugin control/configure flow (button or custom route).';
        body.appendChild(note);
    }

    appendPluginDependencySection(body, plugin);
    appendPluginPermissionSection(body, plugin, canManagePlugins);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function renderPluginsList() {
    const list = document.getElementById('debugPluginsList');
    if (!list) return;
    list.innerHTML = '';
    const canManagePlugins = isRoleAllowed('plugins');

    if (!plugins.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-note';
        empty.textContent = 'No plugins added yet.';
        list.appendChild(empty);
        renderMarketplaceList();
        return;
    }

    plugins.forEach(plugin => {
        const dependencyIssues = getPluginDependencyIssues(plugin);
        const missingPermissions = getMissingRequiredPluginPermissions(plugin);
        const row = document.createElement('div');
        row.className = 'debug-plugin-item';

        const meta = document.createElement('div');
        meta.className = 'debug-plugin-meta';

        const nameRow = document.createElement('div');
        nameRow.className = 'debug-plugin-name-row';
        const name = document.createElement('div');
        name.className = 'debug-plugin-name';
        name.textContent = plugin.name;
        const isBeta = plugin.experimental === true || String(plugin.stability || '').toLowerCase() === 'beta';
        if (isBeta) {
            const betaTag = document.createElement('span');
            betaTag.className = 'plugin-beta-tag';
            betaTag.textContent = 'BETA';
            nameRow.appendChild(name);
            nameRow.appendChild(betaTag);
        } else {
            nameRow.appendChild(name);
        }

        const version = document.createElement('div');
        version.className = 'debug-plugin-version';
        const versionParts = [`v${plugin.version}`];
        if (plugin.author) versionParts.push(`by ${plugin.author}`);
        if (plugin.sourceUrl) versionParts.push(plugin.sourceUrl);
        version.textContent = versionParts.join(' | ');

        meta.appendChild(nameRow);
        meta.appendChild(version);
        if (plugin.description) {
            const description = document.createElement('div');
            description.className = 'setting-note';
            description.textContent = plugin.description;
            meta.appendChild(description);
        }
        const depNote = document.createElement('div');
        depNote.className = `debug-plugin-state-note${dependencyIssues.length ? ' warn' : ''}`;
        depNote.textContent = (plugin.dependencies && plugin.dependencies.length)
            ? (dependencyIssues.length
                ? dependencyIssues.map(item => item.message).join(' | ')
                : `Dependencies OK: ${plugin.dependencies.map(dep => dep.id).join(', ')}`)
            : 'Dependencies: none (standalone)';
        meta.appendChild(depNote);
        if (plugin.requiredPermissions && plugin.requiredPermissions.length) {
            const permNote = document.createElement('div');
            permNote.className = `debug-plugin-state-note${missingPermissions.length ? ' error' : ''}`;
            permNote.textContent = missingPermissions.length
                ? `Missing permissions: ${missingPermissions.join(', ')}`
                : `Permissions OK: ${plugin.requiredPermissions.join(', ')}`;
            meta.appendChild(permNote);
        }

        const controls = document.createElement('div');
        controls.className = 'debug-plugin-controls';

        const stateBtn = document.createElement('button');
        stateBtn.className = 'keybind-control-btn';
        stateBtn.textContent = plugin.enabled ? 'ON' : 'OFF';
        stateBtn.addEventListener('click', () => {
            if (!isRoleAllowed('plugins')) {
                showNotification('Plugin toggle is blocked for this profile role.');
                return;
            }
            const turningOn = !plugin.enabled;
            if (turningOn) {
                const currentMissingPermissions = getMissingRequiredPluginPermissions(plugin);
                if (currentMissingPermissions.length) {
                    showNotification(`Cannot enable ${plugin.name}: allow permissions first.`);
                    openPluginConfiguration(plugin.id);
                    return;
                }
            }
            const snapshot = getPluginsSnapshot();
            plugin.enabled = !plugin.enabled;
            const hasRuntimeHooks = Boolean(plugin.behavior || plugin.configureRoute || plugin.configurable);
            savePluginsToStorage();
            renderPluginsList();
            applyPluginRuntimeEffects();
            syncDynamicKeybindActions(true);
            if (plugin.enabled) {
                checkPluginDependencies(plugin);
            }
            if (plugin.enabled) {
                showNotification(hasRuntimeHooks
                    ? `Plugin ON: ${plugin.name}`
                    : `${plugin.name} ON (info package: no runtime hook yet).`);
            } else {
                showNotification(`Plugin OFF: ${plugin.name}`);
            }
            recordRecentChange(
                `Plugin ${plugin.enabled ? 'ON' : 'OFF'}: ${plugin.name}`,
                () => restorePluginsSnapshot(snapshot)
            );
        });
        stateBtn.disabled = !canManagePlugins;
        controls.appendChild(stateBtn);

        const infoBtn = document.createElement('button');
        infoBtn.className = 'keybind-control-btn';
        infoBtn.textContent = 'INFO';
        infoBtn.addEventListener('click', () => openPluginInfoModal(plugin));
        controls.appendChild(infoBtn);

        if (pluginNeedsConfigureButton(plugin)) {
            const configureBtn = document.createElement('button');
            configureBtn.className = 'keybind-control-btn';
            if (plugin.behavior === PLUGIN_BEHAVIOR_CARDS_CONTAINERS_CONTROL) {
                const selectionActive = pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id;
                configureBtn.textContent = selectionActive ? 'SELECT MODE ON' : 'SELECT MODE OFF';
                configureBtn.addEventListener('click', () => {
                    const nextActive = !(pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id);
                    setPluginTargetSelectionMode(nextActive, plugin.id);
                    applyPluginRuntimeEffects();
                    renderPluginsList();
                    showNotification(nextActive
                        ? `${plugin.name}: selection mode enabled. Click cards/containers to select.`
                        : `${plugin.name}: selection mode disabled.`);
                });
            } else {
                configureBtn.textContent = 'CONFIGURE';
                configureBtn.addEventListener('click', () => openPluginConfiguration(plugin.id));
            }
            configureBtn.disabled = !canManagePlugins;
            controls.appendChild(configureBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        deleteBtn.addEventListener('click', () => {
            if (!isRoleAllowed('plugins')) {
                showNotification('Plugin delete is blocked for this profile role.');
                return;
            }
            const snapshot = getPluginsSnapshot();
            if (pluginTargetSelectionState.active && pluginTargetSelectionState.pluginId === plugin.id) {
                setPluginTargetSelectionMode(false);
                closePluginConfigModal();
            }
            plugins = plugins.filter(item => item.id !== plugin.id);
            savePluginsToStorage();
            renderPluginsList();
            applyPluginRuntimeEffects();
            syncDynamicKeybindActions(true);
            showNotification(`Plugin removed: ${plugin.name}`);
            recordRecentChange(`Plugin removed: ${plugin.name}`, () => restorePluginsSnapshot(snapshot));
        });
        deleteBtn.disabled = !canManagePlugins;
        controls.appendChild(deleteBtn);

        row.appendChild(meta);
        row.appendChild(controls);
        list.appendChild(row);
    });
    applyPluginRuntimeEffects();
    renderMarketplaceList();
    applyRoleBasedControlState();
}

function createDebugPlugin() {
    const nameInput = document.getElementById('debugPluginNameInput');
    const versionInput = document.getElementById('debugPluginVersionInput');
    const authorInput = document.getElementById('debugPluginAuthorInput');
    const sourceInput = document.getElementById('debugPluginSourceInput');
    if (!nameInput || !versionInput || !authorInput || !sourceInput) return;
    if (!isRoleAllowed('plugins')) {
        showNotification('Plugin creation is blocked for this profile role.');
        return;
    }

    const nameRaw = String(nameInput.value || '').trim();
    const versionRaw = String(versionInput.value || '').trim();
    const authorRaw = String(authorInput.value || '').trim();
    const sourceRaw = String(sourceInput.value || '').trim();
    if (!nameRaw) {
        showNotification('Enter a plugin name first.');
        return;
    }

    const snapshot = getPluginsSnapshot();
    const baseId = nameRaw.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'plugin';
    let id = baseId;
    let suffix = 1;
    while (plugins.some(item => item.id === id)) {
        suffix += 1;
        id = `${baseId}-${suffix}`;
    }
    plugins.unshift({
        id,
        name: nameRaw,
        version: versionRaw || '1.0.0',
        author: authorRaw,
        sourceUrl: sourceRaw,
        description: '',
        enabled: false,
        behavior: '',
        configurable: false,
        configureRoute: '',
        configureHint: '',
        config: {},
        requiredPermissions: [],
        permissions: normalizePluginPermissionMap({}, []),
        dependencies: []
    });
    savePluginsToStorage();
    renderPluginsList();
    applyPluginRuntimeEffects();
    nameInput.value = '';
    versionInput.value = '';
    authorInput.value = '';
    sourceInput.value = '';
    showNotification(`Plugin added: ${nameRaw}`);
    recordRecentChange(`Plugin added: ${nameRaw}`, () => restorePluginsSnapshot(snapshot));
}

function exportPluginPackages() {
    if (!isRoleAllowed('plugins')) {
        showNotification('Plugin export is blocked for this profile role.');
        return;
    }
    const payload = {
        type: 'nexus-plugin-package',
        version: 1,
        exportedAt: new Date().toISOString(),
        plugins: normalizePluginList(plugins)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexus-plugins.json';
    anchor.click();
    URL.revokeObjectURL(url);
    showNotification('Plugin list exported.');
}

function parsePluginPackagePayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.plugins)) return payload.plugins;
    if (payload.plugin && typeof payload.plugin === 'object') return [payload.plugin];
    if (payload.name || payload.id) return [payload];
    return [];
}

function importPluginPackages(file) {
    if (!isRoleAllowed('plugins')) {
        showNotification('Plugin import is blocked for this profile role.');
        return;
    }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(String(reader.result || '{}'));
            const incoming = normalizePluginList(parsePluginPackagePayload(parsed));
            if (!incoming.length) {
                showNotification('No valid plugins found in package.');
                return;
            }

            const snapshot = getPluginsSnapshot();
            let added = 0;
            let updated = 0;
            incoming.forEach(plugin => {
                const existingIndex = plugins.findIndex(item =>
                    item.id === plugin.id || item.name.toLowerCase() === plugin.name.toLowerCase()
                );
                if (existingIndex >= 0) {
                    plugins[existingIndex] = {
                        ...plugins[existingIndex],
                        ...plugin
                    };
                    updated += 1;
                } else {
                    plugins.unshift(plugin);
                    added += 1;
                }
            });

            savePluginsToStorage();
            renderPluginsList();
            applyPluginRuntimeEffects();
            showNotification(`Plugins imported: +${added}, updated ${updated}.`);
            recordRecentChange(`Plugin package imported (+${added}, updated ${updated})`, () => restorePluginsSnapshot(snapshot));
        } catch (error) {
            showNotification('Invalid plugin package JSON.');
        }
    };
    reader.readAsText(file);
}

function safeParseStoredJson(raw, fallback) {
    try {
        const parsed = JSON.parse(String(raw || ''));
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
        return fallback;
    }
}

function captureWorkspaceSummaryFromStorageSnapshot(snapshot = null) {
    const source = snapshot && typeof snapshot === 'object' ? snapshot : captureLocalStorageSnapshot();
    const profilesData = safeParseStoredJson(source[STORAGE_KEYS.PROFILES], { Default: null });
    const macrosData = safeParseStoredJson(source[STORAGE_KEYS.MACROS], []);
    const automationsData = safeParseStoredJson(source[STORAGE_KEYS.AUTOMATIONS], []);
    const pluginsData = safeParseStoredJson(source[STORAGE_KEYS.PLUGINS], []);
    const featuresData = safeParseStoredJson(source[STORAGE_KEYS.FEATURES], {});

    const profileCount = profilesData && typeof profilesData === 'object' && !Array.isArray(profilesData)
        ? Object.keys(profilesData).length
        : 0;
    const macroCount = Array.isArray(macrosData) ? macrosData.length : 0;
    const automationCount = Array.isArray(automationsData) ? automationsData.length : 0;
    const pluginCount = Array.isArray(pluginsData) ? pluginsData.length : 0;
    const enabledPlugins = Array.isArray(pluginsData) ? pluginsData.filter(item => item && item.enabled).length : 0;
    const activeHacks = featuresData && typeof featuresData === 'object' && !Array.isArray(featuresData)
        ? Object.values(featuresData).filter(Boolean).length
        : 0;

    return { profileCount, macroCount, automationCount, pluginCount, enabledPlugins, activeHacks };
}

function formatWorkspaceSummary(summary) {
    const safe = summary && typeof summary === 'object' ? summary : captureWorkspaceSummaryFromStorageSnapshot();
    return `${safe.profileCount} profiles | ${safe.macroCount} macros | ${safe.automationCount} automations | ${safe.pluginCount} plugins (${safe.enabledPlugins} on) | ${safe.activeHacks} active hacks`;
}

function getWorkspaceBackupSnapshot() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACE_SYNC_BACKUP);
    if (!raw) return null;
    const parsed = safeParseStoredJson(raw, null);
    if (!parsed || typeof parsed !== 'object' || !parsed.storage || typeof parsed.storage !== 'object') {
        return null;
    }
    return parsed;
}

function restoreWorkspaceBackup() {
    if (!isRoleAllowed('workspace')) {
        showNotification('Workspace restore is blocked for this profile role.');
        return;
    }
    const backup = getWorkspaceBackupSnapshot();
    if (!backup) {
        showNotification('No workspace backup available.');
        return;
    }

    const previousStorage = captureLocalStorageSnapshot();
    restoreLocalStorageSnapshot(backup.storage);
    refreshWorkspaceStateFromStorage();

    const restoredSummary = captureWorkspaceSummaryFromStorageSnapshot();
    const stamp = `Workspace backup restored at ${new Date().toLocaleTimeString()} | ${formatWorkspaceSummary(restoredSummary)}`;
    setWorkspaceSyncStatus(stamp, true);
    showNotification('Workspace backup restored.');
    recordRecentChange('Workspace backup restored', () => {
        restoreLocalStorageSnapshot(previousStorage);
        refreshWorkspaceStateFromStorage();
        setWorkspaceSyncStatus('Workspace backup restore undone.', true);
    });
}

function ensureWorkspaceToolsControls() {
    const exportBtn = document.getElementById('exportWorkspaceSyncBtn');
    const controls = exportBtn ? exportBtn.closest('.setting-inline-controls') : null;
    if (!controls) return;

    let restoreBtn = document.getElementById('restoreWorkspaceBackupBtn');
    if (!workspaceToolsRuntimeEnabled) {
        if (restoreBtn) restoreBtn.remove();
        return;
    }

    if (!restoreBtn) {
        restoreBtn = document.createElement('button');
        restoreBtn.className = 'btn-secondary';
        restoreBtn.id = 'restoreWorkspaceBackupBtn';
        restoreBtn.type = 'button';
        restoreBtn.textContent = 'RESTORE BACKUP';
        restoreBtn.setAttribute('data-safety-lock', 'required');
        restoreBtn.addEventListener('click', restoreWorkspaceBackup);
        controls.appendChild(restoreBtn);
    }

    const hasBackup = Boolean(getWorkspaceBackupSnapshot());
    restoreBtn.disabled = !hasBackup;
    restoreBtn.title = hasBackup ? 'Restore latest automatic workspace backup' : 'No backup available yet';
}

function setWorkspaceSyncStatus(text, persist = false) {
    const label = document.getElementById('workspaceSyncStatus');
    const safeText = String(text || 'No workspace sync action yet.');
    if (label) {
        label.textContent = safeText;
    }
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.WORKSPACE_SYNC_LAST, safeText);
    }
    ensureWorkspaceToolsControls();
}

function refreshWorkspaceStateFromStorage() {
    stopHackDemo(false);
    resetHackDemoState();
    clearHackDemoLog(true);

    loadSettings();
    loadProfiles();
    setupQuickToggle();

    loadMacrosFromStorage();
    loadMacroCollapseStateFromStorage();
    syncMacroCollapseState();
    renderMacrosList();

    loadAutomationsFromStorage();
    loadAutomationCollapseStateFromStorage();
    syncAutomationCollapseState();
    syncAutomationRuntimeState();
    renderAutomationsList();
    startAutomationEngine();
    renderKeybindActions(activeKeybindGroup);

    loadPluginsFromStorage();
    renderPluginsList();

    hackDemoState.refreshMs = getSavedDebugRefreshRate();
    hackDemoState.compactMode = getSavedDebugCompactMode();
    hackDemoState.autoScroll = getSavedDebugAutoScroll();
    setHackDemoCompactMode(hackDemoState.compactMode, false);
    setHackDemoAutoScroll(hackDemoState.autoScroll, false);
    updateHackDemoControlsUi();
    refreshDebugEnvironmentMetrics();
    renderHackDemoPanel();
    setActiveDebugMetric(hackDemoState.activeMetric);
    startHackDemo({ notify: false, showPanel: false });
    updateFeatureStatusOverview();
    updateMiniHudData();
    syncSidebarKeybindLink();
    updateProfileUnsavedIndicator();
}

function exportWorkspaceSync() {
    if (!isRoleAllowed('workspace')) {
        showNotification('Workspace export is blocked for this profile role.');
        return;
    }
    const storageSnapshot = captureLocalStorageSnapshot();
    const summary = captureWorkspaceSummaryFromStorageSnapshot(storageSnapshot);
    const payload = {
        type: 'nexus-workspace-sync',
        version: 1,
        exportedAt: new Date().toISOString(),
        storage: storageSnapshot
    };
    if (workspaceToolsRuntimeEnabled) {
        payload.meta = {
            plugin: 'workspace-tools',
            summary
        };
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexus-workspace-sync.json';
    anchor.click();
    URL.revokeObjectURL(url);
    const stamp = workspaceToolsRuntimeEnabled
        ? `Workspace exported at ${new Date().toLocaleTimeString()} | ${formatWorkspaceSummary(summary)}`
        : `Workspace exported at ${new Date().toLocaleTimeString()}`;
    setWorkspaceSyncStatus(stamp, true);
    showNotification('Workspace sync exported.');
}

function importWorkspaceSync(file) {
    if (!isRoleAllowed('workspace')) {
        showNotification('Workspace import is blocked for this profile role.');
        return;
    }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(String(reader.result || '{}'));
            const storage = parsed && typeof parsed === 'object' && parsed.storage && typeof parsed.storage === 'object'
                ? parsed.storage
                : parsed;
            if (!storage || typeof storage !== 'object' || Array.isArray(storage)) {
                throw new Error('Invalid workspace payload');
            }

            const previousStorage = captureLocalStorageSnapshot();
            const importedSummary = captureWorkspaceSummaryFromStorageSnapshot(storage);
            const backupPayload = workspaceToolsRuntimeEnabled
                ? {
                    createdAt: new Date().toISOString(),
                    summary: captureWorkspaceSummaryFromStorageSnapshot(previousStorage),
                    storage: previousStorage
                }
                : null;
            localStorage.clear();
            Object.keys(storage).forEach(key => {
                if (typeof key !== 'string') return;
                const value = storage[key];
                localStorage.setItem(key, value === null || value === undefined ? '' : String(value));
            });
            if (backupPayload) {
                localStorage.setItem(STORAGE_KEYS.WORKSPACE_SYNC_BACKUP, JSON.stringify(backupPayload));
            }
            refreshWorkspaceStateFromStorage();

            const stamp = workspaceToolsRuntimeEnabled
                ? `Workspace imported at ${new Date().toLocaleTimeString()} | ${formatWorkspaceSummary(importedSummary)} | backup ready`
                : `Workspace imported at ${new Date().toLocaleTimeString()}`;
            setWorkspaceSyncStatus(stamp, true);
            showNotification('Workspace sync imported.');
            recordRecentChange('Workspace sync imported', () => {
                restoreLocalStorageSnapshot(previousStorage);
                refreshWorkspaceStateFromStorage();
                setWorkspaceSyncStatus('Workspace import undone.', true);
            });
        } catch (error) {
            showNotification('Invalid workspace sync JSON.');
        }
    };
    reader.readAsText(file);
}

function initializeDebugDashboard() {
    const createPluginBtn = document.getElementById('createDebugPluginBtn');
    const pluginNameInput = document.getElementById('debugPluginNameInput');
    const pluginVersionInput = document.getElementById('debugPluginVersionInput');
    const pluginAuthorInput = document.getElementById('debugPluginAuthorInput');
    const pluginSourceInput = document.getElementById('debugPluginSourceInput');
    const openMarketplaceBtn = document.getElementById('openMarketplaceBtn');
    const closeMarketplaceBtn = document.getElementById('closeMarketplaceBtn');
    const marketplaceSearchInput = document.getElementById('marketplaceSearchInput');
    const marketplaceCategoryFilter = document.getElementById('marketplaceCategoryFilter');
    const marketplaceStatusFilter = document.getElementById('marketplaceStatusFilter');
    const marketplaceSortSelect = document.getElementById('marketplaceSortSelect');
    const importPluginPackageBtn = document.getElementById('importPluginPackageBtn');
    const importPluginPackageFile = document.getElementById('importPluginPackageFile');
    const exportPluginPackageBtn = document.getElementById('exportPluginPackageBtn');
    const pluginConfigModal = document.getElementById('pluginConfigModal');
    const closePluginConfigModalBtn = document.getElementById('closePluginConfigModalBtn');
    const openPluginGuideBtn = document.getElementById('openPluginGuideBtn');
    const pluginGuideModal = document.getElementById('pluginGuideModal');
    const closePluginGuideModalBtn = document.getElementById('closePluginGuideModalBtn');
    const exportWorkspaceBtn = document.getElementById('exportWorkspaceSyncBtn');
    const importWorkspaceBtn = document.getElementById('importWorkspaceSyncBtn');
    const importWorkspaceFile = document.getElementById('importWorkspaceSyncFile');
    const workspaceImportConfirmModal = document.getElementById('workspaceImportConfirmModal');
    const closeWorkspaceImportConfirmModalBtn = document.getElementById('closeWorkspaceImportConfirmModal');
    const cancelWorkspaceImportBtn = document.getElementById('cancelWorkspaceImportBtn');
    const confirmWorkspaceImportBtn = document.getElementById('confirmWorkspaceImportBtn');
    const resetWorkspaceBtn = document.getElementById('resetWorkspaceSyncBtn');
    const workspaceResetConfirmModal = document.getElementById('workspaceResetConfirmModal');
    const closeWorkspaceResetConfirmModalBtn = document.getElementById('closeWorkspaceResetConfirmModal');
    const cancelWorkspaceResetBtn = document.getElementById('cancelWorkspaceResetBtn');
    const confirmWorkspaceResetBtn = document.getElementById('confirmWorkspaceResetBtn');

    if (createPluginBtn) {
        createPluginBtn.addEventListener('click', createDebugPlugin);
    }
    [pluginNameInput, pluginVersionInput, pluginAuthorInput, pluginSourceInput].forEach(input => {
        if (!input) return;
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                createDebugPlugin();
            }
        });
    });
    if (exportPluginPackageBtn) {
        exportPluginPackageBtn.addEventListener('click', exportPluginPackages);
    }
    if (openMarketplaceBtn) {
        openMarketplaceBtn.addEventListener('click', () => {
            openPluginMarketplace();
        });
    }
    if (closeMarketplaceBtn) {
        closeMarketplaceBtn.addEventListener('click', () => {
            closePluginMarketplace();
        });
    }
    [marketplaceSearchInput, marketplaceCategoryFilter, marketplaceStatusFilter, marketplaceSortSelect].forEach(control => {
        if (!control) return;
        const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
        control.addEventListener(eventName, () => renderMarketplaceList());
    });
    if (importPluginPackageBtn && importPluginPackageFile) {
        importPluginPackageBtn.addEventListener('click', () => importPluginPackageFile.click());
    }
    if (importPluginPackageFile) {
        importPluginPackageFile.addEventListener('change', event => {
            importPluginPackages(event.target.files?.[0]);
            importPluginPackageFile.value = '';
        });
    }
    if (closePluginConfigModalBtn) {
        closePluginConfigModalBtn.addEventListener('click', closePluginConfigModal);
    }
    if (pluginConfigModal) {
        pluginConfigModal.addEventListener('click', event => {
            if (event.target === pluginConfigModal) {
                closePluginConfigModal();
            }
        });
    }
    if (openPluginGuideBtn) {
        openPluginGuideBtn.addEventListener('click', openPluginGuideModal);
    }
    if (closePluginGuideModalBtn) {
        closePluginGuideModalBtn.addEventListener('click', closePluginGuideModal);
    }
    if (pluginGuideModal) {
        pluginGuideModal.addEventListener('click', event => {
            if (event.target === pluginGuideModal) {
                closePluginGuideModal();
            }
        });
    }
    if (!pluginSelectionListenerBound) {
        document.addEventListener('click', handlePluginTargetSelectionClick, true);
        pluginSelectionListenerBound = true;
    }

    if (exportWorkspaceBtn) {
        exportWorkspaceBtn.addEventListener('click', exportWorkspaceSync);
    }
    if (importWorkspaceBtn && importWorkspaceFile) {
        importWorkspaceBtn.addEventListener('click', () => openWorkspaceImportConfirmModal());
    }
    if (resetWorkspaceBtn) {
        resetWorkspaceBtn.addEventListener('click', () => openWorkspaceResetConfirmModal());
    }
    if (closeWorkspaceImportConfirmModalBtn) {
        closeWorkspaceImportConfirmModalBtn.addEventListener('click', closeWorkspaceImportConfirmModal);
    }
    if (cancelWorkspaceImportBtn) {
        cancelWorkspaceImportBtn.addEventListener('click', closeWorkspaceImportConfirmModal);
    }
    if (confirmWorkspaceImportBtn && importWorkspaceFile) {
        confirmWorkspaceImportBtn.addEventListener('click', () => {
            closeWorkspaceImportConfirmModal();
            importWorkspaceFile.click();
        });
    }
    if (workspaceImportConfirmModal) {
        workspaceImportConfirmModal.addEventListener('click', event => {
            if (event.target === workspaceImportConfirmModal) {
                closeWorkspaceImportConfirmModal();
            }
        });
    }
    if (closeWorkspaceResetConfirmModalBtn) {
        closeWorkspaceResetConfirmModalBtn.addEventListener('click', closeWorkspaceResetConfirmModal);
    }
    if (cancelWorkspaceResetBtn) {
        cancelWorkspaceResetBtn.addEventListener('click', closeWorkspaceResetConfirmModal);
    }
    if (confirmWorkspaceResetBtn) {
        confirmWorkspaceResetBtn.addEventListener('click', () => {
            closeWorkspaceResetConfirmModal();
            resetWorkspaceSyncToDefault();
        });
    }
    if (workspaceResetConfirmModal) {
        workspaceResetConfirmModal.addEventListener('click', event => {
            if (event.target === workspaceResetConfirmModal) {
                closeWorkspaceResetConfirmModal();
            }
        });
    }
    if (importWorkspaceFile) {
        importWorkspaceFile.addEventListener('change', event => {
            importWorkspaceSync(event.target.files?.[0]);
            importWorkspaceFile.value = '';
        });
    }

    loadPluginsFromStorage();
    renderPluginsList();
    renderMarketplaceList();
    setWorkspaceSyncStatus(localStorage.getItem(STORAGE_KEYS.WORKSPACE_SYNC_LAST) || 'No workspace sync action yet.', false);
    setActiveDebugMetric(hackDemoState.activeMetric);
}

function setMiniHudVisibility(visible) {
    const hud = getMiniHudElement();
    if (!hud) return;

    const enabled = Boolean(visible);
    hud.classList.toggle('hidden', !enabled);
    hud.setAttribute('aria-hidden', String(!enabled));
    updateMiniHudToggleButton(enabled, false);
    localStorage.setItem(STORAGE_KEYS.MINI_HUD_VISIBLE, String(enabled));
}

function restoreMiniHudFromPip(forceHide = false) {
    let hud = null;
    if (miniHudPipWindow) {
        try {
            hud = miniHudPipWindow.document.getElementById('miniHud');
        } catch (error) {
            hud = null;
        }
    }
    if (!hud) hud = document.getElementById('miniHud');
    if (!hud) hud = miniHudElementRef;
    if (!hud) return;
    miniHudElementRef = hud;

    if (miniHudPlaceholder && miniHudPlaceholder.parentNode) {
        miniHudPlaceholder.parentNode.insertBefore(hud, miniHudPlaceholder);
        miniHudPlaceholder.parentNode.removeChild(miniHudPlaceholder);
    } else {
        document.body.appendChild(hud);
    }

    hud.style.width = '';
    hud.style.height = '';
    hud.style.borderRadius = '';
    hud.style.border = '';
    hud.style.left = '';
    hud.style.top = '';
    hud.style.right = '';
    hud.style.bottom = '';

    miniHudPipWindow = null;
    if (forceHide) {
        setMiniHudVisibility(false);
    } else {
        updateMiniHudToggleButton(!hud.classList.contains('hidden'), false);
    }
}

async function openMiniHudInPictureInPicture() {
    if (!isDocumentPipSupported()) return false;
    if (isMiniHudPipOpen()) return true;

    const hud = document.getElementById('miniHud');
    if (!hud) return false;
    miniHudElementRef = hud;

    try {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 320,
            height: 260
        });
        miniHudPipWindow = pipWindow;

        const pipDoc = pipWindow.document;
        pipDoc.head.innerHTML = '';
        const cssLink = document.querySelector('link[rel="stylesheet"]');
        if (cssLink) {
            const link = pipDoc.createElement('link');
            link.rel = 'stylesheet';
            link.href = new URL(cssLink.getAttribute('href'), window.location.href).href;
            pipDoc.head.appendChild(link);
        }
        const sourceRootStyles = getComputedStyle(document.documentElement);
        for (let i = 0; i < sourceRootStyles.length; i++) {
            const key = sourceRootStyles[i];
            if (key.startsWith('--')) {
                pipDoc.documentElement.style.setProperty(key, sourceRootStyles.getPropertyValue(key));
            }
        }
        pipDoc.body.className = document.body.className;
        pipDoc.body.style.margin = '0';
        pipDoc.body.style.background = '#000000';
        syncMiniHudPipStyles();

        miniHudPlaceholder = document.createComment('mini-hud-placeholder');
        if (hud.parentNode) {
            hud.parentNode.insertBefore(miniHudPlaceholder, hud);
        }
        pipDoc.body.appendChild(hud);
        hud.classList.remove('hidden');
        hud.setAttribute('aria-hidden', 'false');
        hud.style.left = '0px';
        hud.style.top = '0px';
        hud.style.right = 'auto';
        hud.style.bottom = 'auto';
        hud.style.width = '100%';
        hud.style.height = '100%';
        hud.style.borderRadius = '0';
        hud.style.border = 'none';

        const handlePipClose = () => restoreMiniHudFromPip(true);
        pipWindow.addEventListener('pagehide', handlePipClose, { once: true });
        pipWindow.addEventListener('unload', handlePipClose, { once: true });
        pipWindow.addEventListener('beforeunload', handlePipClose, { once: true });

        updateMiniHudToggleButton(true, true);
        localStorage.setItem(STORAGE_KEYS.MINI_HUD_VISIBLE, 'true');
        updateMiniHudData();
        updateSessionTimerDisplays();
        return true;
    } catch (error) {
        return false;
    }
}

function closeMiniHudPictureInPicture() {
    if (!isMiniHudPipOpen()) return;
    try {
        miniHudPipWindow.close();
        setTimeout(() => {
            if (!document.getElementById('miniHud')) {
                restoreMiniHudFromPip(true);
            }
        }, 40);
    } catch (error) {
        restoreMiniHudFromPip(true);
    }
}

async function toggleMiniHudOutput(forceEnabled = null) {
    const hud = getMiniHudElement();
    if (!hud) return;

    const currentlyEnabled = isMiniHudPipOpen() || !hud.classList.contains('hidden');
    const shouldEnable = forceEnabled === null ? !currentlyEnabled : Boolean(forceEnabled);

    if (!shouldEnable) {
        if (isMiniHudPipOpen()) {
            closeMiniHudPictureInPicture();
        } else {
            setMiniHudVisibility(false);
        }
        return;
    }

    if (isDocumentPipSupported()) {
        const opened = await openMiniHudInPictureInPicture();
        if (opened) return;
        setMiniHudVisibility(true);
        showNotification('Could not open true PiP window. Using in-page HUD.');
        return;
    }

    setMiniHudVisibility(true);
    showNotification('True browser PiP is not supported here. Using in-page HUD.');
}

function setupMiniHud() {
    const hud = document.getElementById('miniHud');
    const header = document.getElementById('miniHudHeader');
    const minBtn = document.getElementById('miniHudMinimizeBtn');
    const toggleBtn = document.getElementById('toggleMiniHudBtn');
    if (!hud || !header || !minBtn || !toggleBtn) return;
    miniHudElementRef = hud;

    const savedMinimized = localStorage.getItem(STORAGE_KEYS.MINI_HUD_MINIMIZED) === 'true';
    const savedPosRaw = localStorage.getItem(STORAGE_KEYS.MINI_HUD_POSITION);

    if (savedPosRaw) {
        try {
            const pos = JSON.parse(savedPosRaw);
            if (Number.isFinite(pos.left) && Number.isFinite(pos.top)) {
                hud.style.left = `${pos.left}px`;
                hud.style.top = `${pos.top}px`;
                hud.style.right = 'auto';
                hud.style.bottom = 'auto';
            }
        } catch (error) {
            // ignore invalid position
        }
    }

    hud.classList.toggle('minimized', savedMinimized);
    setMiniHudVisibility(false);
    localStorage.setItem(STORAGE_KEYS.MINI_HUD_VISIBLE, 'false');
    updateMiniHudData();
    updateSessionTimerDisplays();

    toggleBtn.addEventListener('click', async () => {
        await toggleMiniHudOutput();
    });

    minBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const minimized = !hud.classList.contains('minimized');
        hud.classList.toggle('minimized', minimized);
        localStorage.setItem(STORAGE_KEYS.MINI_HUD_MINIMIZED, String(minimized));
    });

    header.addEventListener('mousedown', (event) => {
        if (isMiniHudPipOpen()) return;
        if (event.button !== 0) return;
        if (event.target === minBtn || event.target.closest('#miniHudMinimizeBtn')) return;
        const rect = hud.getBoundingClientRect();
        miniHudDragState.active = true;
        miniHudDragState.offsetX = event.clientX - rect.left;
        miniHudDragState.offsetY = event.clientY - rect.top;
    });

    document.addEventListener('mousemove', (event) => {
        if (!miniHudDragState.active) return;
        const maxLeft = Math.max(0, window.innerWidth - hud.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - hud.offsetHeight);
        const left = Math.max(0, Math.min(maxLeft, event.clientX - miniHudDragState.offsetX));
        const top = Math.max(0, Math.min(maxTop, event.clientY - miniHudDragState.offsetY));
        hud.style.left = `${left}px`;
        hud.style.top = `${top}px`;
        hud.style.right = 'auto';
        hud.style.bottom = 'auto';
        hud.style.width = '';
        hud.style.height = '';
        hud.style.borderRadius = '';
        hud.style.border = '';
    });

    document.addEventListener('mouseup', () => {
        if (!miniHudDragState.active) return;
        miniHudDragState.active = false;
        const left = parseFloat(hud.style.left);
        const top = parseFloat(hud.style.top);
        if (Number.isFinite(left) && Number.isFinite(top)) {
            localStorage.setItem(STORAGE_KEYS.MINI_HUD_POSITION, JSON.stringify({ left, top }));
        }
    });
}

function showFeatureStatusChip(toggleInput, enabled) {
    const card = toggleInput.closest('.feature-card');
    const header = card?.querySelector('.feature-header');
    if (!card || !header) return;

    let chip = header.querySelector('.feature-status-chip');
    if (!chip) {
        chip = document.createElement('span');
        chip.className = 'feature-status-chip';
        header.appendChild(chip);
    }

    chip.textContent = enabled ? 'Enabled' : 'Disabled';
    chip.classList.remove('on', 'off', 'show');
    chip.classList.add(enabled ? 'on' : 'off');
    void chip.offsetWidth;
    chip.classList.add('show');
    if (chip._hideTimerId) {
        clearTimeout(chip._hideTimerId);
    }
    chip._hideTimerId = setTimeout(() => {
        chip.classList.remove('show');
        chip._hideTimerId = null;
    }, 1150);
}

function setupFeatureStatusChips() {
    document.addEventListener('change', (event) => {
        const toggle = event.target.closest('.toggle-input[data-feature]');
        if (!toggle) return;
        const feature = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        if (!feature || feature === 'null' || feature === 'undefined') return;
        showFeatureStatusChip(toggle, toggle.checked);
        updateMiniHudData();
    }, true);
}

function updateMultiSelectUi() {
    const toolbar = document.getElementById('multiSelectToolbar');
    const toggleBtn = document.getElementById('toggleMultiSelectBtn');
    const countEl = document.getElementById('multiSelectCount');
    const enableBtn = document.getElementById('enableSelectedBtn');
    const disableBtn = document.getElementById('disableSelectedBtn');
    const favoriteBtn = document.getElementById('favoriteSelectedBtn');
    const clearBtn = document.getElementById('clearSelectedBtn');

    if (toolbar) {
        toolbar.classList.toggle('multi-mode-active', multiSelectMode);
    }

    if (toggleBtn) {
        toggleBtn.textContent = multiSelectMode ? 'MULTI-SELECT ON' : 'MULTI-SELECT OFF';
    }
    if (countEl) {
        countEl.textContent = `${selectedFeatures.size} selected`;
    }

    const hasSelection = selectedFeatures.size > 0;
    [enableBtn, disableBtn, favoriteBtn, clearBtn].forEach(btn => {
        if (btn) btn.disabled = !multiSelectMode || !hasSelection;
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        const feature = getFeatureFromCard(card);
        const active = feature && selectedFeatures.has(feature);
        card.classList.toggle('multi-select-mode', multiSelectMode);
        card.classList.toggle('multi-selected', Boolean(active));
    });
}

function setMultiSelectMode(enabled) {
    multiSelectMode = Boolean(enabled);
    if (!multiSelectMode) {
        selectedFeatures = new Set();
    }
    updateMultiSelectUi();
    refreshDragState();
}

function toggleCardSelection(feature, force = null) {
    if (!feature) return;
    const shouldSelect = force === null ? !selectedFeatures.has(feature) : Boolean(force);
    if (shouldSelect) {
        selectedFeatures.add(feature);
    } else {
        selectedFeatures.delete(feature);
    }
    updateMultiSelectUi();
}

function applySelectedFeatureState(enabled) {
    if (!selectedFeatures.size) return;
    let changed = 0;
    selectedFeatures.forEach(feature => {
        const toggle = document.querySelector(`.toggle-input[data-feature="${feature}"]`);
        if (!toggle) return;
        if (toggle.checked !== enabled) {
            toggle.checked = enabled;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
            changed += 1;
        }
    });
    if (changed > 0) {
        showNotification(`${enabled ? 'Enabled' : 'Disabled'} ${changed} selected hack${changed === 1 ? '' : 's'}.`);
    }
}

function syncHackFavoriteStars() {
    const favorites = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
    document.querySelectorAll('.feature-card').forEach(card => {
        const name = card.querySelector('h3')?.textContent?.trim();
        const star = card.querySelector('.feature-header .favorite-star');
        if (!name || !star) return;
        const active = favorites.includes(name);
        star.classList.toggle('active', active);
        star.textContent = active ? '\u2605' : '\u2606';
    });
}

function favoriteSelectedFeatures() {
    if (!selectedFeatures.size) return;
    let favorites = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
    const before = [...favorites];
    selectedFeatures.forEach(feature => {
        const toggle = document.querySelector(`.toggle-input[data-feature="${feature}"]`);
        const name = toggle?.closest('.feature-card')?.querySelector('h3')?.textContent?.trim();
        if (!name) return;
        if (!favorites.includes(name)) favorites.unshift(name);
    });
    favorites = Array.from(new Set(favorites));
    localStorage.setItem('nexus-favorites', JSON.stringify(favorites));
    syncHackFavoriteStars();
    setupQuickToggle();
    showNotification('Selected hacks added to favorites.');
    recordRecentChange('Added selected hacks to favorites', () => {
        localStorage.setItem('nexus-favorites', JSON.stringify(before));
        syncHackFavoriteStars();
        setupQuickToggle();
    });
}

function setupMultiSelectMode() {
    const toolbar = document.getElementById('multiSelectToolbar');
    const toggleBtn = document.getElementById('toggleMultiSelectBtn');
    const enableBtn = document.getElementById('enableSelectedBtn');
    const disableBtn = document.getElementById('disableSelectedBtn');
    const favoriteBtn = document.getElementById('favoriteSelectedBtn');
    const clearBtn = document.getElementById('clearSelectedBtn');
    if (!toolbar || !toggleBtn || !enableBtn || !disableBtn || !favoriteBtn || !clearBtn) return;

    toggleBtn.addEventListener('click', () => setMultiSelectMode(!multiSelectMode));
    enableBtn.addEventListener('click', () => applySelectedFeatureState(true));
    disableBtn.addEventListener('click', () => applySelectedFeatureState(false));
    favoriteBtn.addEventListener('click', favoriteSelectedFeatures);
    clearBtn.addEventListener('click', () => {
        selectedFeatures = new Set();
        updateMultiSelectUi();
    });

    document.addEventListener('click', (event) => {
        if (!multiSelectMode) return;
        if (event.target.closest('#radialMenu')) return;
        const card = event.target.closest('.feature-card');
        if (!card) return;
        if (event.target.closest('button, input, select, label, .favorite-star, .toggle-switch')) return;

        const feature = getFeatureFromCard(card);
        if (!feature) return;
        event.preventDefault();
        toggleCardSelection(feature);
    });

    updateMultiSelectUi();
}

function openRadialMenu(card, clientX, clientY) {
    const menu = document.getElementById('radialMenu');
    if (!menu || !card) return;
    radialMenuTargetCard = card;

    const margin = 95;
    const left = Math.max(margin, Math.min(window.innerWidth - margin, clientX));
    const top = Math.max(margin, Math.min(window.innerHeight - margin, clientY));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
}

function closeRadialMenu() {
    const menu = document.getElementById('radialMenu');
    if (!menu) return;
    menu.classList.remove('active');
    menu.setAttribute('aria-hidden', 'true');
    radialMenuTargetCard = null;
}

function resetFeatureCardToDefaults(card) {
    if (!card) return false;
    let changed = false;
    const controls = card.querySelectorAll('input, select, textarea');

    controls.forEach(control => {
        const tag = control.tagName.toLowerCase();

        if (tag === 'input') {
            const type = (control.type || '').toLowerCase();
            if (type === 'checkbox' || type === 'radio') {
                const nextChecked = Boolean(control.defaultChecked);
                if (control.checked !== nextChecked) {
                    control.checked = nextChecked;
                    changed = true;
                }
                control.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }

            const nextValue = control.defaultValue;
            if (control.value !== nextValue) {
                control.value = nextValue;
                changed = true;
            }
            control.dispatchEvent(new Event('input', { bubbles: true }));
            control.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        if (tag === 'select') {
            let defaultIndex = Array.from(control.options).findIndex(option => option.defaultSelected);
            if (defaultIndex < 0) defaultIndex = 0;
            if (control.selectedIndex !== defaultIndex) {
                control.selectedIndex = defaultIndex;
                changed = true;
            }
            control.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        if (tag === 'textarea') {
            const nextValue = control.defaultValue;
            if (control.value !== nextValue) {
                control.value = nextValue;
                changed = true;
            }
            control.dispatchEvent(new Event('input', { bubbles: true }));
            control.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    return changed;
}

function handleRadialMenuAction(action) {
    const card = radialMenuTargetCard;
    const feature = getFeatureFromCard(card);
    if (!card || !feature) {
        closeRadialMenu();
        return;
    }

    if (action === 'toggle') {
        const toggle = card.querySelector(`.toggle-input[data-feature="${feature}"]`);
        if (toggle) {
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else if (action === 'favorite') {
        const name = card.querySelector('h3')?.textContent?.trim();
        if (name) {
            let favorites = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
            if (favorites.includes(name)) {
                favorites = favorites.filter(item => item !== name);
            } else {
                favorites.unshift(name);
            }
            localStorage.setItem('nexus-favorites', JSON.stringify(favorites));
            syncHackFavoriteStars();
            setupQuickToggle();
        }
    } else if (action === 'select') {
        if (!multiSelectMode) {
            setMultiSelectMode(true);
        }
        toggleCardSelection(feature);
    } else if (action === 'reset-card') {
        const label = card.querySelector('h3')?.textContent?.trim() || 'This';
        const changed = resetFeatureCardToDefaults(card);
        showNotification(changed ? `${label} reset to default.` : `${label} is already at default.`);
    }

    closeRadialMenu();
}

function setupRadialMenu() {
    const menu = document.getElementById('radialMenu');
    if (!menu) return;

    menu.querySelectorAll('.radial-btn[data-radial-action]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const action = btn.getAttribute('data-radial-action') || '';
            handleRadialMenuAction(action);
        });
    });

    document.addEventListener('contextmenu', (event) => {
        const card = event.target.closest('.feature-card');
        if (!card) return;
        const feature = getFeatureFromCard(card);
        if (!feature) return;
        event.preventDefault();
        openRadialMenu(card, event.clientX, event.clientY);
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('active')) return;
        if (!event.target.closest('#radialMenu')) {
            closeRadialMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('active')) {
            closeRadialMenu();
        }
    });

    window.addEventListener('resize', closeRadialMenu);
    window.addEventListener('scroll', closeRadialMenu, true);
}

function initializeSessionTimer() {
    sessionStartTimestamp = Date.now();
    updateSessionTimerDisplays();
    if (sessionTimerIntervalId) {
        clearInterval(sessionTimerIntervalId);
    }
    sessionTimerIntervalId = setInterval(() => {
        updateSessionTimerDisplays();
    }, 1000);
}

function getWelcomeSplashName() {
    const currentUser = getCurrentAuthUser();
    if (!currentUser) return 'GAST';
    const displayName = String(currentUser.username || currentUser.email || 'GAST').trim();
    return displayName || 'GAST';
}

function clearWelcomeSplashDismissHandlers() {
    if (typeof welcomeSplashState.cleanupHandlers === 'function') {
        welcomeSplashState.cleanupHandlers();
    }
    welcomeSplashState.cleanupHandlers = null;
}

function clearWelcomeSplashDismissTimer() {
    if (welcomeSplashState.dismissTimerId) {
        clearTimeout(welcomeSplashState.dismissTimerId);
        welcomeSplashState.dismissTimerId = null;
    }
}

function dismissWelcomeSplash() {
    const splash = document.getElementById('welcomeSplash');
    if (!splash || splash.getAttribute('aria-hidden') === 'true') return;

    clearWelcomeSplashDismissTimer();
    clearWelcomeSplashDismissHandlers();
    splash.classList.add('is-dismissing');

    setTimeout(() => {
        splash.classList.remove('is-visible', 'is-dismissing');
        splash.style.display = 'none';
        splash.setAttribute('aria-hidden', 'true');
    }, 400);
}

function showWelcomeSplashAfterBoot() {
    if (!getSavedWelcomeSplashEnabled() || welcomeSplashState.hasShown) return;

    const splash = document.getElementById('welcomeSplash');
    const username = document.getElementById('welcomeUsername');
    if (!splash || !username) return;

    welcomeSplashState.hasShown = true;
    username.textContent = getWelcomeSplashName();
    splash.style.display = 'flex';
    splash.setAttribute('aria-hidden', 'false');
    splash.classList.remove('is-dismissing');

    requestAnimationFrame(() => {
        splash.classList.add('is-visible');
    });

    const dismissOnInteraction = () => {
        dismissWelcomeSplash();
    };
    const bindTimerId = setTimeout(() => {
        document.addEventListener('click', dismissOnInteraction, true);
        document.addEventListener('keydown', dismissOnInteraction, true);
    }, 80);
    welcomeSplashState.cleanupHandlers = () => {
        clearTimeout(bindTimerId);
        document.removeEventListener('click', dismissOnInteraction, true);
        document.removeEventListener('keydown', dismissOnInteraction, true);
    };
    clearWelcomeSplashDismissTimer();
    welcomeSplashState.dismissTimerId = setTimeout(() => {
        dismissWelcomeSplash();
    }, 2200);
}

function startBootSequence() {
    const bootScreen = document.getElementById('bootScreen');
    const bootFill = document.getElementById('bootProgressFill');
    const bootSubtitle = document.getElementById('bootSubtitle');
    const bootContinueBtn = document.getElementById('bootContinueBtn');
    if (!bootScreen || !bootFill) return;

    const introDurationMs = 1650;
    document.body.classList.add('booting');
    bootScreen.classList.remove('hidden', 'ready');
    bootScreen.classList.add('boot-intro');
    bootScreen.setAttribute('aria-hidden', 'false');
    bootFill.style.width = '0%';
    if (bootSubtitle) {
        bootSubtitle.textContent = 'Preparing startup sequence...';
    }
    if (bootContinueBtn) {
        bootContinueBtn.blur();
    }
    const steps = [14, 31, 49, 66, 80, 92, 100];
    let index = 0;

    const finishBoot = () => {
        bootScreen.classList.add('hidden');
        bootScreen.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('booting');
        applyStartupPageSelection();
        setTimeout(() => {
            showWelcomeSplashAfterBoot();
        }, 390);
        setTimeout(() => {
            if (bootScreen.parentNode) bootScreen.parentNode.removeChild(bootScreen);
        }, 380);
    };

    setTimeout(() => {
        bootScreen.classList.remove('boot-intro');
        if (bootSubtitle) {
            bootSubtitle.textContent = 'Initializing modules...';
        }

        const runBootStep = () => {
            const stepValue = steps[index];
            bootFill.style.width = `${stepValue}%`;
            index += 1;

            if (index >= steps.length) {
                setTimeout(() => {
                    const requiresPowerConfirm = getSavedBootPowerConfirm();
                    if (requiresPowerConfirm && bootContinueBtn) {
                        if (bootSubtitle) {
                            bootSubtitle.textContent = 'System ready. Press the power button to continue.';
                        }
                        bootScreen.classList.add('ready');
                        bootContinueBtn.addEventListener('click', finishBoot, { once: true });
                    } else {
                        finishBoot();
                    }
                }, 220);
                return;
            }

            const isEarlyPause = stepValue > 0 && stepValue < 25;
            const isThreeQuarterPause = stepValue >= 75 && stepValue < 90;
            const nextDelay = isEarlyPause ? 420 : (isThreeQuarterPause ? 760 : 120);
            setTimeout(runBootStep, nextDelay);
        };

        runBootStep();
    }, introDurationMs);
}

function setupButtonClickSounds() {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button || !soundSettings.enabled) return;
        if (button.hasAttribute('data-no-auto-sound')) return;
        playButtonClickSound(soundSettings.type);
    }, { capture: true });
}

function getSavedButtonSoundEnabled() {
    return localStorage.getItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED) === 'true';
}

function getSavedButtonSoundType() {
    const savedType = localStorage.getItem(STORAGE_KEYS.BUTTON_SOUND_TYPE) || 'nexus-soft';
    return BUTTON_SOUND_PRESETS[savedType] ? savedType : 'nexus-soft';
}

function clampVolumePercent(value, fallbackPercent) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallbackPercent;
    return Math.max(0, Math.min(100, parsed));
}

function parseNumberWithFallback(value, fallbackNumber) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallbackNumber;
}

function getSavedFocusMode() {
    return localStorage.getItem(STORAGE_KEYS.FOCUS_MODE) === 'true';
}

function setFocusMode(enabled) {
    const value = Boolean(enabled);
    document.body.classList.toggle('focus-mode', value);
    localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, String(value));
}

function getSavedSafetyLockMode() {
    return localStorage.getItem(STORAGE_KEYS.SAFETY_LOCK_MODE) === 'true';
}

function normalizeSafetyLockHoldMs(value) {
    const parsed = Math.round(parseNumberWithFallback(value, SAFETY_HOLD_MS_DEFAULT));
    return Math.max(SAFETY_HOLD_MS_MIN, Math.min(SAFETY_HOLD_MS_MAX, parsed));
}

function getSavedSafetyLockHoldMs() {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS);
    if (raw === null || String(raw).trim() === '') {
        return SAFETY_HOLD_MS_DEFAULT;
    }
    return normalizeSafetyLockHoldMs(raw);
}

function setSafetyLockHoldMs(value, { persist = false } = {}) {
    const normalized = normalizeSafetyLockHoldMs(value);
    safetyHoldDurationMs = normalized;
    if (persist) {
        localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS, String(normalized));
    }
    return normalized;
}

function getSafetyLockHoldMs() {
    return normalizeSafetyLockHoldMs(safetyHoldDurationMs);
}

function formatSafetyLockHoldLabel(valueMs) {
    const seconds = normalizeSafetyLockHoldMs(valueMs) / 1000;
    return `${seconds.toFixed(1)}s`;
}

function setSafetyLockMode(enabled) {
    const value = Boolean(enabled);
    document.body.classList.toggle('safety-lock-enabled', value);
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_MODE, String(value));
}

function isSafetyLockEnabled() {
    return getSavedSafetyLockMode();
}

function isDangerousActionButton(button) {
    if (!button) return false;
    if (button.getAttribute('data-safety-lock') === 'required') return true;

    const id = String(button.id || '').trim();
    if (id === 'resetSettings' || id === 'confirmResetBtn' || id === 'clearRecentChangesBtn') {
        return true;
    }

    const label = String(button.textContent || '').trim().toUpperCase();
    return label === 'RESET TO DEFAULT'
        || label === 'DELETE'
        || label === 'I AM SURE'
        || label === 'CLEAR ACTIVITY';
}

function stopSafetyHoldVisual(button, { keepStart = false } = {}) {
    if (!button) return;
    const rafId = safetyHoldAnimationIdMap.get(button);
    if (Number.isFinite(rafId)) {
        cancelAnimationFrame(rafId);
    }
    safetyHoldAnimationIdMap.delete(button);
    button.classList.remove('safety-hold-armed');
    button.classList.remove('safety-hold-ready');
    button.style.setProperty('--safety-hold-progress', '0%');
    button.removeAttribute('data-safety-hold-label');
    if (!keepStart) {
        safetyHoldStartedAtMap.delete(button);
    }
    if (activeSafetyHoldButton === button) {
        activeSafetyHoldButton = null;
    }
}

function startSafetyHoldVisual(button) {
    if (!button) return;
    stopSafetyHoldVisual(button, { keepStart: true });
    activeSafetyHoldButton = button;
    button.classList.add('safety-hold-armed');
    button.setAttribute('data-safety-hold-label', `HOLD ${formatSafetyLockHoldLabel(getSafetyLockHoldMs())}`);

    const updateProgress = () => {
        if (activeSafetyHoldButton !== button) return;
        const startedAt = safetyHoldStartedAtMap.get(button);
        if (!Number.isFinite(startedAt)) return;

        const holdTargetMs = getSafetyLockHoldMs();
        const elapsedMs = Date.now() - startedAt;
        const progress = Math.max(0, Math.min(1, elapsedMs / holdTargetMs));
        const remainingMs = Math.max(0, holdTargetMs - elapsedMs);
        button.style.setProperty('--safety-hold-progress', `${Math.round(progress * 100)}%`);
        button.classList.toggle('safety-hold-ready', progress >= 1);
        button.setAttribute(
            'data-safety-hold-label',
            progress >= 1 ? 'RELEASE TO CONFIRM' : `HOLD ${formatSafetyLockHoldLabel(remainingMs)}`
        );

        const rafId = requestAnimationFrame(updateProgress);
        safetyHoldAnimationIdMap.set(button, rafId);
    };

    const rafId = requestAnimationFrame(updateProgress);
    safetyHoldAnimationIdMap.set(button, rafId);
}

function setupSafetyLockGuard() {
    document.addEventListener('pointerdown', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (!isSafetyLockEnabled() || !isDangerousActionButton(button)) return;

        safetyHoldStartedAtMap.set(button, Date.now());
        button.setAttribute('data-safety-lock', 'required');
        startSafetyHoldVisual(button);
    }, true);

    document.addEventListener('pointerup', (event) => {
        const activeButton = activeSafetyHoldButton;
        if (!activeButton) return;
        const releasedOnButton = event.target.closest('button');
        const keepStart = releasedOnButton === activeButton;
        stopSafetyHoldVisual(activeButton, { keepStart });
    }, true);

    document.addEventListener('pointercancel', () => {
        if (!activeSafetyHoldButton) return;
        stopSafetyHoldVisual(activeSafetyHoldButton, { keepStart: false });
    }, true);

    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (!isDangerousActionButton(button)) return;
        if (!isSafetyLockEnabled()) {
            stopSafetyHoldVisual(button, { keepStart: false });
            return;
        }

        const startedAt = safetyHoldStartedAtMap.get(button);
        const hasValidStart = Number.isFinite(startedAt) && startedAt > 0;
        const heldMs = hasValidStart ? (Date.now() - startedAt) : 0;
        stopSafetyHoldVisual(button, { keepStart: false });
        const holdTargetMs = getSafetyLockHoldMs();
        if (heldMs >= holdTargetMs) return;

        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        }

        button.classList.add('safety-hold-required');
        setTimeout(() => button.classList.remove('safety-hold-required'), 260);

        const now = Date.now();
        const lastHintAt = parseInt(button.getAttribute('data-safety-hint-at') || '0', 10);
        if (!Number.isFinite(lastHintAt) || now - lastHintAt > 900) {
            button.setAttribute('data-safety-hint-at', String(now));
            showNotification(`Hold for ${formatSafetyLockHoldLabel(holdTargetMs)} to confirm.`);
        }
    }, true);
}

function getSavedPerformanceMode() {
    return localStorage.getItem(STORAGE_KEYS.PERFORMANCE_MODE) === 'true';
}

function setPerformanceMode(enabled) {
    document.body.classList.toggle('performance-mode', Boolean(enabled));
    syncMiniHudPipStyles();
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_MODE, String(Boolean(enabled)));
    refreshDragState();
}

function getSavedUiLockMode() {
    return localStorage.getItem(STORAGE_KEYS.LOCK_UI_MODE) === 'true';
}

function setUiLockMode(enabled) {
    const value = Boolean(enabled);
    localStorage.setItem(STORAGE_KEYS.LOCK_UI_MODE, String(value));
    refreshDragState();
}

function isUiLockModeEnabled() {
    return getSavedUiLockMode();
}

function getFavoriteProfiles() {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_PROFILES) || '[]');
    return Array.isArray(raw) ? raw.map(x => String(x).trim()).filter(Boolean) : [];
}

function saveFavoriteProfiles(list) {
    const clean = Array.from(new Set((Array.isArray(list) ? list : []).map(x => String(x).trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.FAVORITE_PROFILES, JSON.stringify(clean));
}

function getFavoritePresetIds() {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_PRESETS) || '[]');
    return Array.isArray(raw) ? raw.map(x => String(x).trim()).filter(Boolean) : [];
}

function saveFavoritePresetIds(list) {
    const clean = Array.from(new Set((Array.isArray(list) ? list : []).map(x => String(x).trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.FAVORITE_PRESETS, JSON.stringify(clean));
}

function getCustomPresets() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS) || '{}');
        return raw && typeof raw === 'object' ? raw : {};
    } catch (error) {
        return {};
    }
}

function saveCustomPresets(presetsObj) {
    const clean = presetsObj && typeof presetsObj === 'object' ? presetsObj : {};
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(clean));
}

function recordRecentChange(label, undoFn) {
    if (suspendRecentTracking) return;

    const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        label: String(label || 'Change'),
        undo: typeof undoFn === 'function' ? undoFn : null
    };

    recentChanges.unshift(entry);
    if (recentChanges.length > 25) {
        recentChanges = recentChanges.slice(0, 25);
    }
    renderRecentChanges();
}

function renderRecentChanges() {
    const list = document.getElementById('recentChangesList');
    if (!list) return;

    list.innerHTML = '';
    if (!recentChanges.length) {
        const empty = document.createElement('div');
        empty.className = 'recent-change-empty';
        empty.textContent = 'No recent changes yet.';
        list.appendChild(empty);
        return;
    }

    recentChanges.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'recent-change-item';

        const text = document.createElement('div');
        text.className = 'recent-change-text';
        text.textContent = entry.label;

        const undoBtn = document.createElement('button');
        undoBtn.className = 'profile-item-btn';
        undoBtn.textContent = 'UNDO';
        undoBtn.disabled = !entry.undo;
        if (!entry.undo) {
            undoBtn.style.opacity = '0.6';
            undoBtn.style.cursor = 'default';
        } else {
            undoBtn.addEventListener('click', () => {
                try {
                    suspendRecentTracking = true;
                    entry.undo();
                } finally {
                    suspendRecentTracking = false;
                    recentChanges = recentChanges.filter(x => x.id !== entry.id);
                    renderRecentChanges();
                }
            });
        }

        item.appendChild(text);
        item.appendChild(undoBtn);
        list.appendChild(item);
    });
}

function setupRecentChangesControls() {
    const clearBtn = document.getElementById('clearRecentChangesBtn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
        if (!recentChanges.length) {
            showNotification('Recent activity is already empty.');
            return;
        }
        recentChanges = [];
        renderRecentChanges();
        showNotification('Recent activity cleared.');
    });
}

function getSavedButtonSoundVolume() {
    return clampVolumePercent(localStorage.getItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME), 65);
}

function setRuntimeSoundSettings(enabled, soundType, volumePercent = getSavedButtonSoundVolume()) {
    soundSettings.enabled = Boolean(enabled);
    soundSettings.type = BUTTON_SOUND_PRESETS[soundType] ? soundType : 'nexus-soft';
    soundSettings.volume = clampVolumePercent(volumePercent, 65) / 100;
}

function getSavedSwitchSoundEnabled() {
    return localStorage.getItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED) === 'true';
}

function getSavedSwitchSoundType() {
    const savedType = localStorage.getItem(STORAGE_KEYS.SWITCH_SOUND_TYPE) || 'clean-toggle';
    return FEATURE_SWITCH_SOUND_PRESETS[savedType] ? savedType : 'clean-toggle';
}

function getSavedSwitchSoundVolume() {
    return clampVolumePercent(localStorage.getItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME), 70);
}

function setRuntimeSwitchSoundSettings(enabled, soundType, volumePercent = getSavedSwitchSoundVolume()) {
    featureSwitchSoundSettings.enabled = Boolean(enabled);
    featureSwitchSoundSettings.type = FEATURE_SWITCH_SOUND_PRESETS[soundType] ? soundType : 'clean-toggle';
    featureSwitchSoundSettings.volume = clampVolumePercent(volumePercent, 70) / 100;
}

function getClickNoiseBuffer(context) {
    if (clickNoiseBuffer && clickNoiseBuffer.sampleRate === context.sampleRate) {
        return clickNoiseBuffer;
    }

    const duration = 0.05;
    const length = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
        const t = i / length;
        const envelope = Math.pow(1 - t, 2.2);
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    clickNoiseBuffer = buffer;
    return buffer;
}

function createClickTransient(context, destination, preset, startTime, scale) {
    const clickDuration = preset.duration;

    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = preset.bodyWave;
    body.frequency.setValueAtTime(Math.max(40, preset.bodyStart * scale), startTime);
    body.frequency.exponentialRampToValueAtTime(Math.max(40, preset.bodyEnd * scale), startTime + clickDuration);
    bodyGain.gain.setValueAtTime(0.0001, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(preset.bodyGain * scale, startTime + 0.0016);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + clickDuration);
    body.connect(bodyGain);
    bodyGain.connect(destination);

    const tick = context.createOscillator();
    const tickGain = context.createGain();
    tick.type = preset.tickWave;
    tick.frequency.setValueAtTime(preset.tickStart, startTime);
    tick.frequency.exponentialRampToValueAtTime(preset.tickEnd, startTime + clickDuration * 0.8);
    tickGain.gain.setValueAtTime(0.0001, startTime);
    tickGain.gain.exponentialRampToValueAtTime(preset.tickGain * scale, startTime + 0.0012);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + clickDuration * 0.7);
    tick.connect(tickGain);
    tickGain.connect(destination);

    const noise = context.createBufferSource();
    const noiseBand = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = getClickNoiseBuffer(context);
    noiseBand.type = 'bandpass';
    noiseBand.frequency.setValueAtTime(preset.noiseFreq, startTime);
    noiseBand.Q.setValueAtTime(1.05, startTime);
    noiseGain.gain.setValueAtTime(0.0001, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(preset.noiseGain * scale, startTime + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + clickDuration * 0.55);
    noise.connect(noiseBand);
    noiseBand.connect(noiseGain);
    noiseGain.connect(destination);

    body.start(startTime);
    tick.start(startTime);
    noise.start(startTime);

    const stopAt = startTime + clickDuration + 0.01;
    body.stop(stopAt);
    tick.stop(stopAt);
    noise.stop(stopAt);
}

function playButtonClickSound(soundType) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!clickAudioContext) {
        clickAudioContext = new AudioContextClass();
    }

    if (clickAudioContext.state === 'suspended') {
        clickAudioContext.resume();
    }

    const preset = BUTTON_SOUND_PRESETS[soundType] || BUTTON_SOUND_PRESETS['nexus-soft'];
    const now = clickAudioContext.currentTime + 0.0005;

    const lowpass = clickAudioContext.createBiquadFilter();
    const highpass = clickAudioContext.createBiquadFilter();
    const compressor = clickAudioContext.createDynamicsCompressor();
    const master = clickAudioContext.createGain();

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(preset.lowpass, now);

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(preset.highpass, now);

    compressor.threshold.setValueAtTime(-22, now);
    compressor.knee.setValueAtTime(18, now);
    compressor.ratio.setValueAtTime(2.8, now);
    compressor.attack.setValueAtTime(0.0025, now);
    compressor.release.setValueAtTime(0.075, now);

    master.gain.setValueAtTime(preset.master * soundSettings.volume, now);

    lowpass.connect(highpass);
    highpass.connect(compressor);
    compressor.connect(master);
    master.connect(clickAudioContext.destination);

    createClickTransient(clickAudioContext, lowpass, preset, now, 1.0);
    createClickTransient(clickAudioContext, lowpass, preset, now + preset.upDelay, preset.upScale);
}

function setupFeatureSwitchSounds() {
    document.addEventListener('change', (event) => {
        const toggle = event.target.closest('.toggle-input');
        if (!toggle || !featureSwitchSoundSettings.enabled) return;
        if (toggle.type && toggle.type !== 'checkbox') return;

        playFeatureSwitchSound(toggle.checked, featureSwitchSoundSettings.type);
    });
}

function createSwitchTransient(context, destination, preset, startTime, isEnabled, scale) {
    const duration = preset.duration;
    const bodyStart = (isEnabled ? preset.onStart : preset.offStart) * scale;
    const bodyEnd = (isEnabled ? preset.onEnd : preset.offEnd) * scale;

    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = preset.wave;
    body.frequency.setValueAtTime(Math.max(40, bodyStart), startTime);
    body.frequency.exponentialRampToValueAtTime(Math.max(40, bodyEnd), startTime + duration);

    bodyGain.gain.setValueAtTime(0.0001, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(preset.bodyGain * scale, startTime + 0.0018);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const tick = context.createOscillator();
    const tickGain = context.createGain();
    tick.type = 'square';
    tick.frequency.setValueAtTime(preset.tickStart, startTime);
    tick.frequency.exponentialRampToValueAtTime(preset.tickEnd, startTime + duration * 0.72);

    tickGain.gain.setValueAtTime(0.0001, startTime);
    tickGain.gain.exponentialRampToValueAtTime(preset.tickGain * scale, startTime + 0.0011);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.58);

    const noise = context.createBufferSource();
    const noiseBand = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = getClickNoiseBuffer(context);
    noiseBand.type = 'bandpass';
    noiseBand.frequency.setValueAtTime(preset.noiseFreq * (isEnabled ? 1.02 : 0.98), startTime);
    noiseBand.Q.setValueAtTime(1.1, startTime);

    noiseGain.gain.setValueAtTime(0.0001, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(preset.noiseGain * scale, startTime + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.5);

    body.connect(bodyGain);
    bodyGain.connect(destination);

    tick.connect(tickGain);
    tickGain.connect(destination);

    noise.connect(noiseBand);
    noiseBand.connect(noiseGain);
    noiseGain.connect(destination);

    body.start(startTime);
    tick.start(startTime);
    noise.start(startTime);

    const stopAt = startTime + duration + 0.012;
    body.stop(stopAt);
    tick.stop(stopAt);
    noise.stop(stopAt);
}

function playFeatureSwitchSound(isEnabled, soundType) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!clickAudioContext) {
        clickAudioContext = new AudioContextClass();
    }

    if (clickAudioContext.state === 'suspended') {
        clickAudioContext.resume();
    }

    const preset = FEATURE_SWITCH_SOUND_PRESETS[soundType] || FEATURE_SWITCH_SOUND_PRESETS['clean-toggle'];
    const now = clickAudioContext.currentTime + 0.0005;

    const lowpass = clickAudioContext.createBiquadFilter();
    const highpass = clickAudioContext.createBiquadFilter();
    const compressor = clickAudioContext.createDynamicsCompressor();
    const master = clickAudioContext.createGain();

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(preset.lowpass, now);

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(preset.highpass, now);

    compressor.threshold.setValueAtTime(-20, now);
    compressor.knee.setValueAtTime(16, now);
    compressor.ratio.setValueAtTime(2.6, now);
    compressor.attack.setValueAtTime(0.0022, now);
    compressor.release.setValueAtTime(0.06, now);

    master.gain.setValueAtTime(preset.master * featureSwitchSoundSettings.volume, now);

    lowpass.connect(highpass);
    highpass.connect(compressor);
    compressor.connect(master);
    master.connect(clickAudioContext.destination);

    createSwitchTransient(clickAudioContext, lowpass, preset, now, isEnabled, 1.0);
    createSwitchTransient(clickAudioContext, lowpass, preset, now + preset.returnDelay, isEnabled, preset.returnScale);
}

function getDefaultKeybindMap() {
    const defaults = {};
    getAllKeybindActions().forEach(action => {
        defaults[action.id] = '';
    });
    return defaults;
}

function normalizeKeybindMap(rawMap) {
    const normalized = getDefaultKeybindMap();
    const source = rawMap && typeof rawMap === 'object' ? rawMap : {};

    getAllKeybindActions().forEach(action => {
        const rawKey = typeof source[action.id] === 'string' ? source[action.id] : '';
        normalized[action.id] = rawKey.trim().toUpperCase();
    });

    return normalized;
}

function isHoldModeSupportedAction(actionOrId) {
    const action = typeof actionOrId === 'string'
        ? findKeybindActionById(actionOrId)
        : actionOrId;
    return Boolean(action && action.group === 'features' && String(action.id || '').startsWith('toggle-'));
}

function getDefaultKeybindModeMap() {
    const defaults = {};
    getAllKeybindActions().forEach(action => {
        if (isHoldModeSupportedAction(action)) {
            defaults[action.id] = KEYBIND_MODES.TOGGLE;
        }
    });
    return defaults;
}

function normalizeKeybindModeMap(rawModeMap) {
    const normalized = getDefaultKeybindModeMap();
    const source = rawModeMap && typeof rawModeMap === 'object' ? rawModeMap : {};
    Object.keys(normalized).forEach(actionId => {
        normalized[actionId] = source[actionId] === KEYBIND_MODES.HOLD ? KEYBIND_MODES.HOLD : KEYBIND_MODES.TOGGLE;
    });
    return normalized;
}

function loadKeybindModeMapFromStorage() {
    let parsed = {};
    try {
        parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYBIND_MODES) || '{}');
    } catch (error) {
        parsed = {};
    }
    keybindModeMap = normalizeKeybindModeMap(parsed);
    localStorage.setItem(STORAGE_KEYS.KEYBIND_MODES, JSON.stringify(keybindModeMap));
    return keybindModeMap;
}

function saveKeybindModeMapToStorage() {
    localStorage.setItem(STORAGE_KEYS.KEYBIND_MODES, JSON.stringify(keybindModeMap));
}

function getActionKeybindMode(actionId) {
    return keybindModeMap[actionId] === KEYBIND_MODES.HOLD ? KEYBIND_MODES.HOLD : KEYBIND_MODES.TOGGLE;
}

function loadKeybindMapFromStorage() {
    let parsed = {};
    try {
        parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYBINDS) || '{}');
    } catch (error) {
        parsed = {};
    }

    keybindMap = normalizeKeybindMap(parsed);
    localStorage.setItem(STORAGE_KEYS.KEYBINDS, JSON.stringify(keybindMap));
    detectKeybindConflicts();
    return keybindMap;
}

function saveKeybindMapToStorage() {
    localStorage.setItem(STORAGE_KEYS.KEYBINDS, JSON.stringify(keybindMap));
    detectKeybindConflicts();
}

function getDefaultKeybindProfileTargets() {
    return {
        'action-profile-select': ''
    };
}

function normalizeKeybindProfileTargets(rawTargets) {
    const defaults = getDefaultKeybindProfileTargets();
    const source = rawTargets && typeof rawTargets === 'object' ? rawTargets : {};

    Object.keys(defaults).forEach(actionId => {
        const value = typeof source[actionId] === 'string' ? source[actionId] : '';
        defaults[actionId] = value.trim();
    });

    return defaults;
}

function loadKeybindProfileTargetsFromStorage() {
    let parsed = {};
    try {
        parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYBIND_PROFILE_TARGETS) || '{}');
    } catch (error) {
        parsed = {};
    }

    keybindProfileTargets = normalizeKeybindProfileTargets(parsed);
    localStorage.setItem(STORAGE_KEYS.KEYBIND_PROFILE_TARGETS, JSON.stringify(keybindProfileTargets));
    return keybindProfileTargets;
}

function saveKeybindProfileTargetsToStorage() {
    localStorage.setItem(STORAGE_KEYS.KEYBIND_PROFILE_TARGETS, JSON.stringify(keybindProfileTargets));
}

function getFormattedKeyFromEvent(event) {
    const key = event.key || '';
    const aliases = {
        ' ': 'SPACE',
        Escape: 'ESC',
        ArrowUp: 'ARROW_UP',
        ArrowDown: 'ARROW_DOWN',
        ArrowLeft: 'ARROW_LEFT',
        ArrowRight: 'ARROW_RIGHT'
    };

    if (aliases[key]) return aliases[key];
    if (key.length === 1) return key.toUpperCase();
    return key.trim().toUpperCase();
}

function isModifierOnlyKey(key) {
    return key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta';
}

function findActionsByKeybindValue(keybindValue) {
    return getAllKeybindActions().filter(action => keybindMap[action.id] === keybindValue);
}

function getActionBaseTitle(actionOrId) {
    const action = typeof actionOrId === 'string'
        ? findKeybindActionById(actionOrId)
        : actionOrId;
    if (!action) return '';

    const rawTitle = String(action.title || '').trim();
    if (!isHoldModeSupportedAction(action)) return rawTitle;

    const withoutPrefix = rawTitle.replace(/^toggle\s+/i, '').trim();
    return withoutPrefix || rawTitle;
}

function getActionDisplayName(actionId) {
    const action = findKeybindActionById(actionId);
    if (!action) return actionId;
    if (!isHoldModeSupportedAction(action)) return action.title;

    const modeLabel = getActionKeybindMode(action.id) === KEYBIND_MODES.HOLD ? 'Hold' : 'Toggle';
    return `${modeLabel} ${getActionBaseTitle(action)}`;
}

function normalizeStoredKeyCombo(value) {
    return String(value || '').trim().toUpperCase();
}

function getMacroTriggerKeyCombo(macro) {
    if (!macro || typeof macro !== 'object') return '';
    const id = String(macro.id || '').trim();
    const directTrigger = normalizeStoredKeyCombo(macro.trigger || macro.keybind);
    if (directTrigger) return directTrigger;
    if (!id) return '';
    return normalizeStoredKeyCombo(keybindMap[`macro-run:${id}`] || '');
}

function updateConflictBanners(conflictCount) {
    const total = Math.max(0, Number(conflictCount) || 0);
    const message = `${total} keybind conflict${total === 1 ? '' : 's'} detected — duplicate keys may cause unexpected behavior.`;
    const pairs = [
        ['keybindConflictBanner', 'keybindConflictMsg'],
        ['macroConflictBanner', 'macroConflictMsg']
    ];

    pairs.forEach(([bannerId, msgId]) => {
        const banner = document.getElementById(bannerId);
        const msg = document.getElementById(msgId);
        if (!banner || !msg) return;
        if (total > 0) {
            banner.classList.add('is-visible');
            msg.textContent = message;
        } else {
            banner.classList.remove('is-visible');
        }
    });
}

function detectKeybindConflicts() {
    const parsedKeybinds = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.KEYBINDS), {});
    const keybindsSource = parsedKeybinds && typeof parsedKeybinds === 'object' && !Array.isArray(parsedKeybinds)
        ? parsedKeybinds
        : {};
    const parsedMacros = safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.MACROS), []);
    const macrosSource = Array.isArray(parsedMacros) ? normalizeMacroList(parsedMacros) : [];

    const comboMap = new Map();
    const keybindActionCombos = new Map();
    const macroCombos = new Map();
    const addEntry = (combo, entry) => {
        if (!combo) return;
        if (!comboMap.has(combo)) comboMap.set(combo, []);
        comboMap.get(combo).push(entry);
    };

    Object.keys(keybindsSource).forEach(actionId => {
        const combo = normalizeStoredKeyCombo(keybindsSource[actionId]);
        if (!combo) return;
        const action = findKeybindActionById(actionId);
        const displayName = action ? getActionDisplayName(actionId) : actionId;
        const macroActionMatch = String(actionId).match(/^macro-run:(.+)$/);
        const logicalKey = macroActionMatch ? `macro:${macroActionMatch[1]}` : `keybind:${actionId}`;
        keybindActionCombos.set(actionId, combo);
        addEntry(combo, {
            type: 'keybind',
            id: actionId,
            label: displayName,
            logicalKey
        });
    });

    macrosSource.forEach((macro, index) => {
        const macroId = String(macro.id || `macro-${index + 1}`).trim();
        if (!macroId) return;
        const combo = getMacroTriggerKeyCombo({
            ...macro,
            id: macroId
        });
        if (!combo) return;
        const label = String(macro.name || `Macro ${index + 1}`).trim() || `Macro ${index + 1}`;
        macroCombos.set(macroId, combo);
        addEntry(combo, {
            type: 'macro',
            id: macroId,
            label,
            logicalKey: `macro:${macroId}`
        });
    });

    const keybindConflictActionIds = new Set();
    const macroConflictIds = new Set();
    let conflictCount = 0;
    comboMap.forEach(entries => {
        if (!Array.isArray(entries) || entries.length < 2) return;
        const logicalKeys = new Set(entries.map(entry => String(entry.logicalKey || `${entry.type}:${entry.id}`)));
        if (logicalKeys.size < 2) return;
        conflictCount += 1;
        entries.forEach(entry => {
            if (entry.type === 'macro') {
                macroConflictIds.add(entry.id);
            } else {
                keybindConflictActionIds.add(entry.id);
            }
        });
    });

    keybindConflictState = {
        comboMap,
        keybindActionCombos,
        macroCombos,
        keybindConflictActionIds,
        macroConflictIds,
        conflictCount
    };
    updateConflictBanners(conflictCount);

    if (document.getElementById('keybindActionsList')) {
        renderKeybindActions(activeKeybindGroup);
    }
    if (document.getElementById('macrosList')) {
        renderMacrosList();
    }

    return keybindConflictState;
}

function goToPageByKeybind(pageName) {
    selectPage(pageName);
    updatePageTitle(pageName);
}

function getFeatureNameFromActionId(actionId) {
    const id = String(actionId || '');
    if (!id.startsWith('toggle-')) return '';
    return id.replace(/^toggle-/, '').trim().toLowerCase();
}

function setFeatureStateByKeybind(featureName, enabled) {
    const toggle = document.querySelector(`.toggle-input[data-feature="${featureName}"]`);
    if (!toggle) return false;
    const nextState = Boolean(enabled);
    if (toggle.checked === nextState) return false;
    toggle.checked = nextState;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
}

function toggleFeatureByKeybind(featureName) {
    const toggle = document.querySelector(`.toggle-input[data-feature="${featureName}"]`);
    if (!toggle) return;
    setFeatureStateByKeybind(featureName, !toggle.checked);
}

function releaseHeldActionById(actionId) {
    const held = activeHoldKeybindActions.get(actionId);
    if (!held) return;
    if (held.featureName) {
        setFeatureStateByKeybind(held.featureName, false);
    }
    activeHoldKeybindActions.delete(actionId);
}

function releaseHeldActionsByKey(keyValue) {
    Array.from(activeHoldKeybindActions.entries()).forEach(([actionId, state]) => {
        if (state.keyValue === keyValue) {
            releaseHeldActionById(actionId);
        }
    });
}

function releaseAllHeldActions() {
    Array.from(activeHoldKeybindActions.keys()).forEach(actionId => releaseHeldActionById(actionId));
}

function openKeybindModePopup(actionId) {
    const action = findKeybindActionById(actionId);
    if (!action || !isHoldModeSupportedAction(action)) return;

    const modal = document.getElementById('profileModal');
    const modalBody = document.getElementById('profileModalBody');
    if (!modal || !modalBody) return;

    const previousMode = getActionKeybindMode(actionId);
    setProfileModalTitle(`Keybind Mode: ${getActionBaseTitle(action)}`);
    modalBody.innerHTML = '';

    const info = document.createElement('p');
    info.className = 'setting-note';
    info.textContent = 'Choose how this keybind behaves when pressed.';
    modalBody.appendChild(info);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'modal-buttons';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'modal-btn cancel';
    toggleBtn.textContent = previousMode === KEYBIND_MODES.TOGGLE ? 'TOGGLE (SELECTED)' : 'TOGGLE';

    const holdBtn = document.createElement('button');
    holdBtn.className = 'modal-btn cancel';
    holdBtn.textContent = previousMode === KEYBIND_MODES.HOLD ? 'HOLD (SELECTED)' : 'HOLD';

    const setMode = (nextMode) => {
        if (nextMode !== KEYBIND_MODES.TOGGLE && nextMode !== KEYBIND_MODES.HOLD) return;
        if (nextMode === previousMode) {
            modal.classList.remove('active');
            setProfileModalTitle('Profile Manager');
            return;
        }

        keybindModeMap[actionId] = nextMode;
        saveKeybindModeMapToStorage();
        renderKeybindActions(activeKeybindGroup);
        if (nextMode === KEYBIND_MODES.TOGGLE) {
            releaseHeldActionById(actionId);
        }
        showNotification(`Keybind mode set: ${nextMode.toUpperCase()}`);
        recordRecentChange(`Keybind mode changed: ${getActionBaseTitle(action)} -> ${nextMode.toUpperCase()}`, () => {
            keybindModeMap[actionId] = previousMode;
            saveKeybindModeMapToStorage();
            renderKeybindActions(activeKeybindGroup);
        });

        modal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
    };

    toggleBtn.addEventListener('click', () => setMode(KEYBIND_MODES.TOGGLE));
    holdBtn.addEventListener('click', () => setMode(KEYBIND_MODES.HOLD));
    optionsWrap.appendChild(toggleBtn);
    optionsWrap.appendChild(holdBtn);
    modalBody.appendChild(optionsWrap);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-btn cancel';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
    });
    modalBody.appendChild(closeBtn);

    modal.classList.add('active');
    applyMicroCardAnimations(modalBody);
}

function toggleSidebarByKeybind() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
}

function toggleUiLockByKeybind() {
    const uiLockToggle = document.getElementById('enableUiLockMode');
    const next = !isUiLockModeEnabled();
    setUiLockMode(next);
    if (uiLockToggle) {
        uiLockToggle.checked = next;
    }
    recordRecentChange(`UI lock ${next ? 'enabled' : 'disabled'}`, () => {
        setUiLockMode(!next);
        if (uiLockToggle) uiLockToggle.checked = !next;
    });
    showNotification(`UI lock ${next ? 'enabled' : 'disabled'}.`);
}

function isFullscreenActive() {
    return Boolean(document.fullscreenElement);
}

function updateFullscreenButtonLabel() {
    const button = document.getElementById('toggleFullscreenBtn');
    if (!button) return;
    button.textContent = isFullscreenActive() ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN';
}

async function toggleFullscreenMode() {
    try {
        if (!isFullscreenActive()) {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } else if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    } catch (error) {
        showNotification('Fullscreen is not available here.');
    } finally {
        updateFullscreenButtonLabel();
    }
}

function persistCurrentSoundSettings() {
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');

    if (!enableButtonSounds || !buttonSoundSelect || !buttonSoundVolume || !enableSwitchSounds || !switchSoundSelect || !switchSoundVolume) {
        return;
    }

    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED, String(enableButtonSounds.checked));
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_TYPE, buttonSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME, String(clampVolumePercent(buttonSoundVolume.value, 65)));
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED, String(enableSwitchSounds.checked));
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_TYPE, switchSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME, String(clampVolumePercent(switchSoundVolume.value, 70)));

    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfileName !== 'Incognito') {
        const profilesData = getProfilesDataFromStorage();
        profilesData[currentProfileName] = buildCurrentProfileData();
        saveProfilesDataToStorage(profilesData);
    }
    updateProfileUnsavedIndicator();
}

function toggleSoundSettingByKeybind(kind) {
    const isButton = kind === 'button';
    const enabledToggle = document.getElementById(isButton ? 'enableButtonSounds' : 'enableSwitchSounds');
    const soundSelect = document.getElementById(isButton ? 'buttonSoundSelect' : 'switchSoundSelect');
    const soundVolume = document.getElementById(isButton ? 'buttonSoundVolume' : 'switchSoundVolume');
    const soundVolumeInput = document.getElementById(isButton ? 'buttonSoundVolumeInput' : 'switchSoundVolumeInput');

    if (!enabledToggle || !soundSelect || !soundVolume || !soundVolumeInput) return;

    const previousEnabled = enabledToggle.checked;
    enabledToggle.checked = !enabledToggle.checked;
    const enabled = enabledToggle.checked;

    soundSelect.disabled = !enabled;
    soundVolume.disabled = !enabled;
    soundVolumeInput.disabled = !enabled;

    if (isButton) {
        setRuntimeSoundSettings(enabled, soundSelect.value, soundVolume.value);
        showNotification(`Button sounds ${enabled ? 'enabled' : 'disabled'}.`);
    } else {
        setRuntimeSwitchSoundSettings(enabled, soundSelect.value, soundVolume.value);
        showNotification(`Switch sounds ${enabled ? 'enabled' : 'disabled'}.`);
    }

    persistCurrentSoundSettings();
    recordRecentChange(`${isButton ? 'Button sounds' : 'Switch sounds'} ${enabled ? 'enabled' : 'disabled'}`, () => {
        enabledToggle.checked = previousEnabled;
        soundSelect.disabled = !previousEnabled;
        soundVolume.disabled = !previousEnabled;
        soundVolumeInput.disabled = !previousEnabled;
        if (isButton) {
            setRuntimeSoundSettings(previousEnabled, soundSelect.value, soundVolume.value);
        } else {
            setRuntimeSwitchSoundSettings(previousEnabled, soundSelect.value, soundVolume.value);
        }
        persistCurrentSoundSettings();
    });
}

function runConfiguredProfileKeybind() {
    const targetProfile = (keybindProfileTargets['action-profile-select'] || '').trim();
    if (!targetProfile) {
        showNotification('Configure a profile target first.');
        openKeybindConfigurator('actions');
        return;
    }

    const profilesData = getProfilesDataFromStorage();
    if (!Object.prototype.hasOwnProperty.call(profilesData, targetProfile)) {
        showNotification('Configured profile was not found. Set it again.');
        openKeybindConfigurator('actions');
        return;
    }

    loadProfile(targetProfile);
}

function openProfileTargetConfigPopup(actionId) {
    const modal = document.getElementById('profileModal');
    const modalBody = document.getElementById('profileModalBody');
    if (!modal || !modalBody) return;

    const profilesData = getProfilesDataFromStorage();
    const selectedTarget = (keybindProfileTargets[actionId] || '').trim();
    const profileNames = Object.keys(profilesData);
    setProfileModalTitle('Select Keybind Profile');

    modalBody.innerHTML = '';

    const info = document.createElement('p');
    info.className = 'setting-note';
    info.textContent = 'Choose which profile this keybind should load.';
    modalBody.appendChild(info);

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';

    profileNames.forEach(name => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '10px';
        row.style.border = `2px solid ${name === selectedTarget ? 'var(--accent)' : '#333333'}`;
        row.style.borderRadius = 'var(--border-radius)';
        row.style.background = '#111111';

        const label = document.createElement('span');
        label.textContent = name;
        label.style.color = 'var(--text-primary)';
        label.style.fontWeight = '700';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'profile-item-btn';
        loadBtn.textContent = name === selectedTarget ? 'SELECTED' : 'SELECT';
        loadBtn.disabled = name === selectedTarget;
        if (name === selectedTarget) {
            loadBtn.style.opacity = '0.6';
            loadBtn.style.cursor = 'default';
        } else {
            loadBtn.addEventListener('click', () => {
                keybindProfileTargets[actionId] = name;
                saveKeybindProfileTargetsToStorage();
                modal.classList.remove('active');
                setProfileModalTitle('Profile Manager');
                renderKeybindActions(activeKeybindGroup);
                showNotification(`Keybind profile set: ${name}`);
            });
        }

        row.appendChild(label);
        row.appendChild(loadBtn);
        list.appendChild(row);
    });

    modalBody.appendChild(list);

    const closeRow = document.createElement('div');
    closeRow.className = 'modal-buttons';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'modal-btn cancel';
    clearBtn.textContent = 'CLEAR TARGET';
    clearBtn.addEventListener('click', () => {
        keybindProfileTargets[actionId] = '';
        saveKeybindProfileTargetsToStorage();
        modal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
        renderKeybindActions(activeKeybindGroup);
        showNotification('Keybind profile target cleared.');
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-btn cancel';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
    });
    closeRow.appendChild(clearBtn);
    closeRow.appendChild(closeBtn);
    modalBody.appendChild(closeRow);

    modal.classList.add('active');
    applyMicroCardAnimations(modalBody);
}

function initializeKeybinds() {
    const openBtn = document.getElementById('openKeybindConfigBtn');
    const closeBtn = document.getElementById('closeKeybindConfigBtn');
    const groupButtons = document.querySelectorAll('.keybind-group-btn');
    const exportBtn = document.getElementById('exportKeybindsBtn');
    const importBtn = document.getElementById('importKeybindsBtn');
    const importFile = document.getElementById('importKeybindsFile');

    if (openBtn) {
        openBtn.addEventListener('click', () => openKeybindConfigurator('navigation'));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeKeybindConfigurator);
    }

    groupButtons.forEach(button => {
        button.addEventListener('click', () => {
            const group = button.getAttribute('data-keybind-group') || 'navigation';
            setActiveKeybindGroup(group);
        });
    });

    if (exportBtn) {
        exportBtn.addEventListener('click', exportKeybindConfig);
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (event) => importKeybindConfig(event.target.files?.[0]));
    }

    document.addEventListener('keydown', handleKeybindKeydown, true);
    document.addEventListener('keyup', handleKeybindKeyup, true);
    window.addEventListener('blur', releaseAllHeldActions);
    loadKeybindMapFromStorage();
    loadKeybindModeMapFromStorage();
    loadKeybindProfileTargetsFromStorage();
    renderKeybindActions(activeKeybindGroup);
    detectKeybindConflicts();
}

function normalizeMacroList(source) {
    if (!Array.isArray(source)) return [];
    return source.map((item, index) => {
        const macro = item && typeof item === 'object' ? item : {};
        const id = String(macro.id || `macro-${Date.now()}-${index}`).trim();
        const name = String(macro.name || `Macro ${index + 1}`).trim() || `Macro ${index + 1}`;
        const loopCount = normalizeMacroLoopCount(macro.loopCount);
        const steps = Array.isArray(macro.steps)
            ? macro.steps
                .map(step => normalizeMacroStepEntry(step))
                .filter(step => Boolean(step && step.id))
            : [];
        const trigger = typeof macro.trigger === 'string' ? macro.trigger.trim().toUpperCase() : '';
        const keybind = typeof macro.keybind === 'string' ? macro.keybind.trim().toUpperCase() : '';
        return { id, name, loopCount, steps, trigger, keybind };
    }).filter(macro => macro.id);
}

function normalizeMacroLoopCount(value) {
    const parsed = Math.round(parseNumberWithFallback(value, MACRO_LOOP_COUNT_MIN));
    return Math.max(MACRO_LOOP_COUNT_MIN, Math.min(MACRO_LOOP_COUNT_MAX, parsed));
}

function normalizeMacroStepDelay(value) {
    const parsed = Math.round(parseNumberWithFallback(value, MACRO_STEP_DELAY_DEFAULT));
    return Math.max(MACRO_STEP_DELAY_MIN, Math.min(MACRO_STEP_DELAY_MAX, parsed));
}

function isDeprecatedMacroConditionStep(stepId) {
    const id = String(stepId || '').trim().toLowerCase();
    return id.startsWith('condition:');
}

function createMacroStepEntry(stepId, delayMs = MACRO_STEP_DELAY_DEFAULT) {
    const id = String(stepId || '').trim();
    if (!id || isDeprecatedMacroConditionStep(id)) return null;
    return {
        id,
        delayMs: normalizeMacroStepDelay(delayMs)
    };
}

function normalizeMacroStepEntry(stepRaw) {
    if (typeof stepRaw === 'string') {
        return createMacroStepEntry(stepRaw, MACRO_STEP_DELAY_DEFAULT);
    }
    if (!stepRaw || typeof stepRaw !== 'object') return null;

    const id = String(stepRaw.id || stepRaw.stepId || stepRaw.step || '').trim();
    return createMacroStepEntry(id, stepRaw.delayMs);
}

function loadMacrosFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.MACROS) || '[]');
        macros = normalizeMacroList(parsed);
    } catch (error) {
        macros = [];
    }
    detectKeybindConflicts();
}

function saveMacrosToStorage() {
    localStorage.setItem(STORAGE_KEYS.MACROS, JSON.stringify(macros));
    detectKeybindConflicts();
}

function loadMacroCollapseStateFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.MACRO_COLLAPSE_STATE) || '{}');
        macroCollapseState = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        macroCollapseState = {};
    }
}

function saveMacroCollapseStateToStorage() {
    localStorage.setItem(STORAGE_KEYS.MACRO_COLLAPSE_STATE, JSON.stringify(macroCollapseState));
}

function syncMacroCollapseState() {
    const validIds = new Set(macros.map(macro => macro.id));
    const next = {};
    Object.keys(macroCollapseState || {}).forEach(id => {
        if (validIds.has(id)) {
            next[id] = Boolean(macroCollapseState[id]);
        }
    });
    macroCollapseState = next;
    saveMacroCollapseStateToStorage();
}

function isMacroCollapsed(macroId) {
    return Boolean(macroCollapseState[macroId]);
}

function setMacroCollapsed(macroId, collapsed) {
    const id = String(macroId || '').trim();
    if (!id) return;
    macroCollapseState[id] = Boolean(collapsed);
    saveMacroCollapseStateToStorage();
}

function syncDynamicKeybindActions(render = true) {
    keybindMap = normalizeKeybindMap(keybindMap);
    saveKeybindMapToStorage();
    keybindModeMap = normalizeKeybindModeMap(keybindModeMap);
    saveKeybindModeMapToStorage();
    keybindProfileTargets = normalizeKeybindProfileTargets(keybindProfileTargets);
    saveKeybindProfileTargetsToStorage();
    if (render) {
        renderKeybindActions(activeKeybindGroup);
    }
}

function cloneMacrosSnapshot() {
    return JSON.parse(JSON.stringify(macros));
}

function restoreMacrosSnapshot(snapshot) {
    macros = normalizeMacroList(snapshot);
    saveMacrosToStorage();
    syncMacroCollapseState();
    syncDynamicKeybindActions(true);
    renderMacrosList();
}

function getMacroStepCatalog() {
    const steps = [
        { id: 'page:combat', label: 'Open Combat' },
        { id: 'page:hacks', label: 'Open Hacks' },
        { id: 'page:visuals', label: 'Open Visuals' },
        { id: 'page:settings', label: 'Open Settings' },
        { id: 'action:save-settings', label: 'Save Settings' },
        { id: 'action:toggle-sidebar', label: 'Toggle Sidebar' },
        { id: 'action:toggle-ui-lock', label: 'Toggle UI Lock' }
    ];

    Object.keys(BUILTIN_HACK_PRESETS).forEach(key => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        steps.push({ id: `preset:builtin:${key}`, label: `Apply Preset: ${label}` });
    });

    const featureMap = new Map();
    getHackToggles().forEach(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        if (!feature) return;
        const featureName = toggle.closest('.feature-card')?.querySelector('h3')?.textContent?.trim() || feature;
        const id = `feature:toggle:${feature}`;
        if (!featureMap.has(id)) {
            featureMap.set(id, { id, label: `Toggle ${featureName}` });
        }
    });
    Array.from(featureMap.values())
        .sort((a, b) => a.label.localeCompare(b.label))
        .forEach(entry => {
            steps.push(entry);
        });

    return steps;
}

function getMacroStepLabel(stepId, catalogMap = null) {
    const map = catalogMap || new Map(getMacroStepCatalog().map(step => [step.id, step.label]));
    return map.get(stepId) || stepId;
}

function waitForMacroStepDelay(delayMs) {
    const safeDelay = normalizeMacroStepDelay(delayMs);
    if (safeDelay <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, safeDelay));
}

function getMacroRuntimeDelayMs(delayMs) {
    const safeDelay = normalizeMacroStepDelay(delayMs);
    if (!macroToolsPackRuntimeEnabled || safeDelay <= 0) return safeDelay;
    const adaptivePadding = Math.min(120, Math.max(8, Math.round(safeDelay * 0.08)));
    const jitterRange = Math.min(30, Math.max(6, Math.round(safeDelay * 0.1)));
    const jitter = Math.round((Math.random() - 0.5) * 2 * jitterRange);
    return Math.max(0, safeDelay + adaptivePadding + jitter);
}

function getMacroEstimatedDurationMs(macro) {
    if (!macro) return 0;
    const loopCount = normalizeMacroLoopCount(macro.loopCount);
    const stepList = Array.isArray(macro.steps) ? macro.steps : [];
    const singleLoop = stepList.reduce((total, stepRaw) => {
        const step = normalizeMacroStepEntry(stepRaw);
        if (!step || !step.id) return total;
        const baseDelay = normalizeMacroStepDelay(step.delayMs);
        const qualityPadding = macroToolsPackRuntimeEnabled && baseDelay > 0
            ? Math.min(120, Math.max(8, Math.round(baseDelay * 0.08)))
            : 0;
        return total + baseDelay + qualityPadding;
    }, 0);
    return singleLoop * loopCount;
}

function formatMacroDelayUnit(delayMs) {
    const safeDelay = normalizeMacroStepDelay(delayMs);
    if (safeDelay >= 1000) {
        const seconds = safeDelay / 1000;
        const decimals = Number.isInteger(seconds) ? 0 : 2;
        return `${seconds.toFixed(decimals)} s`;
    }
    return `${safeDelay} ms`;
}

function executeMacroStep(stepId) {
    const step = String(stepId || '').trim();
    if (!step) return { handled: false, stop: false };

    if (step.startsWith('page:')) {
        const page = step.replace(/^page:/, '').trim().toLowerCase();
        if (!PAGE_OPTIONS.includes(page)) return { handled: false, stop: false };
        goToPageByKeybind(page);
        return { handled: true, stop: false };
    }

    if (step.startsWith('feature:toggle:')) {
        const feature = step.replace(/^feature:toggle:/, '').trim().toLowerCase();
        if (!feature) return { handled: false, stop: false };
        toggleFeatureByKeybind(feature);
        return { handled: true, stop: false };
    }

    if (step.startsWith('preset:builtin:')) {
        const presetKey = step.replace(/^preset:builtin:/, '').trim().toLowerCase();
        if (!BUILTIN_HACK_PRESETS[presetKey]) return { handled: false, stop: false };
        applyPresetById(`builtin:${presetKey}`);
        return { handled: true, stop: false };
    }

    if (step === 'condition:any-feature-active:stop') {
        const activeCount = getHackToggles().filter(toggle => toggle.checked).length;
        return { handled: true, stop: activeCount > 0 };
    }

    const pageStopMatch = step.match(/^condition:page:([a-z]+):stop$/);
    if (pageStopMatch) {
        const targetPage = pageStopMatch[1];
        return { handled: true, stop: getActivePageName() === targetPage };
    }

    const featureEnabledStopMatch = step.match(/^condition:feature-enabled:([a-z0-9_-]+):stop$/);
    if (featureEnabledStopMatch) {
        const feature = featureEnabledStopMatch[1];
        const toggle = document.querySelector(`.toggle-input[data-feature="${feature}"]`);
        return { handled: true, stop: Boolean(toggle && toggle.checked) };
    }

    const featureDisabledStopMatch = step.match(/^condition:feature-disabled:([a-z0-9_-]+):stop$/);
    if (featureDisabledStopMatch) {
        const feature = featureDisabledStopMatch[1];
        const toggle = document.querySelector(`.toggle-input[data-feature="${feature}"]`);
        return { handled: true, stop: Boolean(toggle && !toggle.checked) };
    }

    if (step === 'action:save-settings') {
        saveSettings();
        return { handled: true, stop: false };
    }
    if (step === 'action:toggle-sidebar') {
        toggleSidebarByKeybind();
        return { handled: true, stop: false };
    }
    if (step === 'action:toggle-ui-lock') {
        toggleUiLockByKeybind();
        return { handled: true, stop: false };
    }

    return { handled: false, stop: false };
}

async function runMacroById(macroId) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    if (!macro.steps.length) {
        showNotification('This macro has no steps.');
        return;
    }
    if (activeMacroRunIds.has(macroId)) {
        showNotification(`Macro "${macro.name}" is already running.`);
        return;
    }

    activeMacroRunIds.add(macroId);

    let executed = 0;
    let stoppedByCondition = false;
    let totalRuntimeDelay = 0;
    const loopCount = normalizeMacroLoopCount(macro.loopCount);
    try {
        for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {
            for (const stepRaw of macro.steps) {
                const step = normalizeMacroStepEntry(stepRaw);
                if (!step || !step.id) continue;
                const runtimeDelay = getMacroRuntimeDelayMs(step.delayMs);
                if (runtimeDelay > 0) {
                    totalRuntimeDelay += runtimeDelay;
                    await waitForMacroStepDelay(runtimeDelay);
                }
                const result = executeMacroStep(step.id);
                if (result.handled) executed += 1;
                if (result.stop) {
                    stoppedByCondition = true;
                    break;
                }
            }
            if (stoppedByCondition) break;
        }
        const totalPlanned = macro.steps.length * loopCount;
        const runtimeSuffix = macroToolsPackRuntimeEnabled
            ? ` | macro tools delay ${formatMacroDelayUnit(totalRuntimeDelay)}`
            : '';
        if (stoppedByCondition) {
            showNotification(`Macro "${macro.name}" stopped by condition (${executed}/${totalPlanned})${runtimeSuffix}.`);
        } else {
            showNotification(`Macro "${macro.name}" executed (${executed}/${totalPlanned})${runtimeSuffix}.`);
        }
        recordRecentChange(`Macro executed: ${macro.name}`);
    } finally {
        activeMacroRunIds.delete(macroId);
    }
}

function createMacroFromInput() {
    const input = document.getElementById('macroNameInput');
    const rawName = String(input?.value || '').trim();
    const name = rawName || `Macro ${macros.length + 1}`;
    const snapshot = cloneMacrosSnapshot();

    macros.unshift({
        id: `macro-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name,
        loopCount: MACRO_LOOP_COUNT_MIN,
        steps: []
    });
    setMacroCollapsed(macros[0].id, false);
    syncMacroCollapseState();
    saveMacrosToStorage();
    syncDynamicKeybindActions(true);
    renderMacrosList();
    if (input) input.value = '';
    showNotification(`Macro created: ${name}`);
    recordRecentChange(`Macro created: ${name}`, () => restoreMacrosSnapshot(snapshot));
}

function duplicateMacro(macroId) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    const snapshot = cloneMacrosSnapshot();
    const baseName = `${macro.name} Copy`;
    let name = baseName;
    let index = 2;
    const lowerNames = new Set(macros.map(item => String(item.name || '').toLowerCase()));
    while (lowerNames.has(name.toLowerCase())) {
        name = `${baseName} ${index}`;
        index += 1;
    }

    macros.unshift({
        id: `macro-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name,
        loopCount: normalizeMacroLoopCount(macro.loopCount),
        steps: (Array.isArray(macro.steps) ? macro.steps : [])
            .map(step => normalizeMacroStepEntry(step))
            .filter(Boolean)
    });
    setMacroCollapsed(macros[0].id, false);
    syncMacroCollapseState();
    saveMacrosToStorage();
    syncDynamicKeybindActions(true);
    renderMacrosList();
    showNotification(`Macro duplicated: ${name}`);
    recordRecentChange(`Macro duplicated: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function renameMacro(macroId, nextNameRaw) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    const nextName = String(nextNameRaw || '').trim();
    if (!nextName || nextName === macro.name) return;

    const snapshot = cloneMacrosSnapshot();
    macro.name = nextName;
    saveMacrosToStorage();
    syncDynamicKeybindActions(true);
    renderMacrosList();
    recordRecentChange(`Macro renamed: ${nextName}`, () => restoreMacrosSnapshot(snapshot));
}

function setMacroLoopCount(macroId, loopValue) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    const nextLoopCount = normalizeMacroLoopCount(loopValue);
    if (nextLoopCount === normalizeMacroLoopCount(macro.loopCount)) return;

    const snapshot = cloneMacrosSnapshot();
    macro.loopCount = nextLoopCount;
    saveMacrosToStorage();
    renderMacrosList();
    recordRecentChange(`Macro loop count changed: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function addMacroStep(macroId, stepId) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    const step = String(stepId || '').trim();
    if (!step) return;

    const nextStep = createMacroStepEntry(step, MACRO_STEP_DELAY_DEFAULT);
    if (!nextStep) return;
    const snapshot = cloneMacrosSnapshot();
    macro.steps.push(nextStep);
    saveMacrosToStorage();
    renderMacrosList();
    recordRecentChange(`Step added to macro: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function setMacroStepDelay(macroId, stepIndex, delayValue) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    if (stepIndex < 0 || stepIndex >= macro.steps.length) return;

    const currentStep = normalizeMacroStepEntry(macro.steps[stepIndex]);
    if (!currentStep || !currentStep.id) return;

    const nextDelay = normalizeMacroStepDelay(delayValue);
    if (nextDelay === currentStep.delayMs) return;

    const snapshot = cloneMacrosSnapshot();
    macro.steps[stepIndex] = createMacroStepEntry(currentStep.id, nextDelay);
    saveMacrosToStorage();
    renderMacrosList();
    recordRecentChange(`Step delay changed in macro: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function removeMacroStep(macroId, stepIndex) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    if (stepIndex < 0 || stepIndex >= macro.steps.length) return;

    const snapshot = cloneMacrosSnapshot();
    macro.steps.splice(stepIndex, 1);
    saveMacrosToStorage();
    renderMacrosList();
    recordRecentChange(`Step removed from macro: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function moveMacroStep(macroId, stepIndex, direction) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;
    const nextIndex = stepIndex + direction;
    if (stepIndex < 0 || stepIndex >= macro.steps.length || nextIndex < 0 || nextIndex >= macro.steps.length) return;

    const snapshot = cloneMacrosSnapshot();
    const [step] = macro.steps.splice(stepIndex, 1);
    macro.steps.splice(nextIndex, 0, step);
    saveMacrosToStorage();
    renderMacrosList();
    recordRecentChange(`Macro steps reordered: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function deleteMacro(macroId) {
    const macro = macros.find(item => item.id === macroId);
    if (!macro) return;

    const macroActionId = `macro-run:${macroId}`;
    if (keybindCapture.actionId === macroActionId) {
        stopKeybindCapture();
    }

    const snapshot = cloneMacrosSnapshot();
    macros = macros.filter(item => item.id !== macroId);
    delete macroCollapseState[macroId];
    saveMacroCollapseStateToStorage();
    saveMacrosToStorage();
    syncDynamicKeybindActions(true);
    renderMacrosList();
    showNotification(`Macro deleted: ${macro.name}`);
    recordRecentChange(`Macro deleted: ${macro.name}`, () => restoreMacrosSnapshot(snapshot));
}

function renderMacrosList() {
    const list = document.getElementById('macrosList');
    if (!list) return;

    list.innerHTML = '';
    if (!macros.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'No macros yet. Create one to get started.';
        list.appendChild(empty);
        return;
    }

    const catalog = getMacroStepCatalog();
    const catalogMap = new Map(catalog.map(step => [step.id, step.label]));

    macros.forEach(macro => {
        const card = document.createElement('div');
        card.className = 'setting-card macro-card';
        const collapsed = isMacroCollapsed(macro.id);
        card.classList.toggle('collapsed', collapsed);
        if (macroToolsPackRuntimeEnabled) {
            card.classList.add('macro-tools-enhanced');
        }

        const headerRow = document.createElement('div');
        headerRow.className = 'macro-header-row';

        const nameInput = document.createElement('input');
        nameInput.className = 'modal-input macro-name-input';
        nameInput.value = macro.name;
        nameInput.placeholder = 'Macro name';
        nameInput.addEventListener('change', () => renameMacro(macro.id, nameInput.value));

        const loopLabel = document.createElement('span');
        loopLabel.className = 'macro-loop-label';
        loopLabel.textContent = 'LOOPS';

        const loopInput = document.createElement('input');
        loopInput.type = 'number';
        loopInput.min = String(MACRO_LOOP_COUNT_MIN);
        loopInput.max = String(MACRO_LOOP_COUNT_MAX);
        loopInput.step = '1';
        loopInput.className = 'spinbox macro-loop-input';
        loopInput.value = String(normalizeMacroLoopCount(macro.loopCount));
        loopInput.title = 'How many times this macro runs';
        loopInput.addEventListener('change', () => setMacroLoopCount(macro.id, loopInput.value));

        const triggerCombo = getMacroTriggerKeyCombo(macro);
        const triggerBadge = document.createElement('div');
        triggerBadge.className = 'keybind-key';
        triggerBadge.textContent = triggerCombo ? `TRIGGER: ${triggerCombo}` : 'TRIGGER: NONE';
        triggerBadge.classList.toggle('none', !triggerCombo);
        const macroConflictEntries = triggerCombo ? (keybindConflictState.comboMap.get(triggerCombo) || []) : [];
        const macroHasConflict = keybindConflictState.macroConflictIds.has(macro.id);
        if (macroHasConflict) {
            triggerBadge.classList.add('conflict');
            triggerBadge.title = `Conflict with: ${macroConflictEntries
                .filter(entry => String(entry.logicalKey || `${entry.type}:${entry.id}`) !== `macro:${macro.id}`)
                .map(entry => entry.label)
                .join(', ')}`;
        }

        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'keybind-control-btn';
        collapseBtn.textContent = collapsed ? 'EXPAND' : 'COLLAPSE';
        collapseBtn.addEventListener('click', () => {
            setMacroCollapsed(macro.id, !collapsed);
            renderMacrosList();
        });

        const runBtn = document.createElement('button');
        runBtn.className = 'keybind-control-btn';
        runBtn.textContent = 'RUN';
        runBtn.addEventListener('click', () => runMacroById(macro.id));

        let duplicateBtn = null;
        if (macroToolsPackRuntimeEnabled) {
            duplicateBtn = document.createElement('button');
            duplicateBtn.className = 'keybind-control-btn';
            duplicateBtn.textContent = 'DUPLICATE';
            duplicateBtn.addEventListener('click', () => duplicateMacro(macro.id));
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        deleteBtn.addEventListener('click', () => deleteMacro(macro.id));

        headerRow.appendChild(nameInput);
        headerRow.appendChild(loopLabel);
        headerRow.appendChild(loopInput);
        headerRow.appendChild(triggerBadge);
        if (macroHasConflict) {
            const conflictBadge = document.createElement('span');
            conflictBadge.className = 'conflict-badge';
            conflictBadge.textContent = '⚠ Conflict';
            headerRow.appendChild(conflictBadge);
        }
        headerRow.appendChild(collapseBtn);
        headerRow.appendChild(runBtn);
        if (duplicateBtn) {
            headerRow.appendChild(duplicateBtn);
        }
        headerRow.appendChild(deleteBtn);

        const stepRow = document.createElement('div');
        stepRow.className = 'macro-step-row';

        const stepSelect = document.createElement('select');
        stepSelect.className = 'combo-box';
        catalog.forEach(step => {
            const option = document.createElement('option');
            option.value = step.id;
            option.textContent = step.label;
            stepSelect.appendChild(option);
        });

        const addStepBtn = document.createElement('button');
        addStepBtn.className = 'keybind-control-btn';
        addStepBtn.textContent = 'ADD STEP';
        addStepBtn.addEventListener('click', () => addMacroStep(macro.id, stepSelect.value));

        stepRow.appendChild(stepSelect);
        stepRow.appendChild(addStepBtn);

        const stepsList = document.createElement('div');
        stepsList.className = 'macro-steps-list';

        if (!macro.steps.length) {
            const emptySteps = document.createElement('div');
            emptySteps.className = 'macro-empty';
            emptySteps.textContent = 'No steps in this macro yet.';
            stepsList.appendChild(emptySteps);
        } else {
            macro.steps.forEach((stepRaw, index) => {
                const stepEntry = normalizeMacroStepEntry(stepRaw);
                if (!stepEntry || !stepEntry.id) return;
                const stepItem = document.createElement('div');
                stepItem.className = 'macro-step-item';

                const label = document.createElement('div');
                label.className = 'macro-step-label';
                label.textContent = `${index + 1}. ${getMacroStepLabel(stepEntry.id, catalogMap)}`;

                const controls = document.createElement('div');
                controls.className = 'macro-step-controls';

                const delayLabel = document.createElement('span');
                delayLabel.className = 'macro-step-delay-label';
                delayLabel.textContent = 'DELAY';

                const delayInput = document.createElement('input');
                delayInput.type = 'number';
                delayInput.min = String(MACRO_STEP_DELAY_MIN);
                delayInput.max = String(MACRO_STEP_DELAY_MAX);
                delayInput.step = '25';
                delayInput.className = 'spinbox macro-step-delay-input';
                delayInput.value = String(stepEntry.delayMs);
                delayInput.title = 'Delay before this step (ms)';

                const delayUnit = document.createElement('span');
                delayUnit.className = 'macro-step-delay-unit';
                delayUnit.textContent = formatMacroDelayUnit(stepEntry.delayMs);

                delayInput.addEventListener('input', () => {
                    delayUnit.textContent = formatMacroDelayUnit(delayInput.value);
                });
                delayInput.addEventListener('change', () => {
                    delayUnit.textContent = formatMacroDelayUnit(delayInput.value);
                    setMacroStepDelay(macro.id, index, delayInput.value);
                });

                const upBtn = document.createElement('button');
                upBtn.className = 'keybind-control-btn';
                upBtn.textContent = 'UP';
                upBtn.disabled = index === 0;
                upBtn.addEventListener('click', () => moveMacroStep(macro.id, index, -1));

                const downBtn = document.createElement('button');
                downBtn.className = 'keybind-control-btn';
                downBtn.textContent = 'DOWN';
                downBtn.disabled = index === macro.steps.length - 1;
                downBtn.addEventListener('click', () => moveMacroStep(macro.id, index, 1));

                const removeBtn = document.createElement('button');
                removeBtn.className = 'keybind-control-btn';
                removeBtn.textContent = 'REMOVE';
                removeBtn.addEventListener('click', () => removeMacroStep(macro.id, index));

                controls.appendChild(delayLabel);
                controls.appendChild(delayInput);
                controls.appendChild(delayUnit);
                controls.appendChild(upBtn);
                controls.appendChild(downBtn);
                controls.appendChild(removeBtn);

                stepItem.appendChild(label);
                stepItem.appendChild(controls);
                stepsList.appendChild(stepItem);
            });
        }

        card.appendChild(headerRow);
        if (macroToolsPackRuntimeEnabled) {
            const summary = document.createElement('p');
            summary.className = 'setting-note macro-tools-summary';
            const stepCount = Array.isArray(macro.steps) ? macro.steps.length : 0;
            const estimated = getMacroEstimatedDurationMs(macro);
            summary.textContent = `Macro Tools: ${stepCount} steps | ${normalizeMacroLoopCount(macro.loopCount)} loops | est ${formatMacroDelayUnit(estimated)}`;
            card.appendChild(summary);
        }
        card.appendChild(stepRow);
        card.appendChild(stepsList);
        list.appendChild(card);
    });

    applyMicroCardAnimations(list);
}

function getAutomationFeatureOptions() {
    return getHackToggles()
        .map(toggle => {
            const feature = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
            const label = toggle.closest('.feature-card')?.querySelector('h3')?.textContent?.trim() || feature;
            return feature ? { value: feature, label } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.label.localeCompare(b.label));
}

function getAutomationProfileOptions() {
    const profiles = getProfilesDataFromStorage();
    return Object.keys(profiles).map(name => ({ value: name, label: name }));
}

function getAutomationMacroOptions() {
    return macros.map(macro => ({ value: macro.id, label: macro.name }));
}

function normalizeAutomationCooldown(value) {
    const parsed = Math.round(parseNumberWithFallback(value, 500));
    return Math.max(AUTOMATION_COOLDOWN_MIN, Math.min(AUTOMATION_COOLDOWN_MAX, parsed));
}

function getDefaultAutomationConditionValue(conditionType) {
    if (conditionType === 'active-hacks-at-least') return '1';
    if (conditionType === 'page-is') return PAGE_OPTIONS[0] || 'combat';
    if (conditionType === 'profile-is') {
        const firstProfile = getAutomationProfileOptions()[0];
        return firstProfile ? firstProfile.value : 'Default';
    }
    if (conditionType === 'feature-enabled' || conditionType === 'feature-disabled') {
        const firstFeature = getAutomationFeatureOptions()[0];
        return firstFeature ? firstFeature.value : '';
    }
    return '';
}

function getDefaultAutomationActionValue(actionType) {
    if (actionType === 'open-page') return PAGE_OPTIONS[0] || 'combat';
    if (actionType === 'load-profile') {
        const firstProfile = getAutomationProfileOptions()[0];
        return firstProfile ? firstProfile.value : 'Default';
    }
    if (actionType === 'run-macro') {
        const firstMacro = getAutomationMacroOptions()[0];
        return firstMacro ? firstMacro.value : '';
    }
    if (actionType === 'apply-preset') return Object.keys(BUILTIN_HACK_PRESETS)[0] || 'pvp';
    if (actionType === 'toggle-feature' || actionType === 'set-feature-on' || actionType === 'set-feature-off') {
        const firstFeature = getAutomationFeatureOptions()[0];
        return firstFeature ? firstFeature.value : '';
    }
    return '';
}

function normalizeAutomationList(source) {
    if (!Array.isArray(source)) return [];
    return source.map((entry, index) => {
        const item = entry && typeof entry === 'object' ? entry : {};
        const id = String(item.id || `automation-${Date.now()}-${index}`).trim();
        const name = String(item.name || `Automation ${index + 1}`).trim() || `Automation ${index + 1}`;
        const conditionType = String(item.conditionType || 'feature-enabled').trim();
        const actionType = String(item.actionType || 'toggle-feature').trim();
        return {
            id,
            name,
            enabled: item.enabled !== false && item.enabled !== 'false',
            conditionType,
            conditionValue: String(item.conditionValue ?? getDefaultAutomationConditionValue(conditionType)).trim(),
            actionType,
            actionValue: String(item.actionValue ?? getDefaultAutomationActionValue(actionType)).trim(),
            cooldownMs: normalizeAutomationCooldown(item.cooldownMs)
        };
    }).filter(item => item.id);
}

function loadAutomationsFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATIONS) || '[]');
        automations = normalizeAutomationList(parsed);
    } catch (error) {
        automations = [];
    }
}

function saveAutomationsToStorage() {
    localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations));
}

function loadAutomationCollapseStateFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_COLLAPSE_STATE) || '{}');
        automationCollapseState = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        automationCollapseState = {};
    }
}

function saveAutomationCollapseStateToStorage() {
    localStorage.setItem(STORAGE_KEYS.AUTOMATION_COLLAPSE_STATE, JSON.stringify(automationCollapseState));
}

function syncAutomationCollapseState() {
    const validIds = new Set(automations.map(rule => rule.id));
    const next = {};
    Object.keys(automationCollapseState || {}).forEach(id => {
        if (validIds.has(id)) {
            next[id] = Boolean(automationCollapseState[id]);
        }
    });
    automationCollapseState = next;
    saveAutomationCollapseStateToStorage();
}

function isAutomationCollapsed(automationId) {
    return Boolean(automationCollapseState[automationId]);
}

function setAutomationCollapsed(automationId, collapsed) {
    const id = String(automationId || '').trim();
    if (!id) return;
    automationCollapseState[id] = Boolean(collapsed);
    saveAutomationCollapseStateToStorage();
}

function cloneAutomationsSnapshot() {
    return JSON.parse(JSON.stringify(automations));
}

function restoreAutomationsSnapshot(snapshot) {
    automations = normalizeAutomationList(snapshot);
    saveAutomationsToStorage();
    syncAutomationCollapseState();
    syncDynamicKeybindActions(true);
    renderAutomationsList();
}

function evaluateAutomationCondition(rule) {
    const type = String(rule?.conditionType || '').trim();
    const value = String(rule?.conditionValue || '').trim();

    if (type === 'feature-enabled') {
        const toggle = document.querySelector(`.toggle-input[data-feature="${value}"]`);
        return Boolean(toggle && toggle.checked);
    }
    if (type === 'feature-disabled') {
        const toggle = document.querySelector(`.toggle-input[data-feature="${value}"]`);
        return Boolean(toggle && !toggle.checked);
    }
    if (type === 'page-is') {
        return getActivePageName() === value;
    }
    if (type === 'active-hacks-at-least') {
        const threshold = Math.max(1, parseInt(value || '1', 10) || 1);
        const activeCount = getHackToggles().filter(toggle => toggle.checked).length;
        return activeCount >= threshold;
    }
    if (type === 'profile-is') {
        const currentProfile = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
        return currentProfile === value;
    }
    return false;
}

function runAutomationAction(rule) {
    const actionType = String(rule?.actionType || '').trim();
    const actionValue = String(rule?.actionValue || '').trim().toLowerCase();

    if (actionType === 'toggle-feature') {
        if (!actionValue) return false;
        toggleFeatureByKeybind(actionValue);
        return true;
    }
    if (actionType === 'set-feature-on') {
        if (!actionValue) return false;
        setFeatureStateByKeybind(actionValue, true);
        return true;
    }
    if (actionType === 'set-feature-off') {
        if (!actionValue) return false;
        setFeatureStateByKeybind(actionValue, false);
        return true;
    }
    if (actionType === 'open-page') {
        if (!PAGE_OPTIONS.includes(actionValue)) return false;
        goToPageByKeybind(actionValue);
        return true;
    }
    if (actionType === 'load-profile') {
        if (!actionValue) return false;
        const profiles = getProfilesDataFromStorage();
        if (!Object.prototype.hasOwnProperty.call(profiles, actionValue)) return false;
        loadProfile(actionValue);
        return true;
    }
    if (actionType === 'run-macro') {
        if (!actionValue) return false;
        runMacroById(actionValue);
        return true;
    }
    if (actionType === 'apply-preset') {
        if (!BUILTIN_HACK_PRESETS[actionValue]) return false;
        applyPresetById(`builtin:${actionValue}`);
        return true;
    }
    if (actionType === 'save-settings') {
        saveSettings();
        return true;
    }
    return false;
}

function runAutomationByKeybind(automationId) {
    const rule = automations.find(item => item.id === automationId);
    if (!rule) return false;
    const ok = runAutomationAction(rule);
    showNotification(ok ? `Automation ran: ${rule.name}` : `Automation run failed: ${rule.name}`);
    return ok;
}

function toggleAutomationByKeybind(automationId) {
    const rule = automations.find(item => item.id === automationId);
    if (!rule) return false;

    const snapshot = cloneAutomationsSnapshot();
    rule.enabled = !rule.enabled;
    saveAutomationsToStorage();
    syncAutomationRuntimeState();
    renderAutomationsList();
    syncDynamicKeybindActions(true);
    showNotification(`Automation ${rule.enabled ? 'enabled' : 'disabled'}: ${rule.name}`);
    recordRecentChange(
        `Automation ${rule.enabled ? 'enabled' : 'disabled'}: ${rule.name}`,
        () => restoreAutomationsSnapshot(snapshot)
    );
    return true;
}

function syncAutomationRuntimeState() {
    const activeIds = new Set(automations.map(item => item.id));
    const next = {};
    Object.keys(automationRuntimeState).forEach(id => {
        if (activeIds.has(id)) next[id] = automationRuntimeState[id];
    });
    automationRuntimeState = next;
}

function runAutomationTick() {
    const now = Date.now();
    automations.forEach(rule => {
        const runtime = automationRuntimeState[rule.id] || { wasTrue: false, lastTriggeredAt: 0 };
        if (!rule.enabled) {
            runtime.wasTrue = false;
            automationRuntimeState[rule.id] = runtime;
            return;
        }

        const isTrue = evaluateAutomationCondition(rule);
        if (isTrue && !runtime.wasTrue && now - runtime.lastTriggeredAt >= normalizeAutomationCooldown(rule.cooldownMs)) {
            if (runAutomationAction(rule)) {
                runtime.lastTriggeredAt = now;
                showNotification(`Automation triggered: ${rule.name}`);
            }
        }
        runtime.wasTrue = isTrue;
        automationRuntimeState[rule.id] = runtime;
    });
}

function startAutomationEngine() {
    if (automationTickIntervalId) {
        clearInterval(automationTickIntervalId);
    }
    automationTickIntervalId = setInterval(runAutomationTick, AUTOMATION_TICK_MS);
}

function createAutomationFromInput() {
    const input = document.getElementById('automationNameInput');
    const rawName = String(input?.value || '').trim();
    const name = rawName || `Automation ${automations.length + 1}`;
    const snapshot = cloneAutomationsSnapshot();
    automations.unshift({
        id: `automation-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name,
        enabled: true,
        conditionType: 'feature-enabled',
        conditionValue: getDefaultAutomationConditionValue('feature-enabled'),
        actionType: 'toggle-feature',
        actionValue: getDefaultAutomationActionValue('toggle-feature'),
        cooldownMs: 500
    });
    setAutomationCollapsed(automations[0].id, false);
    syncAutomationCollapseState();
    saveAutomationsToStorage();
    syncAutomationRuntimeState();
    syncDynamicKeybindActions(true);
    renderAutomationsList();
    if (input) input.value = '';
    showNotification(`Automation created: ${name}`);
    recordRecentChange(`Automation created: ${name}`, () => restoreAutomationsSnapshot(snapshot));
}

function updateAutomationRule(automationId, updater, historyLabel) {
    const target = automations.find(item => item.id === automationId);
    if (!target) return;
    const snapshot = cloneAutomationsSnapshot();
    updater(target);
    saveAutomationsToStorage();
    syncAutomationRuntimeState();
    syncDynamicKeybindActions(true);
    renderAutomationsList();
    if (historyLabel) {
        recordRecentChange(historyLabel, () => restoreAutomationsSnapshot(snapshot));
    }
}

function deleteAutomation(automationId) {
    const target = automations.find(item => item.id === automationId);
    if (!target) return;
    const snapshot = cloneAutomationsSnapshot();
    automations = automations.filter(item => item.id !== automationId);
    delete automationCollapseState[automationId];
    saveAutomationCollapseStateToStorage();
    saveAutomationsToStorage();
    syncAutomationRuntimeState();
    syncDynamicKeybindActions(true);
    renderAutomationsList();
    showNotification(`Automation deleted: ${target.name}`);
    recordRecentChange(`Automation deleted: ${target.name}`, () => restoreAutomationsSnapshot(snapshot));
}

function renderAutomationValueControl(rule, kind) {
    const type = kind === 'condition' ? rule.conditionType : rule.actionType;
    const value = kind === 'condition' ? rule.conditionValue : rule.actionValue;

    const setValue = (nextValue) => {
        updateAutomationRule(rule.id, item => {
            if (kind === 'condition') {
                item.conditionValue = String(nextValue || '').trim();
            } else {
                item.actionValue = String(nextValue || '').trim();
            }
        }, `Automation ${kind} updated: ${rule.name}`);
    };

    if (kind === 'condition' && type === 'active-hacks-at-least') {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '64';
        input.step = '1';
        input.className = 'spinbox automation-value-input';
        input.value = String(Math.max(1, parseInt(value || '1', 10) || 1));
        input.addEventListener('change', () => setValue(input.value));
        return input;
    }

    let options = [];
    if (type === 'feature-enabled' || type === 'feature-disabled' || type === 'toggle-feature' || type === 'set-feature-on' || type === 'set-feature-off') {
        options = getAutomationFeatureOptions();
    } else if (type === 'page-is' || type === 'open-page') {
        options = PAGE_OPTIONS.map(page => ({ value: page, label: page.toUpperCase() }));
    } else if (type === 'profile-is' || type === 'load-profile') {
        options = getAutomationProfileOptions();
    } else if (type === 'run-macro') {
        options = getAutomationMacroOptions();
    } else if (type === 'apply-preset') {
        options = Object.keys(BUILTIN_HACK_PRESETS).map(key => ({ value: key, label: key.toUpperCase() }));
    } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'setting-note';
        placeholder.textContent = 'No target needed';
        return placeholder;
    }

    const select = document.createElement('select');
    select.className = 'combo-box automation-value-select';
    if (!options.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'NONE';
        select.appendChild(option);
    } else {
        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.label;
            select.appendChild(option);
        });
    }
    select.value = value || '';
    if (!select.value && options.length) {
        select.value = options[0].value;
    }
    select.addEventListener('change', () => setValue(select.value));
    return select;
}

function renderAutomationsList() {
    const list = document.getElementById('automationsList');
    if (!list) return;
    list.innerHTML = '';

    if (!automations.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card macro-empty';
        empty.textContent = 'No automation rules yet. Create one to start.';
        list.appendChild(empty);
        return;
    }

    automations.forEach(rule => {
        const card = document.createElement('div');
        card.className = 'setting-card automation-card';
        const collapsed = isAutomationCollapsed(rule.id);
        card.classList.toggle('collapsed', collapsed);

        const header = document.createElement('div');
        header.className = 'automation-header-row';

        const nameInput = document.createElement('input');
        nameInput.className = 'modal-input automation-name-input';
        nameInput.value = rule.name;
        nameInput.placeholder = 'Automation name';
        nameInput.addEventListener('change', () => {
            updateAutomationRule(rule.id, item => {
                item.name = String(nameInput.value || '').trim() || item.name;
            }, `Automation renamed: ${rule.name}`);
        });

        const enabledWrap = document.createElement('label');
        enabledWrap.className = 'toggle-switch';
        const enabledInput = document.createElement('input');
        enabledInput.type = 'checkbox';
        enabledInput.className = 'toggle-input';
        enabledInput.checked = Boolean(rule.enabled);
        enabledInput.addEventListener('change', () => {
            updateAutomationRule(rule.id, item => {
                item.enabled = enabledInput.checked;
            }, `Automation ${enabledInput.checked ? 'enabled' : 'disabled'}: ${rule.name}`);
        });
        const enabledSlider = document.createElement('span');
        enabledSlider.className = 'toggle-slider';
        enabledWrap.appendChild(enabledInput);
        enabledWrap.appendChild(enabledSlider);

        const runNowBtn = document.createElement('button');
        runNowBtn.className = 'keybind-control-btn';
        runNowBtn.textContent = 'RUN NOW';
        runNowBtn.addEventListener('click', () => {
            const ok = runAutomationAction(rule);
            showNotification(ok ? `Automation ran: ${rule.name}` : `Automation run failed: ${rule.name}`);
        });

        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'keybind-control-btn';
        collapseBtn.textContent = collapsed ? 'EXPAND' : 'COLLAPSE';
        collapseBtn.addEventListener('click', () => {
            setAutomationCollapsed(rule.id, !collapsed);
            renderAutomationsList();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'keybind-control-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        deleteBtn.addEventListener('click', () => deleteAutomation(rule.id));

        header.appendChild(nameInput);
        header.appendChild(enabledWrap);
        header.appendChild(collapseBtn);
        header.appendChild(runNowBtn);
        header.appendChild(deleteBtn);

        const conditionRow = document.createElement('div');
        conditionRow.className = 'automation-row';
        const conditionLabel = document.createElement('span');
        conditionLabel.className = 'automation-row-label';
        conditionLabel.textContent = 'IF';
        const conditionType = document.createElement('select');
        conditionType.className = 'combo-box automation-type-select';
        [
            ['feature-enabled', 'Feature Enabled'],
            ['feature-disabled', 'Feature Disabled'],
            ['page-is', 'Page Is'],
            ['active-hacks-at-least', 'Active Hacks At Least'],
            ['profile-is', 'Profile Is']
        ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            conditionType.appendChild(option);
        });
        conditionType.value = rule.conditionType;
        conditionType.addEventListener('change', () => {
            updateAutomationRule(rule.id, item => {
                item.conditionType = conditionType.value;
                item.conditionValue = getDefaultAutomationConditionValue(conditionType.value);
            }, `Automation condition changed: ${rule.name}`);
        });
        const conditionValueControl = renderAutomationValueControl(rule, 'condition');
        conditionRow.appendChild(conditionLabel);
        conditionRow.appendChild(conditionType);
        conditionRow.appendChild(conditionValueControl);

        const actionRow = document.createElement('div');
        actionRow.className = 'automation-row';
        const actionLabel = document.createElement('span');
        actionLabel.className = 'automation-row-label';
        actionLabel.textContent = 'THEN';
        const actionType = document.createElement('select');
        actionType.className = 'combo-box automation-type-select';
        [
            ['toggle-feature', 'Toggle Feature'],
            ['set-feature-on', 'Enable Feature'],
            ['set-feature-off', 'Disable Feature'],
            ['open-page', 'Open Page'],
            ['load-profile', 'Load Profile'],
            ['run-macro', 'Run Macro'],
            ['apply-preset', 'Apply Preset'],
            ['save-settings', 'Save Settings']
        ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            actionType.appendChild(option);
        });
        actionType.value = rule.actionType;
        actionType.addEventListener('change', () => {
            updateAutomationRule(rule.id, item => {
                item.actionType = actionType.value;
                item.actionValue = getDefaultAutomationActionValue(actionType.value);
            }, `Automation action changed: ${rule.name}`);
        });
        const actionValueControl = renderAutomationValueControl(rule, 'action');
        actionRow.appendChild(actionLabel);
        actionRow.appendChild(actionType);
        actionRow.appendChild(actionValueControl);

        const cooldownRow = document.createElement('div');
        cooldownRow.className = 'automation-row';
        const cooldownLabel = document.createElement('span');
        cooldownLabel.className = 'automation-row-label';
        cooldownLabel.textContent = 'COOLDOWN MS';
        const cooldownInput = document.createElement('input');
        cooldownInput.type = 'number';
        cooldownInput.min = String(AUTOMATION_COOLDOWN_MIN);
        cooldownInput.max = String(AUTOMATION_COOLDOWN_MAX);
        cooldownInput.step = '50';
        cooldownInput.className = 'spinbox automation-cooldown-input';
        cooldownInput.value = String(normalizeAutomationCooldown(rule.cooldownMs));
        cooldownInput.addEventListener('change', () => {
            updateAutomationRule(rule.id, item => {
                item.cooldownMs = normalizeAutomationCooldown(cooldownInput.value);
            }, `Automation cooldown changed: ${rule.name}`);
        });
        cooldownRow.appendChild(cooldownLabel);
        cooldownRow.appendChild(cooldownInput);

        card.appendChild(header);
        card.appendChild(conditionRow);
        card.appendChild(actionRow);
        card.appendChild(cooldownRow);
        list.appendChild(card);
    });

    applyMicroCardAnimations(list);
}

function initializeAutomations() {
    const openBtn = document.getElementById('openAutomationConfigBtn');
    const closeBtn = document.getElementById('closeAutomationConfigBtn');
    const createBtn = document.getElementById('createAutomationBtn');
    const nameInput = document.getElementById('automationNameInput');

    if (openBtn) {
        openBtn.addEventListener('click', openAutomationConfigurator);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAutomationConfigurator);
    }
    if (createBtn) {
        createBtn.addEventListener('click', createAutomationFromInput);
    }
    if (nameInput) {
        nameInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                createAutomationFromInput();
            }
        });
    }

    loadAutomationsFromStorage();
    loadAutomationCollapseStateFromStorage();
    syncAutomationCollapseState();
    syncAutomationRuntimeState();
    renderAutomationsList();
    startAutomationEngine();
}

function initializeWorkflowAndCustomPages() {
    const openWorkflowBtn = document.getElementById('openWorkflowCanvasBtn');
    const closeWorkflowBtn = document.getElementById('closeWorkflowCanvasBtn');
    const closeCustomPagesBtn = document.getElementById('closeCustomPagesBtn');

    if (openWorkflowBtn) {
        openWorkflowBtn.addEventListener('click', openWorkflowCanvasConfigurator);
    }
    if (closeWorkflowBtn) {
        closeWorkflowBtn.addEventListener('click', closeWorkflowCanvasConfigurator);
    }
    if (closeCustomPagesBtn) {
        closeCustomPagesBtn.addEventListener('click', closeCustomPagesConfigurator);
    }
}

function initializeMacros() {
    const openBtn = document.getElementById('openMacroConfigBtn');
    const closeBtn = document.getElementById('closeMacroConfigBtn');
    const createBtn = document.getElementById('createMacroBtn');
    const nameInput = document.getElementById('macroNameInput');

    if (openBtn) {
        openBtn.addEventListener('click', openMacroConfigurator);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMacroConfigurator);
    }
    if (createBtn) {
        createBtn.addEventListener('click', createMacroFromInput);
    }
    if (nameInput) {
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                createMacroFromInput();
            }
        });
    }

    loadMacrosFromStorage();
    loadMacroCollapseStateFromStorage();
    syncMacroCollapseState();
    renderMacrosList();
    detectKeybindConflicts();
}

function openMacroConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    sidebarMacrosUnlocked = true;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('macro-config-mode');
    renderMacrosList();
    applyMicroCardAnimations(document.getElementById('settingsMacrosPage'));
    syncSidebarKeybindLink();
}

function closeMacroConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('macro-config-mode');
    syncSidebarKeybindLink();
}

function openAutomationConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    sidebarAutomationUnlocked = true;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('automation-config-mode');
    renderAutomationsList();
    applyMicroCardAnimations(document.getElementById('settingsAutomationsPage'));
    syncSidebarKeybindLink();
}

function closeAutomationConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('automation-config-mode');
    syncSidebarKeybindLink();
}

function openWorkflowCanvasConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    const plugin = findEnabledPluginByBehavior(PLUGIN_BEHAVIOR_WORKFLOW_CANVAS);
    if (!plugin) {
        const installedPlugin = plugins.find(item =>
            item && (item.behavior === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS || item.id === PLUGIN_BEHAVIOR_WORKFLOW_CANVAS)
        );
        showNotification(installedPlugin ? 'Enable Workflow Canvas plugin first.' : 'Install Workflow Canvas plugin first.');
        return;
    }
    sidebarWorkflowUnlocked = true;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('workflow-canvas-config-mode');
    renderWorkflowCanvasSettingsPage(plugin);
    applyMicroCardAnimations(document.getElementById('settingsWorkflowPage'));
    syncSidebarKeybindLink();
}

function closeWorkflowCanvasConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    syncSidebarKeybindLink();
}

function openCustomPagesConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    const plugin = findEnabledPluginByBehavior(PLUGIN_BEHAVIOR_CUSTOM_PAGE_STUDIO);
    if (!plugin) {
        showNotification('Install and enable Custom Page plugin first.');
        return;
    }
    sidebarCustomPagesUnlocked = true;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('custom-pages-config-mode');
    renderCustomPageStudioSettingsPage(plugin);
    applyMicroCardAnimations(document.getElementById('settingsCustomPagesPage'));
    syncSidebarKeybindLink();
}

function closeCustomPagesConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('custom-pages-config-mode');
    syncSidebarKeybindLink();
}

function openKeybindConfigurator(initialGroup = 'navigation') {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    sidebarKeybindsUnlocked = true;
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('keybind-config-mode');
    setActiveKeybindGroup(initialGroup);
    applyMicroCardAnimations(document.getElementById('settingsKeybindsPage'));
    syncSidebarKeybindLink();
}

function closeKeybindConfigurator() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    syncSidebarKeybindLink();
}

function openDebugDashboard() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    sidebarDebugUnlocked = true;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('marketplace-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('debug-config-mode');
    updateHackDemoControlsUi();
    renderHackDemoPanel();
    renderDebugDashboardChart();
    applyMicroCardAnimations(document.getElementById('settingsDebugPage'));
    syncSidebarKeybindLink();
}

function closeDebugDashboard() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('debug-config-mode');
    syncSidebarKeybindLink();
}

function openPluginMarketplace() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    stopKeybindCapture();
    settingsContainer.classList.remove('keybind-config-mode');
    settingsContainer.classList.remove('macro-config-mode');
    settingsContainer.classList.remove('automation-config-mode');
    settingsContainer.classList.remove('workflow-canvas-config-mode');
    settingsContainer.classList.remove('custom-pages-config-mode');
    settingsContainer.classList.remove('debug-config-mode');
    settingsContainer.classList.remove('theme-studio-config-mode');
    settingsContainer.classList.add('marketplace-config-mode');
    renderMarketplaceList();
    applyMicroCardAnimations(document.getElementById('settingsMarketplacePage'));
    syncSidebarKeybindLink();
}

function closePluginMarketplace() {
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    if (!settingsContainer) return;
    settingsContainer.classList.remove('marketplace-config-mode');
    syncSidebarKeybindLink();
}

function setActiveKeybindGroup(groupName) {
    const validGroup = KEYBIND_GROUP_TITLES[groupName] ? groupName : 'navigation';
    activeKeybindGroup = validGroup;

    const title = document.getElementById('keybindConfigTitle');
    if (title) {
        title.textContent = KEYBIND_GROUP_TITLES[validGroup];
    }

    document.querySelectorAll('.keybind-group-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-keybind-group') === validGroup;
        btn.classList.toggle('active', isActive);
    });

    renderKeybindActions(validGroup);
}

function renderKeybindActions(groupName) {
    const list = document.getElementById('keybindActionsList');
    if (!list) return;

    const actions = getAllKeybindActions().filter(action => action.group === groupName);
    list.innerHTML = '';

    if (!actions.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-card';
        empty.innerHTML = '<div class="setting-note">No items available in this group.</div>';
        list.appendChild(empty);
        return;
    }

    actions.forEach(action => {
        const card = document.createElement('div');
        card.className = 'setting-card keybind-action-card';

        const meta = document.createElement('div');
        meta.className = 'keybind-action-meta';

        const title = document.createElement('div');
        title.className = 'keybind-action-name';
        title.textContent = getActionDisplayName(action.id);

        const hint = document.createElement('div');
        hint.className = 'keybind-action-hint';
        hint.textContent = action.hint;

        meta.appendChild(title);
        meta.appendChild(hint);

        const controls = document.createElement('div');
        controls.className = 'keybind-action-controls';

        const keyBadge = document.createElement('div');
        keyBadge.className = 'keybind-key';
        const keyValue = keybindMap[action.id] || '';
        keyBadge.textContent = keyValue || 'NONE';
        keyBadge.classList.toggle('none', !keyValue);
        const macroActionMatch = String(action.id || '').match(/^macro-run:(.+)$/);
        const actionLogicalKey = macroActionMatch ? `macro:${macroActionMatch[1]}` : `keybind:${action.id}`;
        const actionCombo = keybindConflictState.keybindActionCombos.get(action.id);
        const comboEntries = actionCombo ? (keybindConflictState.comboMap.get(actionCombo) || []) : [];
        const hasConflict = keybindConflictState.keybindConflictActionIds.has(action.id);
        if (hasConflict) {
            keyBadge.classList.add('conflict');
            keyBadge.title = `Conflict with: ${comboEntries
                .filter(entry => String(entry.logicalKey || `${entry.type}:${entry.id}`) !== actionLogicalKey)
                .map(entry => entry.label)
                .join(', ')}`;
        }

        if (action.profileTargetConfig) {
            const targetBadge = document.createElement('div');
            targetBadge.className = 'keybind-key';
            const targetValue = (keybindProfileTargets[action.id] || '').trim();
            targetBadge.textContent = targetValue || 'TARGET: NONE';
            targetBadge.classList.toggle('none', !targetValue);
            controls.appendChild(targetBadge);

            const targetBtn = document.createElement('button');
            targetBtn.className = 'keybind-control-btn';
            targetBtn.textContent = 'SET PROFILE';
            targetBtn.addEventListener('click', () => openProfileTargetConfigPopup(action.id));
            controls.appendChild(targetBtn);
        }

        if (isHoldModeSupportedAction(action)) {
            const modeBadge = document.createElement('div');
            modeBadge.className = 'keybind-key';
            modeBadge.textContent = `MODE: ${getActionKeybindMode(action.id).toUpperCase()}`;
            controls.appendChild(modeBadge);

            const modeBtn = document.createElement('button');
            modeBtn.className = 'keybind-control-btn';
            modeBtn.textContent = 'MODE';
            modeBtn.addEventListener('click', () => openKeybindModePopup(action.id));
            controls.appendChild(modeBtn);
        }

        const configureBtn = document.createElement('button');
        configureBtn.className = 'keybind-control-btn';
        configureBtn.textContent = 'CONFIGURE';
        configureBtn.addEventListener('click', () => startKeybindCapture(action.id, configureBtn));

        const clearBtn = document.createElement('button');
        clearBtn.className = 'keybind-control-btn';
        clearBtn.textContent = 'CLEAR';
        clearBtn.addEventListener('click', () => clearKeybind(action.id));

        controls.appendChild(keyBadge);
        if (hasConflict) {
            const conflictBadge = document.createElement('span');
            conflictBadge.className = 'conflict-badge';
            conflictBadge.textContent = '⚠ Conflict';
            controls.appendChild(conflictBadge);
        }
        controls.appendChild(configureBtn);
        controls.appendChild(clearBtn);

        card.appendChild(meta);
        card.appendChild(controls);
        list.appendChild(card);
    });

    applyMicroCardAnimations(list);
}

function startKeybindCapture(actionId, buttonElement) {
    stopKeybindCapture();
    keybindCapture.actionId = actionId;
    keybindCapture.buttonElement = buttonElement;

    if (buttonElement) {
        buttonElement.classList.add('listening');
        buttonElement.textContent = 'PRESS KEY...';
    }
}

function applyKeybindAssignment(actionId, keyValue, options = {}) {
    const { forceOverride = false } = options;
    const conflictActionId = Object.keys(keybindMap).find(existingId => existingId !== actionId && keybindMap[existingId] === keyValue);
    const previousActionValue = keybindMap[actionId] || '';

    if (conflictActionId && !forceOverride) {
        pendingKeybindConflict = { actionId, keyValue, conflictActionId };
        showNotification(
            `Conflict: "${getActionDisplayName(actionId)}" and "${getActionDisplayName(conflictActionId)}" use ${keyValue}. Use anyway for both?`,
            {
                duration: 8000,
                actionLabel: 'USE ANYWAY',
                onAction: () => {
                    if (!pendingKeybindConflict) return;
                    applyKeybindAssignment(actionId, keyValue, { forceOverride: true });
                    pendingKeybindConflict = null;
                }
            }
        );
        return false;
    }

    keybindMap[actionId] = keyValue;
    saveKeybindMapToStorage();
    renderKeybindActions(activeKeybindGroup);
    showNotification(`Keybind set: ${keyValue}`);
    recordRecentChange(`Keybind changed: ${getActionDisplayName(actionId)} -> ${keyValue}`, () => {
        keybindMap[actionId] = previousActionValue;
        saveKeybindMapToStorage();
        renderKeybindActions(activeKeybindGroup);
    });
    return true;
}

function stopKeybindCapture() {
    if (keybindCapture.buttonElement) {
        keybindCapture.buttonElement.classList.remove('listening');
        keybindCapture.buttonElement.textContent = 'CONFIGURE';
    }
    keybindCapture.actionId = '';
    keybindCapture.buttonElement = null;
}

function clearKeybind(actionId) {
    if (!keybindMap[actionId] && keybindMap[actionId] !== '') return;
    const prev = keybindMap[actionId] || '';
    releaseHeldActionById(actionId);
    keybindMap[actionId] = '';
    saveKeybindMapToStorage();
    renderKeybindActions(activeKeybindGroup);
    showNotification('Keybind cleared.');
    if (prev) {
        recordRecentChange(`Keybind cleared: ${getActionDisplayName(actionId)}`, () => {
            keybindMap[actionId] = prev;
            saveKeybindMapToStorage();
            renderKeybindActions(activeKeybindGroup);
        });
    }
}

function shouldIgnoreKeybindExecution(event) {
    if (event.repeat) return true;
    if (event.ctrlKey || event.metaKey || event.altKey) return true;
    if (isModifierOnlyKey(event.key)) return true;

    const target = event.target;
    if (!target) return false;

    const tag = (target.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

function handleKeybindCaptureInput(event) {
    if (!keybindCapture.actionId) return false;

    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
        stopKeybindCapture();
        showNotification('Keybind capture cancelled.');
        renderKeybindActions(activeKeybindGroup);
        return true;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
        clearKeybind(keybindCapture.actionId);
        stopKeybindCapture();
        return true;
    }

    if (isModifierOnlyKey(event.key)) {
        return true;
    }

    const keyValue = getFormattedKeyFromEvent(event);
    if (!keyValue) return true;

    const assigned = applyKeybindAssignment(keybindCapture.actionId, keyValue);
    stopKeybindCapture();
    if (!assigned) {
        renderKeybindActions(activeKeybindGroup);
    }
    return true;
}

function exportKeybindConfig() {
    const payload = {
        keybinds: keybindMap,
        modes: keybindModeMap,
        profileTargets: keybindProfileTargets,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-keybinds.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Keybind config exported.');
}

function importKeybindConfig(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const previousMap = { ...keybindMap };
            const previousModes = { ...keybindModeMap };
            const previousTargets = { ...keybindProfileTargets };
            const data = JSON.parse(String(reader.result || '{}'));
            const importedMap = normalizeKeybindMap(data.keybinds || data);
            const importedModes = normalizeKeybindModeMap(data.modes || {});
            const importedTargets = normalizeKeybindProfileTargets(data.profileTargets || {});
            keybindMap = importedMap;
            keybindModeMap = importedModes;
            keybindProfileTargets = importedTargets;
            saveKeybindMapToStorage();
            saveKeybindModeMapToStorage();
            saveKeybindProfileTargetsToStorage();
            renderKeybindActions(activeKeybindGroup);
            showNotification('Keybind config imported.');
            recordRecentChange('Imported keybind config', () => {
                keybindMap = normalizeKeybindMap(previousMap);
                keybindModeMap = normalizeKeybindModeMap(previousModes);
                keybindProfileTargets = normalizeKeybindProfileTargets(previousTargets);
                saveKeybindMapToStorage();
                saveKeybindModeMapToStorage();
                saveKeybindProfileTargetsToStorage();
                renderKeybindActions(activeKeybindGroup);
            });
        } catch (error) {
            showNotification('Invalid keybind JSON.');
        }
    };
    reader.readAsText(file);
}

function handleKeybindKeydown(event) {
    if (handleKeybindCaptureInput(event)) return;
    if (shouldIgnoreKeybindExecution(event)) return;

    const keyValue = getFormattedKeyFromEvent(event);
    if (!keyValue) return;

    const actions = findActionsByKeybindValue(keyValue);
    if (!actions.length) return;

    event.preventDefault();
    actions.forEach(action => {
        const actionMode = isHoldModeSupportedAction(action) ? getActionKeybindMode(action.id) : KEYBIND_MODES.TOGGLE;
        if (actionMode === KEYBIND_MODES.HOLD) {
            if (activeHoldKeybindActions.has(action.id)) return;
            const featureName = getFeatureNameFromActionId(action.id);
            if (!featureName) return;
            setFeatureStateByKeybind(featureName, true);
            activeHoldKeybindActions.set(action.id, { keyValue, featureName });
            return;
        }
        action.run();
    });
}

function handleKeybindKeyup(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (isModifierOnlyKey(event.key)) return;

    const keyValue = getFormattedKeyFromEvent(event);
    if (!keyValue) return;
    releaseHeldActionsByKey(keyValue);
}

function getGradientAccentStyleTag() {
    return document.getElementById('nexus-gradient-accent-style');
}

function removeGradientAccentStyle() {
    const existing = getGradientAccentStyleTag();
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }
}

function updateGradientAccentPreview(color1, color2, enabled) {
    const preview = document.getElementById('gradientAccentPreview');
    if (!preview) return;
    preview.style.background = `linear-gradient(90deg, ${color1}, ${color2})`;
    preview.style.opacity = enabled ? '1' : '0.65';
}

function applyGradientAccentRuntime(color1Raw = null) {
    const enabled = getSavedGradientAccentEnabled();
    const color1 = String(color1Raw || localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff').trim();
    const color2 = getSavedGradientAccentColor2();
    updateGradientAccentPreview(color1, color2, enabled);

    if (!enabled) {
        removeGradientAccentStyle();
        return;
    }

    const css = `
:root {
    --accent-gradient: linear-gradient(90deg, ${color1}, ${color2});
    --accent-bright: ${color2};
}

.boot-progress-fill,
.save-btn,
.btn-primary,
.layout-btn.active,
.hud-toggle-btn.is-active,
.toggle-input:checked + .toggle-slider,
.profile-plugin-badge.is-active,
.demo-control-btn.is-active,
.debug-chart-tab.is-active,
.workflow-port-btn.active,
.gradient-accent-preview,
.target-opt[aria-pressed="true"],
.feature-status-chip.on,
.favorite-star.active,
.preset-fav-star.active {
    background: var(--accent-gradient) !important;
}

.nav-btn.active,
.feature-card.is-active,
.feature-search:focus,
.combo-box:focus,
.setting-select:focus,
.spinbox:focus,
.ui-number-wrap:focus-within,
.modal-input:focus,
.sidebar-icon-input:focus,
.save-btn,
.reset-btn,
.btn-primary,
.btn-secondary,
.layout-btn,
.quick-toggle-btn,
.hud-toggle-btn,
.keybind-control-btn,
.keybind-key,
.theme-preset-btn,
.profile-unsaved-indicator,
.header-account-btn,
.gradient-accent-preview,
.setting-tag-experimental,
.target-opt[aria-pressed="true"] {
    border-image: linear-gradient(90deg, ${color1}, ${color2}) 1 !important;
}

.app-name,
.page-title,
.app-subtitle,
.profile-name,
.feature-card h3,
.settings-section h2,
.keybind-config-header h3,
.keybind-subtitle,
.plugin-guide-title,
.debug-dashboard-runtime strong,
.reset-btn,
.btn-secondary,
.layout-btn:not(.active),
.quick-toggle-btn,
.hud-toggle-btn:not(.is-active),
.keybind-control-btn,
.theme-preset-btn,
.modal-close,
.profile-plugin-badge,
.sidebar-toggle,
.welcome-username,
.boot-title,
.accent-text,
.sidebar-icon-reset:hover,
.sidebar-icon-name strong {
    background-image: var(--accent-gradient) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
}

.app-icon::after,
.boot-logo::after,
.slider::-webkit-slider-thumb,
.slider::-moz-range-thumb,
.status-indicator,
.conflict-badge,
.marketplace-status.installed,
.plugin-guide-severity.safe {
    background: var(--accent-gradient) !important;
}

.slider::-webkit-slider-thumb,
.slider::-moz-range-thumb,
.status-indicator,
.conflict-badge,
.marketplace-status.installed,
.plugin-guide-severity.safe {
    border-color: ${color2} !important;
}

.status-indicator,
.favorite-star.active,
.preset-fav-star.active,
.conflict-badge,
.marketplace-status.installed,
.plugin-guide-severity.safe,
.feature-status-chip.on,
.sidebar-icon-reset:hover {
    color: ${color2} !important;
}

.feature-search:focus,
.combo-box:focus,
.setting-select:focus,
.spinbox:focus,
.ui-number-wrap:focus-within,
.modal-input:focus,
.sidebar-icon-input:focus {
    box-shadow: 0 0 10px rgba(${hexToRgbCsv(color2)}, 0.26) !important;
}
`.trim();

    let styleTag = getGradientAccentStyleTag();
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'nexus-gradient-accent-style';
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = css;
}

function setupGradientAccentControls() {
    const accentColor = document.getElementById('accentColor');
    const gradientEnabled = document.getElementById('gradientAccentEnabled');
    const gradientColor2 = document.getElementById('gradientAccentColor2');
    if (!accentColor || !gradientEnabled || !gradientColor2) return;

    gradientEnabled.checked = getSavedGradientAccentEnabled();
    gradientColor2.value = getSavedGradientAccentColor2();
    updateGradientAccentPreview(accentColor.value, gradientColor2.value, gradientEnabled.checked);
    applyGradientAccentRuntime(accentColor.value);

    if (gradientEnabled.dataset.bound === 'true') return;
    gradientEnabled.dataset.bound = 'true';

    const applyFromControls = (persist = true) => {
        const enabled = Boolean(gradientEnabled.checked);
        const color2 = /^#[0-9a-fA-F]{6}$/.test(String(gradientColor2.value || '').trim())
            ? gradientColor2.value
            : '#7c3aed';
        if (persist) {
            localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED, String(enabled));
            localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_2, color2);
        }
        updateGradientAccentPreview(accentColor.value, color2, enabled);
        applyGradientAccentRuntime(accentColor.value);
    };

    gradientEnabled.addEventListener('change', () => {
        applyFromControls(true);
        updateProfileUnsavedIndicator();
    });

    gradientColor2.addEventListener('input', () => {
        applyFromControls(true);
    });
    gradientColor2.addEventListener('change', () => {
        applyFromControls(true);
        updateProfileUnsavedIndicator();
    });

    accentColor.addEventListener('input', () => {
        updateGradientAccentPreview(accentColor.value, gradientColor2.value, gradientEnabled.checked);
        applyGradientAccentRuntime(accentColor.value);
    });
}

function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
        const savedAccent = localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff';
        const savedRadius = localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS) || '8';
        const savedOpacity = localStorage.getItem(STORAGE_KEYS.OPACITY) || '100';

        applyTheme(savedTheme, savedAccent, parseInt(savedRadius), parseInt(savedOpacity));
        setPerformanceMode(getSavedPerformanceMode());
        setUiLockMode(getSavedUiLockMode());
        setFocusMode(getSavedFocusMode());
        setSafetyLockMode(getSavedSafetyLockMode());
    } finally {
        document.documentElement.classList.remove('theme-preload');
    }
}

function applyTheme(theme, accentColor, borderRadius, opacity) {
    // Apply theme class to body
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Apply CSS variables
    const root = document.documentElement;
    const safeOpacity = Math.max(50, Math.min(100, Number(opacity) || 100));
    const accentRgb = hexToRgbCsv(accentColor);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-rgb', accentRgb);
    root.style.setProperty('--accent-bright', lightenColor(accentColor, 20));
    root.style.setProperty('--border-radius', `${borderRadius}px`);
    root.style.setProperty('--opacity', safeOpacity / 100);
    root.style.setProperty('--ui-opacity', safeOpacity / 100);

    // Update accent in border styling
    const accentBorder = `2px solid ${accentColor}`;
    root.style.setProperty('--border-accent', accentBorder);

    // Update all elements with accent color
    updateAccentElements(accentColor);
    applyGradientAccentRuntime(accentColor);
    refreshCustomColorInputDisplays();
    syncMiniHudPipStyles();
}

function updateAccentElements(accentColor) {
    // Update accent color in all relevant elements
    const accentElements = document.querySelectorAll('[class*="accent"]');
    accentElements.forEach(el => {
        if (el.style.borderColor) {
            el.style.borderColor = accentColor;
        }
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function hexToRgbCsv(color, fallback = '0, 217, 255') {
    const raw = String(color || '').trim().replace('#', '');
    if (/^[0-9a-fA-F]{3}$/.test(raw)) {
        const r = parseInt(raw[0] + raw[0], 16);
        const g = parseInt(raw[1] + raw[1], 16);
        const b = parseInt(raw[2] + raw[2], 16);
        return `${r}, ${g}, ${b}`;
    }
    if (/^[0-9a-fA-F]{6}$/.test(raw)) {
        const r = parseInt(raw.slice(0, 2), 16);
        const g = parseInt(raw.slice(2, 4), 16);
        const b = parseInt(raw.slice(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
    return fallback;
}

// ===== NAVIGATION =====
function syncSidebarKeybindLink() {
    const keybindsBtn = document.getElementById('sidebarKeybindsBtn');
    const macrosBtn = document.getElementById('sidebarMacrosBtn');
    const automationBtn = document.getElementById('sidebarAutomationBtn');
    const workflowBtn = document.getElementById('sidebarWorkflowBtn');
    const customPagesBtn = document.getElementById('sidebarCustomPagesBtn');
    const debugBtn = document.getElementById('sidebarDebugBtn');
    const marketplaceBtn = document.getElementById('sidebarMarketplaceBtn');
    const themeStudioBtn = document.getElementById('sidebarThemeStudioBtn');
    if (!keybindsBtn && !macrosBtn && !automationBtn && !workflowBtn && !customPagesBtn && !debugBtn && !marketplaceBtn && !themeStudioBtn) return;

    const settingsPage = document.getElementById('page-settings');
    const settingsActive = Boolean(settingsPage && settingsPage.classList.contains('active'));
    const settingsContainer = document.querySelector('#page-settings .settings-container');
    const keybindMode = Boolean(settingsContainer && settingsContainer.classList.contains('keybind-config-mode'));
    const macroMode = Boolean(settingsContainer && settingsContainer.classList.contains('macro-config-mode'));
    const automationMode = Boolean(settingsContainer && settingsContainer.classList.contains('automation-config-mode'));
    const workflowMode = Boolean(settingsContainer && settingsContainer.classList.contains('workflow-canvas-config-mode'));
    const customPagesMode = Boolean(settingsContainer && settingsContainer.classList.contains('custom-pages-config-mode'));
    const debugMode = Boolean(settingsContainer && settingsContainer.classList.contains('debug-config-mode'));
    const marketplaceMode = Boolean(settingsContainer && settingsContainer.classList.contains('marketplace-config-mode'));
    const themeStudioMode = Boolean(settingsContainer && settingsContainer.classList.contains('theme-studio-config-mode'));

    if (keybindsBtn) {
        const keybindsVisible = settingsActive && keybindMode;
        keybindsBtn.classList.toggle('visible', keybindsVisible);
        keybindsBtn.classList.toggle('active', keybindsVisible);
    }
    if (macrosBtn) {
        const macrosVisible = settingsActive && macroMode;
        macrosBtn.classList.toggle('visible', macrosVisible);
        macrosBtn.classList.toggle('active', macrosVisible);
    }
    if (automationBtn) {
        const automationVisible = settingsActive && automationMode;
        automationBtn.classList.toggle('visible', automationVisible);
        automationBtn.classList.toggle('active', automationVisible);
    }
    if (workflowBtn) {
        const workflowVisible = settingsActive && workflowMode;
        workflowBtn.classList.toggle('visible', workflowVisible);
        workflowBtn.classList.toggle('active', workflowVisible);
    }
    if (customPagesBtn) {
        const customVisible = settingsActive && customPagesMode;
        customPagesBtn.classList.toggle('visible', customVisible);
        customPagesBtn.classList.toggle('active', customVisible);
    }
    if (debugBtn) {
        const debugVisible = settingsActive && debugMode;
        debugBtn.classList.toggle('visible', debugVisible);
        debugBtn.classList.toggle('active', debugVisible);
    }
    if (marketplaceBtn) {
        const marketplaceVisible = settingsActive && marketplaceMode;
        marketplaceBtn.classList.toggle('visible', marketplaceVisible);
        marketplaceBtn.classList.toggle('active', marketplaceVisible);
    }
    if (themeStudioBtn) {
        const themeStudioVisible = settingsActive && themeStudioMode;
        themeStudioBtn.classList.toggle('visible', themeStudioVisible);
        themeStudioBtn.classList.toggle('active', themeStudioVisible);
    }
}

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarKeybindsBtn = document.getElementById('sidebarKeybindsBtn');
    const sidebarMacrosBtn = document.getElementById('sidebarMacrosBtn');
    const sidebarAutomationBtn = document.getElementById('sidebarAutomationBtn');
    const sidebarWorkflowBtn = document.getElementById('sidebarWorkflowBtn');
    const sidebarCustomPagesBtn = document.getElementById('sidebarCustomPagesBtn');
    const sidebarDebugBtn = document.getElementById('sidebarDebugBtn');
    const sidebarMarketplaceBtn = document.getElementById('sidebarMarketplaceBtn');
    const sidebarThemeStudioBtn = document.getElementById('sidebarThemeStudioBtn');

    // Page navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.getAttribute('data-page');
            if (pageName === 'settings') {
                const settingsContainer = document.querySelector('#page-settings .settings-container');
                const keybindMode = Boolean(settingsContainer && settingsContainer.classList.contains('keybind-config-mode'));
                const macroMode = Boolean(settingsContainer && settingsContainer.classList.contains('macro-config-mode'));
                const automationMode = Boolean(settingsContainer && settingsContainer.classList.contains('automation-config-mode'));
                const workflowMode = Boolean(settingsContainer && settingsContainer.classList.contains('workflow-canvas-config-mode'));
                const customPagesMode = Boolean(settingsContainer && settingsContainer.classList.contains('custom-pages-config-mode'));
                const debugMode = Boolean(settingsContainer && settingsContainer.classList.contains('debug-config-mode'));
                const marketplaceMode = Boolean(settingsContainer && settingsContainer.classList.contains('marketplace-config-mode'));
                const themeStudioMode = Boolean(settingsContainer && settingsContainer.classList.contains('theme-studio-config-mode'));
                if (keybindMode || macroMode || automationMode || workflowMode || customPagesMode || debugMode || marketplaceMode || themeStudioMode) {
                    closeKeybindConfigurator();
                    closeMacroConfigurator();
                    closeAutomationConfigurator();
                    closeWorkflowCanvasConfigurator();
                    closeCustomPagesConfigurator();
                    closeDebugDashboard();
                    closePluginMarketplace();
                    closeThemeStudio();
                    updatePageTitle('settings');
                    return;
                }
            }
            selectPage(pageName);
            updatePageTitle(pageName);
        });
    });

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });

    // Restore sidebar state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    if (sidebarKeybindsBtn) {
        sidebarKeybindsBtn.addEventListener('click', () => {
            sidebarKeybindsUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openKeybindConfigurator(activeKeybindGroup || 'navigation');
        });
    }

    if (sidebarMacrosBtn) {
        sidebarMacrosBtn.addEventListener('click', () => {
            sidebarMacrosUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openMacroConfigurator();
        });
    }

    if (sidebarAutomationBtn) {
        sidebarAutomationBtn.addEventListener('click', () => {
            sidebarAutomationUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openAutomationConfigurator();
        });
    }
    if (sidebarWorkflowBtn) {
        sidebarWorkflowBtn.addEventListener('click', () => {
            sidebarWorkflowUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openWorkflowCanvasConfigurator();
        });
    }
    if (sidebarCustomPagesBtn) {
        sidebarCustomPagesBtn.addEventListener('click', () => {
            sidebarCustomPagesUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openCustomPagesConfigurator();
        });
    }

    if (sidebarDebugBtn) {
        sidebarDebugBtn.addEventListener('click', () => {
            sidebarDebugUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openDebugDashboard();
        });
    }
    if (sidebarMarketplaceBtn) {
        sidebarMarketplaceBtn.addEventListener('click', () => {
            sidebarMarketplaceUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openPluginMarketplace();
        });
    }
    if (sidebarThemeStudioBtn) {
        sidebarThemeStudioBtn.addEventListener('click', () => {
            sidebarThemeStudioUnlocked = true;
            selectPage('settings');
            updatePageTitle('settings');
            openThemeStudio();
        });
    }

    syncSidebarKeybindLink();
}

function clearPageSkeletonState() {
    if (pageSkeletonState.timeoutId) {
        clearTimeout(pageSkeletonState.timeoutId);
        pageSkeletonState.timeoutId = null;
    }
    if (typeof pageSkeletonState.cleanup === 'function') {
        pageSkeletonState.cleanup();
    }
    pageSkeletonState.cleanup = null;
}

function shouldUsePageSkeleton(pageName, pageElement) {
    const supportedPages = new Set(['combat', 'hacks', 'visuals', 'movement']);
    if (!supportedPages.has(String(pageName || '').trim().toLowerCase())) return false;
    if (!pageElement) return false;
    return Boolean(pageElement.querySelector('.features-grid .feature-card'));
}

function showPageSkeletonThenReveal(pageElement) {
    if (!pageElement) return;
    const grid = pageElement.querySelector('.features-grid');
    if (!grid) {
        applyMicroCardAnimations(pageElement);
        return;
    }

    const cards = Array.from(grid.querySelectorAll('.feature-card'));
    if (!cards.length) {
        applyMicroCardAnimations(pageElement);
        return;
    }

    clearPageSkeletonState();
    cards.forEach(card => {
        card.dataset.skeletonHidden = 'true';
        card.style.display = 'none';
    });

    const skeletonGrid = document.createElement('div');
    skeletonGrid.className = 'features-grid skeleton-grid';
    const skeletonCount = Math.max(3, Math.min(cards.length, 6));
    for (let i = 0; i < skeletonCount; i += 1) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'skeleton-card';
        skeletonCard.innerHTML = '<div class="skeleton-line"></div><div class="skeleton-line short"></div>';
        skeletonGrid.appendChild(skeletonCard);
    }
    grid.insertAdjacentElement('afterend', skeletonGrid);

    const cleanup = () => {
        if (skeletonGrid.parentNode) {
            skeletonGrid.parentNode.removeChild(skeletonGrid);
        }
        cards.forEach(card => {
            if (card.dataset.skeletonHidden === 'true') {
                card.style.display = '';
                delete card.dataset.skeletonHidden;
            }
        });
    };

    pageSkeletonState.cleanup = cleanup;
    const token = pageSkeletonState.token + 1;
    pageSkeletonState.token = token;
    pageSkeletonState.timeoutId = setTimeout(() => {
        if (token !== pageSkeletonState.token) return;
        cleanup();
        pageSkeletonState.cleanup = null;
        pageSkeletonState.timeoutId = null;
        applyMicroCardAnimations(pageElement);
    }, 180);
}

function selectPage(pageName) {
    if (pageName !== 'settings') {
        closeKeybindConfigurator();
        closeMacroConfigurator();
        closeAutomationConfigurator();
        closeWorkflowCanvasConfigurator();
        closeCustomPagesConfigurator();
        closeDebugDashboard();
        closePluginMarketplace();
        closeThemeStudio();
    }
    closeRadialMenu();
    clearPageSkeletonState();
    document.querySelectorAll('.feature-status-chip.show').forEach(chip => chip.classList.remove('show'));

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    // Show selected page
    const selectedPage = document.getElementById(`page-${pageName}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';
        const useSkeleton = shouldUsePageSkeleton(pageName, selectedPage);
        if (useSkeleton) {
            showPageSkeletonThenReveal(selectedPage);
        } else {
            selectedPage.querySelectorAll('.feature-card').forEach(card => {
                card.style.display = '';
            });
            applyMicroCardAnimations(selectedPage);
        }
        localStorage.setItem(STORAGE_KEYS.LAST_PAGE, pageName);
    }

    // Update active button
    const activeNavPage = (pageName === 'support' || pageName === 'changelog') ? 'about' : pageName;
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-page') === activeNavPage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const multiToolbar = document.getElementById('multiSelectToolbar');
    const pluginRuntimePage = String(pageName || '').startsWith('plugin-');
    const utilityPage = pageName === 'settings' || pageName === 'about' || pageName === 'support' || pageName === 'changelog';
    if (multiToolbar) {
        multiToolbar.classList.toggle('is-hidden', utilityPage || pluginRuntimePage);
    }
    if ((utilityPage || pluginRuntimePage) && multiSelectMode) {
        setMultiSelectMode(false);
    }
    syncSidebarKeybindLink();
}

function updatePageTitle(pageName) {
    const titles = {
        combat: 'COMBAT',
        hacks: 'HACKS',
        visuals: 'VISUALS',
        settings: 'SETTINGS',
        about: 'ABOUT',
        support: 'SUPPORT',
        changelog: 'CHANGELOG'
    };
    const dynamicTitle = dynamicPluginPageTitles.get(String(pageName || '').trim());
    document.querySelector('.page-title').textContent = dynamicTitle || titles[pageName] || 'MINECRAFT HACKS';
}

// ===== LAYOUT TOGGLE =====
function initializeLayoutToggle() {
    const gridLayoutBtn = document.getElementById('gridLayoutBtn');
    const listLayoutBtn = document.getElementById('listLayoutBtn');
    const initialLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT) === 'list' ? 'list' : 'grid';

    applyLayout(initialLayout);
    localStorage.setItem(STORAGE_KEYS.LAYOUT, initialLayout);

    gridLayoutBtn.addEventListener('click', () => {
        const previousLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT) === 'list' ? 'list' : 'grid';
        if (previousLayout === 'grid') return;
        applyLayout('grid');
        gridLayoutBtn.classList.add('active');
        listLayoutBtn.classList.remove('active');
        localStorage.setItem(STORAGE_KEYS.LAYOUT, 'grid');
        if (!suspendRecentTracking) {
            recordRecentChange('Layout set to grid', () => {
                applyLayout(previousLayout);
                localStorage.setItem(STORAGE_KEYS.LAYOUT, previousLayout);
            });
        }
    });

    listLayoutBtn.addEventListener('click', () => {
        const previousLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT) === 'list' ? 'list' : 'grid';
        if (previousLayout === 'list') return;
        applyLayout('list');
        listLayoutBtn.classList.add('active');
        gridLayoutBtn.classList.remove('active');
        localStorage.setItem(STORAGE_KEYS.LAYOUT, 'list');
        if (!suspendRecentTracking) {
            recordRecentChange('Layout set to list', () => {
                applyLayout(previousLayout);
                localStorage.setItem(STORAGE_KEYS.LAYOUT, previousLayout);
            });
        }
    });
}

function applyLayout(layout) {
    const grids = document.querySelectorAll('.features-grid');
    grids.forEach(grid => {
        if (layout === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    });

    const gridLayoutBtn = document.getElementById('gridLayoutBtn');
    const listLayoutBtn = document.getElementById('listLayoutBtn');
    
    if (layout === 'grid') {
        gridLayoutBtn.classList.add('active');
        listLayoutBtn.classList.remove('active');
    } else {
        listLayoutBtn.classList.add('active');
        gridLayoutBtn.classList.remove('active');
    }
}

// ===== PROFILE MANAGEMENT =====
function initializeProfiles() {
    const newProfileBtn = document.getElementById('newProfileBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileModal = document.getElementById('profileModal');

    newProfileBtn.addEventListener('click', () => {
        if (!isRoleAllowed('profiles')) {
            showNotification('Profile editing is blocked for this profile role.');
            return;
        }
        showNewProfileModal();
    });

    editProfileBtn.addEventListener('click', () => {
        if (!isRoleAllowed('profiles')) {
            showNotification('Profile editing is blocked for this profile role.');
            return;
        }
        showEditProfileModal();
    });

    closeProfileModal.addEventListener('click', () => {
        profileModal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
    });

    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
            setProfileModalTitle('Profile Manager');
        }
    });

    // Load profiles on init
    loadProfiles();
}

function loadProfiles() {
    const profilesList = document.getElementById('profilesList');
    ensureProfilesAndRolesConsistency();
    const profilesData = getProfilesDataFromStorage();
    const profileRoles = getProfileRoleMap();
    const roleDefinitions = getRoleDefinitionsFromStorage();
    const currentProfile = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    const favoriteProfiles = getFavoriteProfiles();

    profilesList.innerHTML = '';

    Object.keys(profilesData).forEach(profileName => {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        if (profileName === currentProfile) {
            profileItem.classList.add('active');
        }

        const nameEl = document.createElement('span');
        nameEl.className = 'profile-item-name';
        nameEl.textContent = profileName;

        const roleChip = document.createElement('span');
        const roleName = normalizeProfileRoleName(profileRoles[profileName], profileName === 'Default' ? PROFILE_ROLES.ADMIN : PROFILE_ROLES.STANDARD);
        roleChip.className = `profile-role-chip ${roleName === PROFILE_ROLES.ADMIN || roleName === PROFILE_ROLES.STANDARD || roleName === PROFILE_ROLES.RESTRICTED || roleName === PROFILE_ROLES.INCOGNITO ? roleName : 'custom'}`;
        roleChip.textContent = normalizeRoleLabel(roleDefinitions[roleName]?.label, roleName).toUpperCase();

        const favoriteBtn = document.createElement('span');
        favoriteBtn.className = 'favorite-star';
        favoriteBtn.textContent = favoriteProfiles.includes(profileName) ? '\u2605' : '\u2606';
        if (favoriteProfiles.includes(profileName)) favoriteBtn.classList.add('active');
        favoriteBtn.title = 'Favorite profile';
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const previousFavorites = getFavoriteProfiles();
            let next = getFavoriteProfiles();
            if (next.includes(profileName)) {
                next = next.filter(x => x !== profileName);
            } else {
                next.unshift(profileName);
            }
            saveFavoriteProfiles(next);
            loadProfiles();
            setupQuickToggle();
            recordRecentChange(
                `Profile favorite ${next.includes(profileName) ? 'added' : 'removed'}: ${profileName}`,
                () => {
                    saveFavoriteProfiles(previousFavorites);
                    loadProfiles();
                    setupQuickToggle();
                }
            );
        });

        const nameWrap = document.createElement('div');
        nameWrap.style.display = 'flex';
        nameWrap.style.alignItems = 'center';
        nameWrap.style.gap = '8px';
        nameWrap.appendChild(nameEl);
        if (profileBadgesPlusRuntimeEnabled) {
            profileItem.classList.add('profile-item-enhanced');
            const badges = document.createElement('div');
            badges.className = 'profile-plugin-badges';
            if (profileName === currentProfile) {
                badges.appendChild(createProfileRuntimeBadge('ACTIVE', 'is-active'));
            }
            if (favoriteProfiles.includes(profileName)) {
                badges.appendChild(createProfileRuntimeBadge('FAVORITE', 'is-favorite'));
            }
            if (profileName === 'Default') {
                badges.appendChild(createProfileRuntimeBadge('CORE', 'is-core'));
            }
            if (profileName === 'Incognito') {
                badges.appendChild(createProfileRuntimeBadge('INCOGNITO', 'is-core'));
            }
            if (badges.children.length) {
                nameWrap.appendChild(badges);
            }
        }
        nameWrap.appendChild(roleChip);
        nameWrap.appendChild(favoriteBtn);

        const actions = document.createElement('div');
        actions.className = 'profile-item-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'profile-item-btn';
        loadBtn.textContent = 'LOAD';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadProfile(profileName);
        });

        actions.appendChild(loadBtn);

        profileItem.appendChild(nameWrap);
        profileItem.appendChild(actions);
        profileItem.addEventListener('click', () => loadProfile(profileName));
        profilesList.appendChild(profileItem);
    });

    applyMicroCardAnimations(profilesList);

    // Update profile indicator in sidebar
    document.getElementById('profileName').textContent = currentProfile;
    updateMiniHudData();
    updateProfileUnsavedIndicator();
    applyRoleBasedControlState();
}

function setProfileModalTitle(titleText = 'Profile Manager') {
    const modalTitle = document.querySelector('#profileModal .modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = titleText;
    }
}

function getCurrentPluginsForProfileData() {
    const inMemory = Array.isArray(plugins) ? plugins : [];
    const source = inMemory.length
        ? inMemory
        : safeParseStoredJson(localStorage.getItem(STORAGE_KEYS.PLUGINS), []);
    return normalizePluginList(source);
}

function applyPluginsForProfile(profilePluginsRaw) {
    const normalizedPlugins = normalizePluginList(Array.isArray(profilePluginsRaw) ? profilePluginsRaw : []);
    plugins = normalizedPlugins;
    savePluginsToStorage();
    applyPluginRuntimeEffects();
    renderPluginsList();
    syncDynamicKeybindActions(true);
}

function buildCurrentProfileData() {
    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const layout = localStorage.getItem(STORAGE_KEYS.LAYOUT) || 'grid';

    return {
        theme: themeSelect ? themeSelect.value : (localStorage.getItem(STORAGE_KEYS.THEME) || 'dark'),
        accent: accentColor ? accentColor.value : (localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff'),
        gradientAccentEnabled: gradientAccentEnabled ? gradientAccentEnabled.checked : getSavedGradientAccentEnabled(),
        gradientAccent2: /^#[0-9a-fA-F]{6}$/.test(String(gradientAccentColor2 ? gradientAccentColor2.value : '').trim())
            ? gradientAccentColor2.value
            : getSavedGradientAccentColor2(),
        borderRadius: borderRadiusSlider ? borderRadiusSlider.value : (localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS) || '8'),
        opacity: opacitySlider ? opacitySlider.value : (localStorage.getItem(STORAGE_KEYS.OPACITY) || '100'),
        layout,
        features: localStorage.getItem(STORAGE_KEYS.FEATURES) || '{}',
        buttonSoundsEnabled: enableButtonSounds ? enableButtonSounds.checked : getSavedButtonSoundEnabled(),
        buttonSoundType: buttonSoundSelect ? buttonSoundSelect.value : getSavedButtonSoundType(),
        buttonSoundVolume: buttonSoundVolume ? clampVolumePercent(buttonSoundVolume.value, 65) : getSavedButtonSoundVolume(),
        switchSoundsEnabled: enableSwitchSounds ? enableSwitchSounds.checked : getSavedSwitchSoundEnabled(),
        switchSoundType: switchSoundSelect ? switchSoundSelect.value : getSavedSwitchSoundType(),
        switchSoundVolume: switchSoundVolume ? clampVolumePercent(switchSoundVolume.value, 70) : getSavedSwitchSoundVolume(),
        performanceMode: getSavedPerformanceMode(),
        uiLockMode: getSavedUiLockMode(),
        focusMode: enableFocusMode ? enableFocusMode.checked : getSavedFocusMode(),
        safetyLockMode: enableSafetyLockMode ? enableSafetyLockMode.checked : getSavedSafetyLockMode(),
        safetyLockHoldMs: normalizeSafetyLockHoldMs(safetyLockHoldSlider ? safetyLockHoldSlider.value : getSavedSafetyLockHoldMs()),
        bootPowerConfirm: enableBootPowerConfirm ? enableBootPowerConfirm.checked : getSavedBootPowerConfirm(),
        themeStudio: getSavedThemeStudioSettings(),
        plugins: getCurrentPluginsForProfileData()
    };
}

function cloneProfile(sourceProfileName) {
    if (!isRoleAllowed('profiles')) {
        showNotification('Profile clone is blocked for this profile role.');
        return;
    }
    const profilesData = getProfilesDataFromStorage();
    const sourceData = profilesData[sourceProfileName] || buildCurrentProfileData();
    const defaultName = `${sourceProfileName} Copy`;
    const cloneNameRaw = prompt('Name for cloned profile:', defaultName);
    const cloneName = (cloneNameRaw || '').trim();

    if (!cloneName) {
        showNotification('Clone cancelled');
        return;
    }

    if (profilesData[cloneName]) {
        showNotification('This profile already exists!');
        return;
    }

    profilesData[cloneName] = JSON.parse(JSON.stringify(sourceData));
    saveProfilesDataToStorage(profilesData);
    setProfileRole(cloneName, PROFILE_ROLES.STANDARD, { silent: true });
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, cloneName);
    loadProfile(cloneName);
}

function showNewProfileModal() {
    const modal = document.getElementById('profileModal');
    const modalBody = document.getElementById('profileModalBody');
    setProfileModalTitle('Profile Manager');

    modalBody.innerHTML = `
        <input type="text" class="modal-input" id="newProfileName" placeholder="Profile name...">
        <div class="modal-buttons">
            <button class="modal-btn confirm" onclick="createProfile(document.getElementById('newProfileName').value)">CREATE</button>
            <button class="modal-btn cancel" onclick="document.getElementById('profileModal').classList.remove('active')">CANCEL</button>
        </div>
    `;

    modal.classList.add('active');
    document.getElementById('newProfileName').focus();
    document.getElementById('newProfileName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createProfile(e.target.value);
        }
    });
}

function showEditProfileModal() {
    if (!isRoleAllowed('profiles')) {
        showNotification('Profile editing is blocked for this profile role.');
        return;
    }
    const modal = document.getElementById('profileModal');
    const modalBody = document.getElementById('profileModalBody');
    const profilesData = getProfilesDataFromStorage();
    const profileRoles = getProfileRoleMap();
    const roleDefinitions = getRoleDefinitionsFromStorage();
    setProfileModalTitle('Profile Manager');
    modalBody.innerHTML = '';

    const roleManagerCard = document.createElement('div');
    roleManagerCard.className = 'setting-card';
    const roleManagerTitle = document.createElement('label');
    roleManagerTitle.textContent = 'Role Permissions';
    roleManagerCard.appendChild(roleManagerTitle);
    const roleManagerNote = document.createElement('p');
    roleManagerNote.className = 'setting-note';
    roleManagerNote.textContent = 'Create custom roles and toggle permissions per role. System roles are protected.';
    roleManagerCard.appendChild(roleManagerNote);

    const roleCreateRow = document.createElement('div');
    roleCreateRow.className = 'setting-inline-controls';
    const roleNameInput = document.createElement('input');
    roleNameInput.className = 'modal-input';
    roleNameInput.placeholder = 'New role name...';
    roleNameInput.style.maxWidth = '220px';
    const roleCreateBtn = document.createElement('button');
    roleCreateBtn.className = 'btn-secondary';
    roleCreateBtn.textContent = 'CREATE ROLE';
    roleCreateBtn.addEventListener('click', () => {
        if (createCustomRole(roleNameInput.value)) {
            showEditProfileModal();
        }
    });
    roleNameInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        if (createCustomRole(roleNameInput.value)) {
            showEditProfileModal();
        }
    });
    roleCreateRow.appendChild(roleNameInput);
    roleCreateRow.appendChild(roleCreateBtn);
    roleManagerCard.appendChild(roleCreateRow);

    const roleList = document.createElement('div');
    roleList.style.display = 'flex';
    roleList.style.flexDirection = 'column';
    roleList.style.gap = '8px';
    Object.entries(roleDefinitions).forEach(([roleKey, roleDef]) => {
        const roleRow = document.createElement('div');
        roleRow.style.border = '1px solid #333333';
        roleRow.style.borderRadius = '6px';
        roleRow.style.padding = '8px';
        roleRow.style.background = '#111111';

        const roleHeader = document.createElement('div');
        roleHeader.style.display = 'flex';
        roleHeader.style.alignItems = 'center';
        roleHeader.style.justifyContent = 'space-between';
        roleHeader.style.gap = '8px';
        const roleHeaderLabel = document.createElement('strong');
        roleHeaderLabel.textContent = `${normalizeRoleLabel(roleDef.label, roleKey).toUpperCase()}${roleDef.protected ? ' (SYSTEM)' : ''}`;
        roleHeaderLabel.style.fontSize = '12px';
        roleHeaderLabel.style.letterSpacing = '0.6px';
        roleHeader.appendChild(roleHeaderLabel);
        if (!roleDef.protected && !Object.prototype.hasOwnProperty.call(DEFAULT_ROLE_DEFINITIONS, roleKey)) {
            const deleteRoleBtn = document.createElement('button');
            deleteRoleBtn.className = 'profile-item-btn';
            deleteRoleBtn.textContent = 'DELETE ROLE';
            deleteRoleBtn.setAttribute('data-safety-lock', 'required');
            deleteRoleBtn.addEventListener('click', () => {
                if (deleteCustomRole(roleKey)) {
                    showEditProfileModal();
                }
            });
            roleHeader.appendChild(deleteRoleBtn);
        }
        roleRow.appendChild(roleHeader);

        const capabilitiesWrap = document.createElement('div');
        capabilitiesWrap.style.display = 'grid';
        capabilitiesWrap.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
        capabilitiesWrap.style.gap = '6px';
        capabilitiesWrap.style.marginTop = '8px';
        ROLE_CAPABILITY_KEYS.forEach(capabilityKey => {
            const capLabel = document.createElement('label');
            capLabel.style.display = 'flex';
            capLabel.style.alignItems = 'center';
            capLabel.style.gap = '6px';
            capLabel.style.fontSize = '11px';
            capLabel.style.color = 'var(--text-secondary)';
            const capToggle = document.createElement('input');
            capToggle.type = 'checkbox';
            capToggle.checked = Boolean(roleDef.capabilities && roleDef.capabilities[capabilityKey]);
            capToggle.disabled = Boolean(roleDef.protected);
            capToggle.addEventListener('change', () => {
                setRoleCapability(roleKey, capabilityKey, capToggle.checked);
                showEditProfileModal();
            });
            capLabel.appendChild(capToggle);
            capLabel.appendChild(document.createTextNode(ROLE_CAPABILITY_LABELS[capabilityKey] || capabilityKey));
            capabilitiesWrap.appendChild(capLabel);
        });
        roleRow.appendChild(capabilitiesWrap);
        roleList.appendChild(roleRow);
    });
    roleManagerCard.appendChild(roleList);

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';
    list.style.marginTop = '10px';

    const editableProfiles = Object.keys(profilesData).filter(name => !CORE_PROFILE_NAMES.has(name));
    if (!editableProfiles.length) {
        const empty = document.createElement('div');
        empty.className = 'setting-note';
        empty.textContent = 'No editable profiles yet.';
        list.appendChild(empty);
    }

    editableProfiles.forEach(profileName => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.gap = '10px';
        row.style.padding = '10px';
        row.style.backgroundColor = '#111111';
        row.style.border = '2px solid #333333';
        row.style.borderRadius = '4px';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'modal-input';
        nameInput.value = profileName;
        nameInput.style.margin = '0';
        nameInput.style.maxWidth = '220px';
        nameInput.style.flex = '1 1 auto';
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                renameProfile(profileName, nameInput.value);
            }
        });

        const roleSelect = document.createElement('select');
        roleSelect.className = 'combo-box';
        roleSelect.style.maxWidth = '180px';
        Object.entries(roleDefinitions).forEach(([roleKey, roleDef]) => {
            const option = document.createElement('option');
            option.value = roleKey;
            option.textContent = normalizeRoleLabel(roleDef.label, roleKey).toUpperCase();
            roleSelect.appendChild(option);
        });
        roleSelect.value = normalizeProfileRoleName(profileRoles[profileName], PROFILE_ROLES.STANDARD, roleDefinitions);
        roleSelect.addEventListener('change', () => {
            setProfileRole(profileName, roleSelect.value);
            profileRoles[profileName] = roleSelect.value;
        });

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';

        const renameBtn = document.createElement('button');
        renameBtn.className = 'profile-item-btn';
        renameBtn.textContent = 'SAVE';
        renameBtn.addEventListener('click', () => renameProfile(profileName, nameInput.value));

        const cloneBtn = document.createElement('button');
        cloneBtn.className = 'profile-item-btn';
        cloneBtn.textContent = 'CLONE';
        cloneBtn.addEventListener('click', () => cloneProfile(profileName));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'profile-item-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.setAttribute('data-safety-lock', 'required');
        deleteBtn.addEventListener('click', () => deleteProfile(profileName));

        actions.appendChild(renameBtn);
        actions.appendChild(cloneBtn);
        actions.appendChild(deleteBtn);

        row.appendChild(nameInput);
        row.appendChild(roleSelect);
        row.appendChild(actions);
        list.appendChild(row);
    });

    const coreNote = document.createElement('p');
    coreNote.className = 'setting-note';
    coreNote.textContent = 'Core profiles: DEFAULT (ADMIN, protected) and INCOGNITO (read-only, protected).';
    list.appendChild(coreNote);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-btn cancel';
    closeBtn.style.marginTop = '15px';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setProfileModalTitle('Profile Manager');
    });

    modalBody.appendChild(roleManagerCard);
    modalBody.appendChild(list);
    modalBody.appendChild(closeBtn);
    modal.classList.add('active');
    applyMicroCardAnimations(modalBody);
}

function renameProfile(oldName, newNameRaw) {
    if (!isRoleAllowed('profiles')) {
        showNotification('Profile rename is blocked for this profile role.');
        return;
    }
    const sourceName = String(oldName || '').trim();
    const targetName = String(newNameRaw || '').trim();

    if (!sourceName || CORE_PROFILE_NAMES.has(sourceName)) {
        showNotification('Core profiles cannot be renamed.');
        return;
    }
    if (!targetName) {
        showNotification('Please enter a profile name!');
        return;
    }
    if (targetName === sourceName) {
        return;
    }

    const profilesData = getProfilesDataFromStorage();
    if (!Object.prototype.hasOwnProperty.call(profilesData, sourceName)) {
        showNotification('Profile not found.');
        return;
    }
    if (Object.prototype.hasOwnProperty.call(profilesData, targetName)) {
        showNotification('This profile already exists!');
        return;
    }

    profilesData[targetName] = profilesData[sourceName];
    delete profilesData[sourceName];
    saveProfilesDataToStorage(profilesData);

    const currentProfile = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfile === sourceName) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, targetName);
    }

    const favorites = getFavoriteProfiles();
    if (favorites.includes(sourceName)) {
        saveFavoriteProfiles(favorites.map(name => name === sourceName ? targetName : name));
    }

    const roleMap = getProfileRoleMap();
    if (roleMap[sourceName]) {
        roleMap[targetName] = roleMap[sourceName];
        delete roleMap[sourceName];
        saveProfileRoleMap(roleMap);
    }

    Object.keys(keybindProfileTargets).forEach(actionId => {
        if (keybindProfileTargets[actionId] === sourceName) {
            keybindProfileTargets[actionId] = targetName;
        }
    });
    saveKeybindProfileTargetsToStorage();
    renderKeybindActions(activeKeybindGroup);

    showNotification(`Profile renamed: "${sourceName}" -> "${targetName}"`);
    loadProfiles();
    setupQuickToggle();
    showEditProfileModal();
}

function createProfile(profileName) {
    if (!isRoleAllowed('profiles')) {
        showNotification('Profile creation is blocked for this profile role.');
        return;
    }
    if (!profileName || profileName.trim() === '') {
        showNotification('Please enter a profile name!');
        return;
    }

    const nextName = String(profileName || '').trim();
    if (CORE_PROFILE_NAMES.has(nextName)) {
        showNotification('This profile name is reserved.');
        return;
    }

    const profilesData = getProfilesDataFromStorage();

    if (profilesData[nextName]) {
        showNotification('This profile already exists!');
        return;
    }

    const profileData = buildCurrentProfileData();

    profilesData[nextName] = profileData;
    saveProfilesDataToStorage(profilesData);
    setProfileRole(nextName, PROFILE_ROLES.STANDARD, { silent: true });
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, nextName);

    showNotification(`Profile "${nextName}" created!`);
    document.getElementById('profileModal').classList.remove('active');
    loadProfiles();
}

function loadProfile(profileName) {
    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfileName !== profileName && currentProfileName !== 'Incognito') {
        const currentProfilesData = getProfilesDataFromStorage();
        currentProfilesData[currentProfileName] = buildCurrentProfileData();
        saveProfilesDataToStorage(currentProfilesData);
    }

    const profilesData = getProfilesDataFromStorage();
    const profileData = profilesData[profileName];

    if (!profileData) {
        localStorage.removeItem(STORAGE_KEYS.THEME);
        localStorage.removeItem(STORAGE_KEYS.ACCENT);
        localStorage.removeItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED);
        localStorage.removeItem(STORAGE_KEYS.GRADIENT_ACCENT_2);
        localStorage.removeItem(STORAGE_KEYS.BORDER_RADIUS);
        localStorage.removeItem(STORAGE_KEYS.OPACITY);
        localStorage.removeItem(STORAGE_KEYS.LAYOUT);
        localStorage.removeItem(STORAGE_KEYS.FEATURES);
        localStorage.removeItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED);
        localStorage.removeItem(STORAGE_KEYS.BUTTON_SOUND_TYPE);
        localStorage.removeItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME);
        localStorage.removeItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED);
        localStorage.removeItem(STORAGE_KEYS.SWITCH_SOUND_TYPE);
        localStorage.removeItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME);
        localStorage.removeItem(STORAGE_KEYS.PERFORMANCE_MODE);
        localStorage.removeItem(STORAGE_KEYS.LOCK_UI_MODE);
        localStorage.removeItem(STORAGE_KEYS.FOCUS_MODE);
        localStorage.removeItem(STORAGE_KEYS.SAFETY_LOCK_MODE);
        localStorage.removeItem(STORAGE_KEYS.BOOT_POWER_CONFIRM);
        localStorage.removeItem(STORAGE_KEYS.THEME_STUDIO);
        applyTheme('dark', '#00d9ff', 8, 100);
        applyLayout('grid');
        setRuntimeSoundSettings(false, 'nexus-soft', 65);
        setRuntimeSwitchSoundSettings(false, 'clean-toggle', 70);
        setPerformanceMode(false);
        setUiLockMode(false);
        setFocusMode(false);
        setSafetyLockMode(false);
        applyThemeStudioSettings(getDefaultThemeStudioSettings(), { persist: false });
        syncThemeStudioControlsFromSettings(getDefaultThemeStudioSettings());
        localStorage.removeItem(STORAGE_KEYS.PLUGINS);
        applyPluginsForProfile([]);
    } else {
        const profileTheme = profileData.theme || 'dark';
        const profileAccent = profileData.accent || '#00d9ff';
        const profileGradientAccentEnabled = profileData.gradientAccentEnabled === true || profileData.gradientAccentEnabled === 'true';
        const profileGradientAccent2 = /^#[0-9a-fA-F]{6}$/.test(String(profileData.gradientAccent2 || '').trim())
            ? String(profileData.gradientAccent2).trim()
            : '#7c3aed';
        const profileRadius = Math.max(0, Math.min(20, parseNumberWithFallback(profileData.borderRadius, 8)));
        const profileOpacity = Math.max(50, Math.min(100, parseNumberWithFallback(profileData.opacity, 100)));
        const profileLayout = profileData.layout === 'list' ? 'list' : 'grid';

        localStorage.setItem(STORAGE_KEYS.THEME, profileTheme);
        localStorage.setItem(STORAGE_KEYS.ACCENT, profileAccent);
        localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED, String(profileGradientAccentEnabled));
        localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_2, profileGradientAccent2);
        localStorage.setItem(STORAGE_KEYS.BORDER_RADIUS, String(profileRadius));
        localStorage.setItem(STORAGE_KEYS.OPACITY, String(profileOpacity));
        localStorage.setItem(STORAGE_KEYS.LAYOUT, profileLayout);
        localStorage.setItem(STORAGE_KEYS.FEATURES, profileData.features || '{}');

        const profileButtonSoundsEnabled = profileData.buttonSoundsEnabled === true || profileData.buttonSoundsEnabled === 'true';
        const profileButtonSoundType = BUTTON_SOUND_PRESETS[profileData.buttonSoundType] ? profileData.buttonSoundType : 'nexus-soft';
        const profileButtonSoundVolume = clampVolumePercent(profileData.buttonSoundVolume, 65);
        localStorage.setItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED, String(profileButtonSoundsEnabled));
        localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_TYPE, profileButtonSoundType);
        localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME, String(profileButtonSoundVolume));

        const profileSwitchSoundsEnabled = profileData.switchSoundsEnabled === true || profileData.switchSoundsEnabled === 'true';
        const profileSwitchSoundType = FEATURE_SWITCH_SOUND_PRESETS[profileData.switchSoundType] ? profileData.switchSoundType : 'clean-toggle';
        const profileSwitchSoundVolume = clampVolumePercent(profileData.switchSoundVolume, 70);
        localStorage.setItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED, String(profileSwitchSoundsEnabled));
        localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_TYPE, profileSwitchSoundType);
        localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME, String(profileSwitchSoundVolume));

        const profilePerformanceMode = profileData.performanceMode === true || profileData.performanceMode === 'true';
        const profileUiLockMode = profileData.uiLockMode === true || profileData.uiLockMode === 'true';
        const profileFocusMode = profileData.focusMode === true || profileData.focusMode === 'true';
        const profileSafetyLockMode = profileData.safetyLockMode === true || profileData.safetyLockMode === 'true';
        const profileSafetyLockHoldMs = normalizeSafetyLockHoldMs(profileData.safetyLockHoldMs ?? getSavedSafetyLockHoldMs());
        const profileBootPowerConfirm = profileData.bootPowerConfirm === false || profileData.bootPowerConfirm === 'false'
            ? false
            : true;
        const profileThemeStudio = normalizeThemeStudioSettings(profileData.themeStudio || getDefaultThemeStudioSettings());
        localStorage.setItem(STORAGE_KEYS.PERFORMANCE_MODE, String(profilePerformanceMode));
        localStorage.setItem(STORAGE_KEYS.LOCK_UI_MODE, String(profileUiLockMode));
        localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, String(profileFocusMode));
        localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_MODE, String(profileSafetyLockMode));
        localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS, String(profileSafetyLockHoldMs));
        localStorage.setItem(STORAGE_KEYS.BOOT_POWER_CONFIRM, String(profileBootPowerConfirm));
        localStorage.setItem(STORAGE_KEYS.THEME_STUDIO, JSON.stringify(profileThemeStudio));

        applyTheme(profileTheme, profileAccent, profileRadius, profileOpacity);
        applyLayout(profileLayout);
        setRuntimeSoundSettings(profileButtonSoundsEnabled, profileButtonSoundType, profileButtonSoundVolume);
        setRuntimeSwitchSoundSettings(profileSwitchSoundsEnabled, profileSwitchSoundType, profileSwitchSoundVolume);
        setPerformanceMode(profilePerformanceMode);
        setUiLockMode(profileUiLockMode);
        setFocusMode(profileFocusMode);
        setSafetyLockMode(profileSafetyLockMode);
        setSafetyLockHoldMs(profileSafetyLockHoldMs, { persist: false });
        applyThemeStudioSettings(profileThemeStudio, { persist: false });
        syncThemeStudioControlsFromSettings(profileThemeStudio);
        applyPluginsForProfile(profileData.plugins);
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileName);
    loadSettings();
    syncSettingsControls();

    showNotification(`Profile "${profileName}" loaded!`);
    loadProfiles();
}

function deleteProfile(profileName) {
    if (!isRoleAllowed('profiles') || !isRoleAllowed('destructive')) {
        showNotification('Profile delete is blocked for this profile role.');
        return;
    }
    if (CORE_PROFILE_NAMES.has(profileName)) {
        showNotification('Core profiles cannot be deleted.');
        return;
    }

    if (!confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
        return;
    }

    const profilesData = getProfilesDataFromStorage();
    delete profilesData[profileName];
    saveProfilesDataToStorage(profilesData);
    const roleMap = getProfileRoleMap();
    delete roleMap[profileName];
    saveProfileRoleMap(roleMap);

    saveFavoriteProfiles(getFavoriteProfiles().filter(name => name !== profileName));

    Object.keys(keybindProfileTargets).forEach(actionId => {
        if (keybindProfileTargets[actionId] === profileName) {
            keybindProfileTargets[actionId] = '';
        }
    });
    saveKeybindProfileTargetsToStorage();
    renderKeybindActions(activeKeybindGroup);

    showNotification(`Profile "${profileName}" deleted!`);
    loadProfiles();
    setupQuickToggle();

    const modal = document.getElementById('profileModal');
    if (modal && modal.classList.contains('active')) {
        showEditProfileModal();
    }
}

// ===== SETTINGS =====
function initializeSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const gradientAccentPreview = document.getElementById('gradientAccentPreview');
    const themePresetButtons = document.querySelectorAll('[data-theme-preset]');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const borderRadiusInput = document.getElementById('borderRadiusInput');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityInput = document.getElementById('opacityInput');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const buttonSoundVolumeInput = document.getElementById('buttonSoundVolumeInput');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const switchSoundVolumeInput = document.getElementById('switchSoundVolumeInput');
    const previewButtonSoundBtn = document.getElementById('previewButtonSoundBtn');
    const previewSwitchSoundBtn = document.getElementById('previewSwitchSoundBtn');
    const enablePerformanceMode = document.getElementById('enablePerformanceMode');
    const enableUiLockMode = document.getElementById('enableUiLockMode');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const safetyLockHoldInput = document.getElementById('safetyLockHoldInput');
    const safetyLockHoldPreview = document.getElementById('safetyLockHoldPreview');
    const startupPageSelect = document.getElementById('startupPageSelect');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const enableWelcomeSplash = document.getElementById('enableWelcomeSplash');
    const enableAutoSaveMode = document.getElementById('enableAutoSaveMode');
    const autoSaveIntervalSlider = document.getElementById('autoSaveIntervalSlider');
    const autoSaveIntervalInput = document.getElementById('autoSaveIntervalInput');
    const recoverLastAutoSaveBtn = document.getElementById('recoverLastAutoSaveBtn');
    const viewCrashReportBtn = document.getElementById('viewCrashReportBtn');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
    const performanceModeInfoBtn = document.getElementById('performanceModeInfoBtn');
    const performanceInfoModal = document.getElementById('performanceInfoModal');
    const closePerformanceInfoModalBtn = document.getElementById('closePerformanceInfoModal');
    const closePerformanceInfoBtn = document.getElementById('closePerformanceInfoBtn');
    const openDebugDashboardBtn = document.getElementById('openDebugDashboardBtn');
    const closeDebugDashboardBtn = document.getElementById('closeDebugDashboardBtn');
    const saveBtn = document.getElementById('saveSettings');
    const resetBtn = document.getElementById('resetSettings');
    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const closeResetConfirmModalBtn = document.getElementById('closeResetConfirmModal');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const crashReportModal = document.getElementById('crashReportModal');
    const closeCrashReportModalBtn = document.getElementById('closeCrashReportModalBtn');

    applySidebarIconOverrides();
    renderSidebarIconEditor();

    // Theme change
    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        const accent = accentColor.value;
        const radius = parseInt(borderRadiusSlider.value);
        const opacity = parseInt(opacitySlider.value);
        applyTheme(theme, accent, radius, opacity);
        const currentThemeStudio = getSavedThemeStudioSettings();
        applyThemeStudioSettings(currentThemeStudio, { persist: false });
        syncThemeStudioControlsFromSettings(currentThemeStudio);
    });

    // Accent color change
    const handleAccentColorChange = (e) => {
        const theme = themeSelect.value;
        const accent = e.target.value;
        const radius = parseInt(borderRadiusSlider.value);
        const opacity = parseInt(opacitySlider.value);
        applyTheme(theme, accent, radius, opacity);
    };
    accentColor.addEventListener('input', handleAccentColorChange);
    accentColor.addEventListener('change', handleAccentColorChange);
    if (gradientAccentEnabled && gradientAccentColor2 && gradientAccentPreview) {
        setupGradientAccentControls();
    }

    themePresetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.getAttribute('data-theme-preset');
            const preset = THEME_PRESETS[presetKey];
            if (!preset) return;

            themeSelect.value = preset.theme;
            accentColor.value = preset.accent;
            borderRadiusSlider.value = String(preset.radius);
            borderRadiusInput.value = String(preset.radius);
            opacitySlider.value = String(preset.opacity);
            opacityInput.value = String(preset.opacity);
            applyTheme(preset.theme, preset.accent, preset.radius, preset.opacity);
            const currentThemeStudio = getSavedThemeStudioSettings();
            applyThemeStudioSettings(currentThemeStudio, { persist: false });
            syncThemeStudioControlsFromSettings(currentThemeStudio);
            showNotification(`Theme preset applied: ${preset.name}`);
            updateProfileUnsavedIndicator();
        });
    });

    // Border radius sync
    borderRadiusSlider.addEventListener('input', (e) => {
        borderRadiusInput.value = e.target.value;
        const theme = themeSelect.value;
        const accent = accentColor.value;
        const opacity = parseInt(opacitySlider.value);
        applyTheme(theme, accent, parseInt(e.target.value), opacity);
    });

    borderRadiusInput.addEventListener('input', (e) => {
        borderRadiusSlider.value = e.target.value;
        const theme = themeSelect.value;
        const accent = accentColor.value;
        const opacity = parseInt(opacitySlider.value);
        applyTheme(theme, accent, parseInt(e.target.value), opacity);
    });

    // Opacity sync
    opacitySlider.addEventListener('input', (e) => {
        opacityInput.value = e.target.value;
        const theme = themeSelect.value;
        const accent = accentColor.value;
        const radius = parseInt(borderRadiusSlider.value);
        applyTheme(theme, accent, radius, parseInt(e.target.value));
    });

    opacityInput.addEventListener('input', (e) => {
        opacitySlider.value = e.target.value;
        const theme = themeSelect.value;
        const accent = accentColor.value;
        const radius = parseInt(borderRadiusSlider.value);
        applyTheme(theme, accent, radius, parseInt(e.target.value));
    });
    // Sound settings
    const syncButtonSoundControls = () => {
        buttonSoundSelect.disabled = !enableButtonSounds.checked;
        buttonSoundVolume.disabled = !enableButtonSounds.checked;
        buttonSoundVolumeInput.disabled = !enableButtonSounds.checked;
    };

    const syncSwitchSoundControls = () => {
        switchSoundSelect.disabled = !enableSwitchSounds.checked;
        switchSoundVolume.disabled = !enableSwitchSounds.checked;
        switchSoundVolumeInput.disabled = !enableSwitchSounds.checked;
    };

    enableButtonSounds.addEventListener('change', () => {
        setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, buttonSoundVolume.value);
        syncButtonSoundControls();
    });

    buttonSoundSelect.addEventListener('change', () => {
        setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, buttonSoundVolume.value);
    });

    buttonSoundVolume.addEventListener('input', () => {
        buttonSoundVolumeInput.value = buttonSoundVolume.value;
        setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, buttonSoundVolume.value);
    });

    buttonSoundVolumeInput.addEventListener('input', () => {
        const normalized = clampVolumePercent(buttonSoundVolumeInput.value, 65);
        buttonSoundVolume.value = String(normalized);
        buttonSoundVolumeInput.value = String(normalized);
        setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, normalized);
    });

    enableSwitchSounds.addEventListener('change', () => {
        setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, switchSoundVolume.value);
        syncSwitchSoundControls();
    });

    switchSoundSelect.addEventListener('change', () => {
        setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, switchSoundVolume.value);
    });

    switchSoundVolume.addEventListener('input', () => {
        switchSoundVolumeInput.value = switchSoundVolume.value;
        setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, switchSoundVolume.value);
    });

    switchSoundVolumeInput.addEventListener('input', () => {
        const normalized = clampVolumePercent(switchSoundVolumeInput.value, 70);
        switchSoundVolume.value = String(normalized);
        switchSoundVolumeInput.value = String(normalized);
        setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, normalized);
    });

    if (previewButtonSoundBtn) {
        previewButtonSoundBtn.addEventListener('click', () => {
            const previewVolume = clampVolumePercent(buttonSoundVolume.value, 65) / 100;
            const previousVolume = soundSettings.volume;
            soundSettings.volume = previewVolume;
            playButtonClickSound(buttonSoundSelect.value);
            soundSettings.volume = previousVolume;
        });
    }

    if (previewSwitchSoundBtn) {
        previewSwitchSoundBtn.addEventListener('click', () => {
            const previewVolume = clampVolumePercent(switchSoundVolume.value, 70) / 100;
            const previousVolume = featureSwitchSoundSettings.volume;
            featureSwitchSoundSettings.volume = previewVolume;
            playFeatureSwitchSound(true, switchSoundSelect.value);
            featureSwitchSoundSettings.volume = previousVolume;
        });
    }

    if (startupPageSelect) {
        startupPageSelect.value = getSavedStartupPageSetting();
    }
    if (enableBootPowerConfirm) {
        enableBootPowerConfirm.checked = getSavedBootPowerConfirm();
    }
    if (enableWelcomeSplash) {
        enableWelcomeSplash.checked = getSavedWelcomeSplashEnabled();
    }
    if (enableAutoSaveMode) {
        enableAutoSaveMode.checked = getSavedAutoSaveEnabled();
    }
    if (autoSaveIntervalSlider && autoSaveIntervalInput) {
        const intervalSeconds = Math.round(getSavedAutoSaveIntervalMs() / 1000);
        autoSaveIntervalSlider.value = String(intervalSeconds);
        autoSaveIntervalInput.value = String(intervalSeconds);
    }
    updateAutoSaveStatusUi();
    updateCrashReportStatusUi();

    syncButtonSoundControls();
    syncSwitchSoundControls();

    if (enablePerformanceMode) {
        enablePerformanceMode.checked = getSavedPerformanceMode();
        enablePerformanceMode.addEventListener('change', () => {
            setPerformanceMode(enablePerformanceMode.checked);
        });
    }

    if (enableUiLockMode) {
        enableUiLockMode.checked = getSavedUiLockMode();
        enableUiLockMode.addEventListener('change', () => {
            setUiLockMode(enableUiLockMode.checked);
        });
    }

    if (enableFocusMode) {
        enableFocusMode.checked = getSavedFocusMode();
        enableFocusMode.addEventListener('change', () => {
            setFocusMode(enableFocusMode.checked);
        });
    }

    if (enableSafetyLockMode) {
        enableSafetyLockMode.checked = getSavedSafetyLockMode();
        enableSafetyLockMode.addEventListener('change', () => {
            setSafetyLockMode(enableSafetyLockMode.checked);
        });
    }

    const syncSafetyLockHoldControls = (nextValue, { updateIndicator = true } = {}) => {
        const normalized = setSafetyLockHoldMs(nextValue, { persist: false });
        if (safetyLockHoldSlider) safetyLockHoldSlider.value = String(normalized);
        if (safetyLockHoldInput) safetyLockHoldInput.value = String(normalized);
        if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(normalized);
        if (updateIndicator) updateProfileUnsavedIndicator();
    };

    if (safetyLockHoldSlider) {
        safetyLockHoldSlider.addEventListener('input', () => {
            syncSafetyLockHoldControls(safetyLockHoldSlider.value);
        });
    }
    if (safetyLockHoldInput) {
        safetyLockHoldInput.addEventListener('input', () => {
            syncSafetyLockHoldControls(safetyLockHoldInput.value);
        });
    }
    syncSafetyLockHoldControls(getSavedSafetyLockHoldMs(), { updateIndicator: false });

    const syncAutoSaveIntervalControls = (valueRaw) => {
        const intervalMs = setAutoSaveIntervalMs(parseNumberWithFallback(valueRaw, 60) * 1000, { persist: true });
        const intervalSec = Math.round(intervalMs / 1000);
        if (autoSaveIntervalSlider) autoSaveIntervalSlider.value = String(intervalSec);
        if (autoSaveIntervalInput) autoSaveIntervalInput.value = String(intervalSec);
        setAutoSaveEnabled(getSavedAutoSaveEnabled(), { persist: false });
        updateAutoSaveStatusUi();
        updateProfileUnsavedIndicator();
    };

    if (enableAutoSaveMode) {
        enableAutoSaveMode.addEventListener('change', () => {
            localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, String(enableAutoSaveMode.checked));
            setAutoSaveEnabled(enableAutoSaveMode.checked, { persist: false });
            if (enableAutoSaveMode.checked) {
                saveAutoRecoverySnapshot('enabled');
            }
            updateAutoSaveStatusUi();
            updateProfileUnsavedIndicator();
        });
    }

    if (autoSaveIntervalSlider) {
        autoSaveIntervalSlider.addEventListener('input', () => syncAutoSaveIntervalControls(autoSaveIntervalSlider.value));
    }
    if (autoSaveIntervalInput) {
        autoSaveIntervalInput.addEventListener('input', () => syncAutoSaveIntervalControls(autoSaveIntervalInput.value));
    }
    if (recoverLastAutoSaveBtn) {
        recoverLastAutoSaveBtn.addEventListener('click', recoverLastAutoSaveSnapshot);
    }
    if (viewCrashReportBtn) {
        viewCrashReportBtn.addEventListener('click', openCrashReportModal);
    }
    if (closeCrashReportModalBtn) {
        closeCrashReportModalBtn.addEventListener('click', closeCrashReportModal);
    }
    if (crashReportModal) {
        crashReportModal.addEventListener('click', (event) => {
            if (event.target === crashReportModal) {
                closeCrashReportModal();
            }
        });
    }

    if (toggleFullscreenBtn) {
        updateFullscreenButtonLabel();
        toggleFullscreenBtn.addEventListener('click', () => {
            toggleFullscreenMode();
        });
    }
    document.addEventListener('fullscreenchange', updateFullscreenButtonLabel);

    const closePerformanceInfoModal = () => {
        if (!performanceInfoModal) return;
        performanceInfoModal.classList.remove('active');
        performanceInfoModal.setAttribute('aria-hidden', 'true');
    };

    if (performanceModeInfoBtn) {
        performanceModeInfoBtn.addEventListener('click', () => {
            if (!performanceInfoModal) return;
            performanceInfoModal.classList.add('active');
            performanceInfoModal.setAttribute('aria-hidden', 'false');
        });
    }

    if (closePerformanceInfoModalBtn) {
        closePerformanceInfoModalBtn.addEventListener('click', closePerformanceInfoModal);
    }
    if (closePerformanceInfoBtn) {
        closePerformanceInfoBtn.addEventListener('click', closePerformanceInfoModal);
    }
    if (performanceInfoModal) {
        performanceInfoModal.addEventListener('click', (e) => {
            if (e.target === performanceInfoModal) {
                closePerformanceInfoModal();
            }
        });
    }

    if (openDebugDashboardBtn) {
        openDebugDashboardBtn.addEventListener('click', () => {
            openDebugDashboard();
        });
    }
    if (closeDebugDashboardBtn) {
        closeDebugDashboardBtn.addEventListener('click', () => {
            closeDebugDashboard();
        });
    }

    // Save settings
    saveBtn.addEventListener('click', saveSettings);

    // Reset settings
    resetBtn.addEventListener('click', openResetConfirmModal);

    closeResetConfirmModalBtn.addEventListener('click', closeResetConfirmModal);
    cancelResetBtn.addEventListener('click', closeResetConfirmModal);

    confirmResetBtn.addEventListener('click', () => {
        closeResetConfirmModal();
        resetSettings();
    });

    resetConfirmModal.addEventListener('click', (e) => {
        if (e.target === resetConfirmModal) {
            closeResetConfirmModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resetConfirmModal.classList.contains('active')) {
            closeResetConfirmModal();
            return;
        }
        const workspaceImportConfirmModal = document.getElementById('workspaceImportConfirmModal');
        if (e.key === 'Escape' && workspaceImportConfirmModal && workspaceImportConfirmModal.classList.contains('active')) {
            closeWorkspaceImportConfirmModal();
            return;
        }
        const workspaceResetConfirmModal = document.getElementById('workspaceResetConfirmModal');
        if (e.key === 'Escape' && workspaceResetConfirmModal && workspaceResetConfirmModal.classList.contains('active')) {
            closeWorkspaceResetConfirmModal();
            return;
        }
        if (e.key === 'Escape' && performanceInfoModal && performanceInfoModal.classList.contains('active')) {
            closePerformanceInfoModal();
            return;
        }
        const pluginGuideModal = document.getElementById('pluginGuideModal');
        if (e.key === 'Escape' && pluginGuideModal && pluginGuideModal.classList.contains('active')) {
            closePluginGuideModal();
            return;
        }
        if (e.key === 'Escape' && crashReportModal && crashReportModal.classList.contains('active')) {
            closeCrashReportModal();
        }
    });
}

function openResetConfirmModal() {
    const modal = document.getElementById('resetConfirmModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const confirmBtn = document.getElementById('confirmResetBtn');
    if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 10);
    }
}

function closeResetConfirmModal() {
    const modal = document.getElementById('resetConfirmModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function openWorkspaceImportConfirmModal() {
    const modal = document.getElementById('workspaceImportConfirmModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const confirmBtn = document.getElementById('confirmWorkspaceImportBtn');
    if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 10);
    }
}

function closeWorkspaceImportConfirmModal() {
    const modal = document.getElementById('workspaceImportConfirmModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function openWorkspaceResetConfirmModal() {
    const modal = document.getElementById('workspaceResetConfirmModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const confirmBtn = document.getElementById('confirmWorkspaceResetBtn');
    if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 10);
    }
}

function closeWorkspaceResetConfirmModal() {
    const modal = document.getElementById('workspaceResetConfirmModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function resetWorkspaceSyncToDefault() {
    if (!isRoleAllowed('workspace') || !isRoleAllowed('destructive')) {
        showNotification('Workspace reset is blocked for this profile role.');
        return;
    }
    const previousStorage = captureNexusStorageSnapshot();
    const backupPayload = {
        createdAt: new Date().toISOString(),
        summary: captureWorkspaceSummaryFromStorageSnapshot(previousStorage),
        storage: previousStorage
    };

    clearNexusStorageSnapshot();
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_SYNC_BACKUP, JSON.stringify(backupPayload));
    refreshWorkspaceStateFromStorage();

    const resetSummary = captureWorkspaceSummaryFromStorageSnapshot();
    const stamp = `Workspace reset at ${new Date().toLocaleTimeString()} | ${formatWorkspaceSummary(resetSummary)} | backup ready`;
    setWorkspaceSyncStatus(stamp, true);
    showNotification('Workspace reset to defaults.');
    recordRecentChange('Workspace reset to defaults', () => {
        restoreNexusStorageSnapshot(previousStorage);
        refreshWorkspaceStateFromStorage();
        setWorkspaceSyncStatus('Workspace reset undone.', true);
    });
}

function syncSettingsControls() {
    setupGradientAccentControls();
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const borderRadiusInput = document.getElementById('borderRadiusInput');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityInput = document.getElementById('opacityInput');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const safetyLockHoldInput = document.getElementById('safetyLockHoldInput');
    const safetyLockHoldPreview = document.getElementById('safetyLockHoldPreview');

    borderRadiusSlider.addEventListener('input', (e) => {
        borderRadiusInput.value = e.target.value;
    });

    borderRadiusInput.addEventListener('input', (e) => {
        borderRadiusSlider.value = e.target.value;
    });

    opacitySlider.addEventListener('input', (e) => {
        opacityInput.value = e.target.value;
    });

    opacityInput.addEventListener('input', (e) => {
        opacitySlider.value = e.target.value;
    });

    if (safetyLockHoldSlider && safetyLockHoldInput) {
        safetyLockHoldSlider.addEventListener('input', (e) => {
            const normalized = normalizeSafetyLockHoldMs(e.target.value);
            safetyLockHoldInput.value = String(normalized);
            if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(normalized);
            setSafetyLockHoldMs(normalized, { persist: false });
        });

        safetyLockHoldInput.addEventListener('input', (e) => {
            const normalized = normalizeSafetyLockHoldMs(e.target.value);
            safetyLockHoldSlider.value = String(normalized);
            safetyLockHoldInput.value = String(normalized);
            if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(normalized);
            setSafetyLockHoldMs(normalized, { persist: false });
        });
    }
}

function saveSettings() {
    if (!isRoleAllowed('save')) {
        showNotification('Saving is blocked for this profile role.');
        return;
    }
    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const borderRadius = document.getElementById('borderRadiusSlider');
    const opacity = document.getElementById('opacitySlider');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const enablePerformanceMode = document.getElementById('enablePerformanceMode');
    const enableUiLockMode = document.getElementById('enableUiLockMode');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const startupPageSelect = document.getElementById('startupPageSelect');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const enableWelcomeSplash = document.getElementById('enableWelcomeSplash');
    const enableAutoSaveMode = document.getElementById('enableAutoSaveMode');
    const autoSaveIntervalSlider = document.getElementById('autoSaveIntervalSlider');
    const autoSaveEnabled = Boolean(enableAutoSaveMode ? enableAutoSaveMode.checked : getSavedAutoSaveEnabled());
    const autoSaveIntervalMs = setAutoSaveIntervalMs(
        (autoSaveIntervalSlider ? autoSaveIntervalSlider.value : Math.round(getSavedAutoSaveIntervalMs() / 1000)) * 1000,
        { persist: false }
    );
    localStorage.setItem(STORAGE_KEYS.THEME, themeSelect.value);
    localStorage.setItem(STORAGE_KEYS.ACCENT, accentColor.value);
    localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED, String(Boolean(gradientAccentEnabled && gradientAccentEnabled.checked)));
    localStorage.setItem(
        STORAGE_KEYS.GRADIENT_ACCENT_2,
        /^#[0-9a-fA-F]{6}$/.test(String(gradientAccentColor2 ? gradientAccentColor2.value : '').trim())
            ? gradientAccentColor2.value
            : '#7c3aed'
    );
    localStorage.setItem(STORAGE_KEYS.BORDER_RADIUS, borderRadius.value);
    localStorage.setItem(STORAGE_KEYS.OPACITY, opacity.value);
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED, String(enableButtonSounds.checked));
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_TYPE, buttonSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME, String(clampVolumePercent(buttonSoundVolume.value, 65)));
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED, String(enableSwitchSounds.checked));
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_TYPE, switchSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME, String(clampVolumePercent(switchSoundVolume.value, 70)));
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_MODE, String(Boolean(enablePerformanceMode && enablePerformanceMode.checked)));
    localStorage.setItem(STORAGE_KEYS.LOCK_UI_MODE, String(Boolean(enableUiLockMode && enableUiLockMode.checked)));
    localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, String(Boolean(enableFocusMode && enableFocusMode.checked)));
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_MODE, String(Boolean(enableSafetyLockMode && enableSafetyLockMode.checked)));
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS, String(normalizeSafetyLockHoldMs(safetyLockHoldSlider ? safetyLockHoldSlider.value : getSavedSafetyLockHoldMs())));
    const startupValue = startupPageSelect ? startupPageSelect.value : 'combat';
    localStorage.setItem(STORAGE_KEYS.STARTUP_PAGE, STARTUP_PAGE_OPTIONS.includes(startupValue) ? startupValue : 'combat');
    localStorage.setItem(STORAGE_KEYS.BOOT_POWER_CONFIRM, String(Boolean(enableBootPowerConfirm ? enableBootPowerConfirm.checked : true)));
    localStorage.setItem(STORAGE_KEYS.WELCOME_SPLASH, String(Boolean(enableWelcomeSplash ? enableWelcomeSplash.checked : true)));
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, String(autoSaveEnabled));
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_INTERVAL_MS, String(autoSaveIntervalMs));
    setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, buttonSoundVolume.value);
    setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, switchSoundVolume.value);
    setPerformanceMode(Boolean(enablePerformanceMode && enablePerformanceMode.checked));
    setUiLockMode(Boolean(enableUiLockMode && enableUiLockMode.checked));
    setFocusMode(Boolean(enableFocusMode && enableFocusMode.checked));
    setSafetyLockMode(Boolean(enableSafetyLockMode && enableSafetyLockMode.checked));
    setSafetyLockHoldMs(safetyLockHoldSlider ? safetyLockHoldSlider.value : getSavedSafetyLockHoldMs(), { persist: false });
    setAutoSaveEnabled(autoSaveEnabled, { persist: false });
    updateAutoSaveStatusUi();
    applyGradientAccentRuntime(accentColor.value);
    saveFeatureStates();

    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    const profilesData = getProfilesDataFromStorage();

    if (currentProfileName !== 'Incognito') {
        profilesData[currentProfileName] = buildCurrentProfileData();
        saveProfilesDataToStorage(profilesData);
    }

    showNotification('Settings saved!');
    updateProfileUnsavedIndicator();
}

function resetSettings() {
    if (!isRoleAllowed('destructive')) {
        showNotification('Reset is blocked for this profile role.');
        return;
    }
    stopHackDemo(false);
    resetHackDemoState();
    clearHackDemoLog(true);
    renderHackDemoPanel();

    const snapshot = captureResetSnapshot();

    // Reset to defaults
    document.getElementById('themeSelect').value = 'dark';
    document.getElementById('accentColor').value = '#00d9ff';
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    if (gradientAccentEnabled) gradientAccentEnabled.checked = false;
    if (gradientAccentColor2) gradientAccentColor2.value = '#7c3aed';
    updateGradientAccentPreview('#00d9ff', '#7c3aed', false);
    document.getElementById('borderRadiusSlider').value = '8';
    document.getElementById('borderRadiusInput').value = '8';
    document.getElementById('opacitySlider').value = '100';
    document.getElementById('opacityInput').value = '100';
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const safetyLockHoldInput = document.getElementById('safetyLockHoldInput');
    const safetyLockHoldPreview = document.getElementById('safetyLockHoldPreview');
    if (safetyLockHoldSlider) safetyLockHoldSlider.value = String(SAFETY_HOLD_MS_DEFAULT);
    if (safetyLockHoldInput) safetyLockHoldInput.value = String(SAFETY_HOLD_MS_DEFAULT);
    if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(SAFETY_HOLD_MS_DEFAULT);
    const startupSelect = document.getElementById('startupPageSelect');
    if (startupSelect) startupSelect.value = 'combat';
    const bootPowerConfirmToggle = document.getElementById('enableBootPowerConfirm');
    const welcomeSplashToggle = document.getElementById('enableWelcomeSplash');
    const autoSaveToggle = document.getElementById('enableAutoSaveMode');
    const autoSaveSlider = document.getElementById('autoSaveIntervalSlider');
    const autoSaveInput = document.getElementById('autoSaveIntervalInput');

    document.getElementById('enableButtonSounds').checked = false;
    document.getElementById('buttonSoundSelect').value = 'nexus-soft';
    document.getElementById('buttonSoundVolume').value = '65';
    document.getElementById('buttonSoundVolumeInput').value = '65';
    document.getElementById('buttonSoundSelect').disabled = true;
    document.getElementById('buttonSoundVolume').disabled = true;
    document.getElementById('buttonSoundVolumeInput').disabled = true;

    document.getElementById('enableSwitchSounds').checked = false;
    document.getElementById('switchSoundSelect').value = 'clean-toggle';
    document.getElementById('switchSoundVolume').value = '70';
    document.getElementById('switchSoundVolumeInput').value = '70';
    document.getElementById('switchSoundSelect').disabled = true;
    document.getElementById('switchSoundVolume').disabled = true;
    document.getElementById('switchSoundVolumeInput').disabled = true;

    const performanceToggle = document.getElementById('enablePerformanceMode');
    const uiLockToggle = document.getElementById('enableUiLockMode');
    if (performanceToggle) performanceToggle.checked = false;
    if (uiLockToggle) uiLockToggle.checked = false;

    // Reset only current profile/runtime settings (do not wipe full workspace)
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    localStorage.setItem(STORAGE_KEYS.ACCENT, '#00d9ff');
    localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_2, '#7c3aed');
    localStorage.setItem(STORAGE_KEYS.BORDER_RADIUS, '8');
    localStorage.setItem(STORAGE_KEYS.OPACITY, '100');
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_TYPE, 'nexus-soft');
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME, '65');
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_TYPE, 'clean-toggle');
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME, '70');
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_MODE, 'false');
    localStorage.setItem(STORAGE_KEYS.LOCK_UI_MODE, 'false');
    localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, 'false');
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_MODE, 'false');
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS, String(SAFETY_HOLD_MS_DEFAULT));
    localStorage.setItem(STORAGE_KEYS.STARTUP_PAGE, 'combat');
    localStorage.setItem(STORAGE_KEYS.BOOT_POWER_CONFIRM, 'true');
    localStorage.setItem(STORAGE_KEYS.WELCOME_SPLASH, 'true');
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_INTERVAL_MS, String(AUTO_SAVE_INTERVAL_MS_DEFAULT));
    localStorage.setItem(STORAGE_KEYS.BG_PATTERN, 'none');
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR_ICONS);
    localStorage.removeItem(STORAGE_KEYS.LAST_AUTO_SAVE);
    localStorage.removeItem(STORAGE_KEYS.THEME_STUDIO);
    applyThemeStudioSettings(getDefaultThemeStudioSettings(), { persist: true });
    syncThemeStudioControlsFromSettings(getDefaultThemeStudioSettings());
    themeStudioDraftState.bgPattern = 'none';
    themeStudioDraftState.sidebarIcons = {};
    const bgPatternSelect = document.getElementById('bgPatternSelect');
    if (bgPatternSelect) bgPatternSelect.value = 'none';
    applyBackgroundPattern('none', { persist: false });
    applySidebarIconOverrides({});
    renderSidebarIconEditor();

    // Reapply theme and defaults
    applyTheme('dark', '#00d9ff', 8, 100);
    applyLayout('grid');
    setRuntimeSoundSettings(false, 'nexus-soft', 65);
    setRuntimeSwitchSoundSettings(false, 'clean-toggle', 70);
    setPerformanceMode(false);
    setUiLockMode(false);
    setFocusMode(false);
    setSafetyLockMode(false);
    applyGradientAccentRuntime('#00d9ff');
    setSafetyLockHoldMs(SAFETY_HOLD_MS_DEFAULT, { persist: false });
    if (autoSaveToggle) autoSaveToggle.checked = false;
    if (autoSaveSlider) autoSaveSlider.value = String(Math.round(AUTO_SAVE_INTERVAL_MS_DEFAULT / 1000));
    if (autoSaveInput) autoSaveInput.value = String(Math.round(AUTO_SAVE_INTERVAL_MS_DEFAULT / 1000));
    updateAutoSaveStatusUi();
    updateCrashReportStatusUi();
    hackDemoState.refreshMs = 750;
    setHackDemoCompactMode(false, false);
    setHackDemoAutoScroll(true, false);
    updateHackDemoControlsUi();
    setActiveDebugMetric('speed');
    // Reset all toggles
    const toggles = document.querySelectorAll('.toggle-input');
    toggles.forEach(toggle => {
        toggle.checked = false;
    });
    if (bootPowerConfirmToggle) bootPowerConfirmToggle.checked = true;
    if (welcomeSplashToggle) welcomeSplashToggle.checked = true;

    saveFeatureStates();
    loadKeybindMapFromStorage();
    loadKeybindModeMapFromStorage();
    loadKeybindProfileTargetsFromStorage();
    renderKeybindActions(activeKeybindGroup);
    hackDemoState.refreshMs = getSavedDebugRefreshRate();
    setHackDemoCompactMode(getSavedDebugCompactMode(), false);
    setHackDemoAutoScroll(getSavedDebugAutoScroll(), false);
    updateHackDemoControlsUi();
    refreshDebugEnvironmentMetrics();
    renderHackDemoPanel();
    setActiveDebugMetric(hackDemoState.activeMetric);
    startHackDemo({ notify: false, showPanel: false });
    setupQuickToggle();
    updateFeatureStatusOverview();
    const currentProfileName = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
    if (currentProfileName !== 'Incognito') {
        const profilesData = getProfilesDataFromStorage();
        profilesData[currentProfileName] = buildCurrentProfileData();
        saveProfilesDataToStorage(profilesData);
    }
    loadProfiles();
    applyMicroCardAnimations(document);
    startResetUndoWindow(snapshot);
}

function captureLocalStorageSnapshot() {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        snapshot[key] = localStorage.getItem(key);
    }
    return snapshot;
}

function isNexusStorageKey(key) {
    return typeof key === 'string' && key.startsWith('nexus-');
}

function captureNexusStorageSnapshot() {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!isNexusStorageKey(key)) continue;
        snapshot[key] = localStorage.getItem(key);
    }
    return snapshot;
}

function clearNexusStorageSnapshot() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!isNexusStorageKey(key)) continue;
        keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

function restoreNexusStorageSnapshot(snapshot) {
    clearNexusStorageSnapshot();
    Object.keys(snapshot || {}).forEach(key => {
        if (!isNexusStorageKey(key)) return;
        localStorage.setItem(key, snapshot[key]);
    });
}

function captureFeatureToggleSnapshot() {
    const features = {};
    document.querySelectorAll('.toggle-input[data-feature]').forEach(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim();
        if (!feature || feature === 'null' || feature === 'undefined') return;
        features[feature] = toggle.checked;
    });
    return features;
}

function captureResetSnapshot() {
    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const enablePerformanceMode = document.getElementById('enablePerformanceMode');
    const enableUiLockMode = document.getElementById('enableUiLockMode');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const startupPageSelect = document.getElementById('startupPageSelect');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const enableWelcomeSplash = document.getElementById('enableWelcomeSplash');
    const enableAutoSaveMode = document.getElementById('enableAutoSaveMode');
    const autoSaveIntervalSlider = document.getElementById('autoSaveIntervalSlider');
    const listLayoutBtn = document.getElementById('listLayoutBtn');

    return {
        storage: captureLocalStorageSnapshot(),
        ui: {
            theme: themeSelect ? themeSelect.value : 'dark',
            accent: accentColor ? accentColor.value : '#00d9ff',
            gradientAccentEnabled: Boolean(gradientAccentEnabled && gradientAccentEnabled.checked),
            gradientAccent2: /^#[0-9a-fA-F]{6}$/.test(String(gradientAccentColor2 ? gradientAccentColor2.value : '').trim())
                ? gradientAccentColor2.value
                : '#7c3aed',
            borderRadius: borderRadiusSlider ? borderRadiusSlider.value : '8',
            opacity: opacitySlider ? opacitySlider.value : '100',
            layout: listLayoutBtn && listLayoutBtn.classList.contains('active') ? 'list' : 'grid',
            buttonSoundsEnabled: enableButtonSounds ? enableButtonSounds.checked : false,
            buttonSoundType: buttonSoundSelect ? buttonSoundSelect.value : 'nexus-soft',
            buttonSoundVolume: buttonSoundVolume ? clampVolumePercent(buttonSoundVolume.value, 65) : 65,
            switchSoundsEnabled: enableSwitchSounds ? enableSwitchSounds.checked : false,
            switchSoundType: switchSoundSelect ? switchSoundSelect.value : 'clean-toggle',
            switchSoundVolume: switchSoundVolume ? clampVolumePercent(switchSoundVolume.value, 70) : 70,
            performanceMode: enablePerformanceMode ? enablePerformanceMode.checked : getSavedPerformanceMode(),
            uiLockMode: enableUiLockMode ? enableUiLockMode.checked : getSavedUiLockMode(),
            focusMode: enableFocusMode ? enableFocusMode.checked : getSavedFocusMode(),
            safetyLockMode: enableSafetyLockMode ? enableSafetyLockMode.checked : getSavedSafetyLockMode(),
            safetyLockHoldMs: normalizeSafetyLockHoldMs(safetyLockHoldSlider ? safetyLockHoldSlider.value : getSavedSafetyLockHoldMs()),
            startupPage: startupPageSelect ? startupPageSelect.value : getSavedStartupPageSetting(),
            bootPowerConfirm: enableBootPowerConfirm ? enableBootPowerConfirm.checked : getSavedBootPowerConfirm(),
            welcomeSplash: enableWelcomeSplash ? enableWelcomeSplash.checked : getSavedWelcomeSplashEnabled(),
            autoSaveEnabled: enableAutoSaveMode ? enableAutoSaveMode.checked : getSavedAutoSaveEnabled(),
            autoSaveIntervalMs: setAutoSaveIntervalMs((autoSaveIntervalSlider ? autoSaveIntervalSlider.value : Math.round(getSavedAutoSaveIntervalMs() / 1000)) * 1000, { persist: false }),
            bgPattern: getSavedBgPattern(),
            sidebarIcons: { ...getSavedSidebarIconOverrides() },
            themeStudio: getSavedThemeStudioSettings(),
            features: captureFeatureToggleSnapshot()
        }
    };
}

function restoreLocalStorageSnapshot(snapshot) {
    localStorage.clear();
    Object.keys(snapshot || {}).forEach(key => {
        localStorage.setItem(key, snapshot[key]);
    });
}

function applyUiSnapshot(uiSnapshot) {
    if (!uiSnapshot) return;

    const themeSelect = document.getElementById('themeSelect');
    const accentColor = document.getElementById('accentColor');
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const borderRadiusInput = document.getElementById('borderRadiusInput');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityInput = document.getElementById('opacityInput');
    const enableButtonSounds = document.getElementById('enableButtonSounds');
    const buttonSoundSelect = document.getElementById('buttonSoundSelect');
    const buttonSoundVolume = document.getElementById('buttonSoundVolume');
    const buttonSoundVolumeInput = document.getElementById('buttonSoundVolumeInput');
    const enableSwitchSounds = document.getElementById('enableSwitchSounds');
    const switchSoundSelect = document.getElementById('switchSoundSelect');
    const switchSoundVolume = document.getElementById('switchSoundVolume');
    const switchSoundVolumeInput = document.getElementById('switchSoundVolumeInput');
    const enablePerformanceMode = document.getElementById('enablePerformanceMode');
    const enableUiLockMode = document.getElementById('enableUiLockMode');
    const enableFocusMode = document.getElementById('enableFocusMode');
    const enableSafetyLockMode = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const safetyLockHoldInput = document.getElementById('safetyLockHoldInput');
    const safetyLockHoldPreview = document.getElementById('safetyLockHoldPreview');
    const startupPageSelect = document.getElementById('startupPageSelect');
    const enableBootPowerConfirm = document.getElementById('enableBootPowerConfirm');
    const enableWelcomeSplash = document.getElementById('enableWelcomeSplash');
    const enableAutoSaveMode = document.getElementById('enableAutoSaveMode');
    const autoSaveIntervalSlider = document.getElementById('autoSaveIntervalSlider');
    const autoSaveIntervalInput = document.getElementById('autoSaveIntervalInput');
    const bgPatternSelect = document.getElementById('bgPatternSelect');

    themeSelect.value = uiSnapshot.theme;
    accentColor.value = uiSnapshot.accent;
    const snapshotGradientEnabled = uiSnapshot.gradientAccentEnabled === true || uiSnapshot.gradientAccentEnabled === 'true';
    const snapshotGradient2 = /^#[0-9a-fA-F]{6}$/.test(String(uiSnapshot.gradientAccent2 || '').trim())
        ? String(uiSnapshot.gradientAccent2).trim()
        : '#7c3aed';
    if (gradientAccentEnabled) gradientAccentEnabled.checked = snapshotGradientEnabled;
    if (gradientAccentColor2) gradientAccentColor2.value = snapshotGradient2;
    updateGradientAccentPreview(uiSnapshot.accent, snapshotGradient2, snapshotGradientEnabled);
    borderRadiusSlider.value = uiSnapshot.borderRadius;
    borderRadiusInput.value = uiSnapshot.borderRadius;
    opacitySlider.value = uiSnapshot.opacity;
    opacityInput.value = uiSnapshot.opacity;

    enableButtonSounds.checked = Boolean(uiSnapshot.buttonSoundsEnabled);
    buttonSoundSelect.value = BUTTON_SOUND_PRESETS[uiSnapshot.buttonSoundType] ? uiSnapshot.buttonSoundType : 'nexus-soft';
    buttonSoundVolume.value = String(clampVolumePercent(uiSnapshot.buttonSoundVolume, 65));
    buttonSoundVolumeInput.value = buttonSoundVolume.value;
    buttonSoundSelect.disabled = !enableButtonSounds.checked;
    buttonSoundVolume.disabled = !enableButtonSounds.checked;
    buttonSoundVolumeInput.disabled = !enableButtonSounds.checked;

    enableSwitchSounds.checked = Boolean(uiSnapshot.switchSoundsEnabled);
    switchSoundSelect.value = FEATURE_SWITCH_SOUND_PRESETS[uiSnapshot.switchSoundType] ? uiSnapshot.switchSoundType : 'clean-toggle';
    switchSoundVolume.value = String(clampVolumePercent(uiSnapshot.switchSoundVolume, 70));
    switchSoundVolumeInput.value = switchSoundVolume.value;
    switchSoundSelect.disabled = !enableSwitchSounds.checked;
    switchSoundVolume.disabled = !enableSwitchSounds.checked;
    switchSoundVolumeInput.disabled = !enableSwitchSounds.checked;

    const snapshotPerformance = Boolean(uiSnapshot.performanceMode);
    const snapshotUiLock = Boolean(uiSnapshot.uiLockMode);
    const snapshotFocusMode = Boolean(uiSnapshot.focusMode);
    const snapshotSafetyLockMode = Boolean(uiSnapshot.safetyLockMode);
    const snapshotSafetyLockHoldMs = normalizeSafetyLockHoldMs(uiSnapshot.safetyLockHoldMs ?? getSavedSafetyLockHoldMs());
    const snapshotStartupPage = STARTUP_PAGE_OPTIONS.includes(String(uiSnapshot.startupPage || '').trim().toLowerCase())
        ? String(uiSnapshot.startupPage).trim().toLowerCase()
        : 'combat';
    const snapshotBootPowerConfirm = uiSnapshot.bootPowerConfirm === false || uiSnapshot.bootPowerConfirm === 'false'
        ? false
        : true;
    const snapshotWelcomeSplash = uiSnapshot.welcomeSplash === false || uiSnapshot.welcomeSplash === 'false'
        ? false
        : true;
    const snapshotAutoSaveEnabled = uiSnapshot.autoSaveEnabled === true || uiSnapshot.autoSaveEnabled === 'true';
    const snapshotAutoSaveIntervalMs = setAutoSaveIntervalMs(uiSnapshot.autoSaveIntervalMs ?? getSavedAutoSaveIntervalMs(), { persist: false });
    const snapshotBgPattern = String(uiSnapshot.bgPattern || 'none').trim().toLowerCase() || 'none';
    const snapshotSidebarIcons = uiSnapshot.sidebarIcons && typeof uiSnapshot.sidebarIcons === 'object' && !Array.isArray(uiSnapshot.sidebarIcons)
        ? { ...uiSnapshot.sidebarIcons }
        : {};
    const snapshotThemeStudio = normalizeThemeStudioSettings(uiSnapshot.themeStudio || getSavedThemeStudioSettings());
    if (enablePerformanceMode) enablePerformanceMode.checked = snapshotPerformance;
    if (enableUiLockMode) enableUiLockMode.checked = snapshotUiLock;
    if (enableFocusMode) enableFocusMode.checked = snapshotFocusMode;
    if (enableSafetyLockMode) enableSafetyLockMode.checked = snapshotSafetyLockMode;
    if (safetyLockHoldSlider) safetyLockHoldSlider.value = String(snapshotSafetyLockHoldMs);
    if (safetyLockHoldInput) safetyLockHoldInput.value = String(snapshotSafetyLockHoldMs);
    if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(snapshotSafetyLockHoldMs);
    if (startupPageSelect) startupPageSelect.value = snapshotStartupPage;
    if (enableBootPowerConfirm) enableBootPowerConfirm.checked = snapshotBootPowerConfirm;
    if (enableWelcomeSplash) enableWelcomeSplash.checked = snapshotWelcomeSplash;
    if (enableAutoSaveMode) enableAutoSaveMode.checked = snapshotAutoSaveEnabled;
    if (autoSaveIntervalSlider) autoSaveIntervalSlider.value = String(Math.round(snapshotAutoSaveIntervalMs / 1000));
    if (autoSaveIntervalInput) autoSaveIntervalInput.value = String(Math.round(snapshotAutoSaveIntervalMs / 1000));

    applyTheme(uiSnapshot.theme, uiSnapshot.accent, parseInt(uiSnapshot.borderRadius, 10), parseInt(uiSnapshot.opacity, 10));
    applyGradientAccentRuntime(uiSnapshot.accent);
    applyLayout(uiSnapshot.layout === 'list' ? 'list' : 'grid');
    setRuntimeSoundSettings(enableButtonSounds.checked, buttonSoundSelect.value, buttonSoundVolume.value);
    setRuntimeSwitchSoundSettings(enableSwitchSounds.checked, switchSoundSelect.value, switchSoundVolume.value);
    setPerformanceMode(snapshotPerformance);
    setUiLockMode(snapshotUiLock);
    setFocusMode(snapshotFocusMode);
    setSafetyLockMode(snapshotSafetyLockMode);
    setSafetyLockHoldMs(snapshotSafetyLockHoldMs, { persist: false });
    applyThemeStudioSettings(snapshotThemeStudio, { persist: false });
    syncThemeStudioControlsFromSettings(snapshotThemeStudio);
    if (bgPatternSelect) bgPatternSelect.value = snapshotBgPattern;
    themeStudioDraftState.bgPattern = snapshotBgPattern;
    themeStudioDraftState.sidebarIcons = snapshotSidebarIcons;
    applyBackgroundPattern(snapshotBgPattern, { persist: false });
    applySidebarIconOverrides(snapshotSidebarIcons);
    renderSidebarIconEditor();
    setAutoSaveEnabled(snapshotAutoSaveEnabled, { persist: false });

    const featureStates = uiSnapshot.features || {};
    document.querySelectorAll('.toggle-input[data-feature]').forEach(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim();
        if (!feature || feature === 'null' || feature === 'undefined') return;
        toggle.checked = Boolean(featureStates[feature]);
    });

    localStorage.setItem(STORAGE_KEYS.THEME, themeSelect.value);
    localStorage.setItem(STORAGE_KEYS.ACCENT, accentColor.value);
    localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_ENABLED, String(snapshotGradientEnabled));
    localStorage.setItem(STORAGE_KEYS.GRADIENT_ACCENT_2, snapshotGradient2);
    localStorage.setItem(STORAGE_KEYS.BORDER_RADIUS, borderRadiusSlider.value);
    localStorage.setItem(STORAGE_KEYS.OPACITY, opacitySlider.value);
    localStorage.setItem(STORAGE_KEYS.LAYOUT, uiSnapshot.layout === 'list' ? 'list' : 'grid');
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUNDS_ENABLED, String(enableButtonSounds.checked));
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_TYPE, buttonSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.BUTTON_SOUND_VOLUME, buttonSoundVolume.value);
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUNDS_ENABLED, String(enableSwitchSounds.checked));
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_TYPE, switchSoundSelect.value);
    localStorage.setItem(STORAGE_KEYS.SWITCH_SOUND_VOLUME, switchSoundVolume.value);
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_MODE, String(snapshotPerformance));
    localStorage.setItem(STORAGE_KEYS.LOCK_UI_MODE, String(snapshotUiLock));
    localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, String(snapshotFocusMode));
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_MODE, String(snapshotSafetyLockMode));
    localStorage.setItem(STORAGE_KEYS.SAFETY_LOCK_HOLD_MS, String(snapshotSafetyLockHoldMs));
    localStorage.setItem(STORAGE_KEYS.STARTUP_PAGE, snapshotStartupPage);
    localStorage.setItem(STORAGE_KEYS.BOOT_POWER_CONFIRM, String(snapshotBootPowerConfirm));
    localStorage.setItem(STORAGE_KEYS.WELCOME_SPLASH, String(snapshotWelcomeSplash));
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, String(snapshotAutoSaveEnabled));
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_INTERVAL_MS, String(snapshotAutoSaveIntervalMs));
    localStorage.setItem(STORAGE_KEYS.BG_PATTERN, snapshotBgPattern);
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_ICONS, JSON.stringify(snapshotSidebarIcons));
    localStorage.setItem(STORAGE_KEYS.THEME_STUDIO, JSON.stringify(snapshotThemeStudio));
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(featureStates));
    updateAutoSaveStatusUi();
    updateCrashReportStatusUi();
}

function startResetUndoWindow(snapshot) {
    if (resetUndoState.timeoutId) {
        clearTimeout(resetUndoState.timeoutId);
    }

    resetUndoState.snapshot = snapshot;
    resetUndoState.expiresAt = Date.now() + 10000;
    resetUndoState.timeoutId = setTimeout(() => {
        resetUndoState.snapshot = null;
        resetUndoState.timeoutId = null;
        resetUndoState.expiresAt = 0;
    }, 10000);

    showNotification('Everything has been reset to default!', {
        duration: 10000,
        actionLabel: 'UNDO',
        onAction: undoLastReset
    });
}

function undoLastReset() {
    if (!resetUndoState.snapshot || Date.now() > resetUndoState.expiresAt) {
        showNotification('Undo window expired.');
        return;
    }

    const snapshot = resetUndoState.snapshot;
    clearTimeout(resetUndoState.timeoutId);
    resetUndoState.snapshot = null;
    resetUndoState.timeoutId = null;
    resetUndoState.expiresAt = 0;

    restoreLocalStorageSnapshot(snapshot.storage);
    applyUiSnapshot(snapshot.ui);
    loadKeybindMapFromStorage();
    loadKeybindModeMapFromStorage();
    loadKeybindProfileTargetsFromStorage();
    renderKeybindActions(activeKeybindGroup);
    loadProfiles();
    setupQuickToggle();
    updateFeatureStatusOverview();
    applyMicroCardAnimations(document);
    showNotification('Reset undone.');
}

function loadSettings() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    const savedAccent = localStorage.getItem(STORAGE_KEYS.ACCENT) || '#00d9ff';
    const savedGradientAccentEnabled = getSavedGradientAccentEnabled();
    const savedGradientAccent2 = getSavedGradientAccentColor2();
    const savedRadius = localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS) || '8';
    const savedOpacity = localStorage.getItem(STORAGE_KEYS.OPACITY) || '100';
    const savedButtonSoundsEnabled = getSavedButtonSoundEnabled();
    const savedButtonSoundType = getSavedButtonSoundType();
    const savedButtonSoundVolume = getSavedButtonSoundVolume();
    const savedSwitchSoundsEnabled = getSavedSwitchSoundEnabled();
    const savedSwitchSoundType = getSavedSwitchSoundType();
    const savedSwitchSoundVolume = getSavedSwitchSoundVolume();
    const savedPerformanceMode = getSavedPerformanceMode();
    const savedUiLockMode = getSavedUiLockMode();
    const savedFocusMode = getSavedFocusMode();
    const savedSafetyLockMode = getSavedSafetyLockMode();
    const savedSafetyLockHoldMs = getSavedSafetyLockHoldMs();
    const savedStartupPage = getSavedStartupPageSetting();
    const savedBootPowerConfirm = getSavedBootPowerConfirm();
    const savedWelcomeSplash = getSavedWelcomeSplashEnabled();
    const savedAutoSaveEnabled = getSavedAutoSaveEnabled();
    const savedAutoSaveIntervalMs = getSavedAutoSaveIntervalMs();
    const savedThemeStudio = getSavedThemeStudioSettings();

    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('accentColor').value = savedAccent;
    const gradientAccentEnabled = document.getElementById('gradientAccentEnabled');
    const gradientAccentColor2 = document.getElementById('gradientAccentColor2');
    if (gradientAccentEnabled) gradientAccentEnabled.checked = savedGradientAccentEnabled;
    if (gradientAccentColor2) gradientAccentColor2.value = savedGradientAccent2;
    document.getElementById('borderRadiusSlider').value = savedRadius;
    document.getElementById('borderRadiusInput').value = savedRadius;
    document.getElementById('opacitySlider').value = savedOpacity;
    document.getElementById('opacityInput').value = savedOpacity;
    document.getElementById('enableButtonSounds').checked = savedButtonSoundsEnabled;
    document.getElementById('buttonSoundSelect').value = savedButtonSoundType;
    document.getElementById('buttonSoundVolume').value = String(savedButtonSoundVolume);
    document.getElementById('buttonSoundVolumeInput').value = String(savedButtonSoundVolume);
    document.getElementById('buttonSoundSelect').disabled = !savedButtonSoundsEnabled;
    document.getElementById('buttonSoundVolume').disabled = !savedButtonSoundsEnabled;
    document.getElementById('buttonSoundVolumeInput').disabled = !savedButtonSoundsEnabled;
    document.getElementById('enableSwitchSounds').checked = savedSwitchSoundsEnabled;
    document.getElementById('switchSoundSelect').value = savedSwitchSoundType;
    document.getElementById('switchSoundVolume').value = String(savedSwitchSoundVolume);
    document.getElementById('switchSoundVolumeInput').value = String(savedSwitchSoundVolume);
    document.getElementById('switchSoundSelect').disabled = !savedSwitchSoundsEnabled;
    document.getElementById('switchSoundVolume').disabled = !savedSwitchSoundsEnabled;
    document.getElementById('switchSoundVolumeInput').disabled = !savedSwitchSoundsEnabled;
    const startupSelect = document.getElementById('startupPageSelect');
    if (startupSelect) startupSelect.value = savedStartupPage;
    const bootPowerConfirmToggle = document.getElementById('enableBootPowerConfirm');
    if (bootPowerConfirmToggle) bootPowerConfirmToggle.checked = savedBootPowerConfirm;
    const welcomeSplashToggle = document.getElementById('enableWelcomeSplash');
    if (welcomeSplashToggle) welcomeSplashToggle.checked = savedWelcomeSplash;
    const performanceToggle = document.getElementById('enablePerformanceMode');
    const uiLockToggle = document.getElementById('enableUiLockMode');
    const focusModeToggle = document.getElementById('enableFocusMode');
    const safetyLockModeToggle = document.getElementById('enableSafetyLockMode');
    const safetyLockHoldSlider = document.getElementById('safetyLockHoldSlider');
    const safetyLockHoldInput = document.getElementById('safetyLockHoldInput');
    const safetyLockHoldPreview = document.getElementById('safetyLockHoldPreview');
    const autoSaveToggle = document.getElementById('enableAutoSaveMode');
    const autoSaveSlider = document.getElementById('autoSaveIntervalSlider');
    const autoSaveInput = document.getElementById('autoSaveIntervalInput');
    const bgPatternSelect = document.getElementById('bgPatternSelect');
    if (performanceToggle) performanceToggle.checked = savedPerformanceMode;
    if (uiLockToggle) uiLockToggle.checked = savedUiLockMode;
    if (focusModeToggle) focusModeToggle.checked = savedFocusMode;
    if (safetyLockModeToggle) safetyLockModeToggle.checked = savedSafetyLockMode;
    if (safetyLockHoldSlider) safetyLockHoldSlider.value = String(savedSafetyLockHoldMs);
    if (safetyLockHoldInput) safetyLockHoldInput.value = String(savedSafetyLockHoldMs);
    if (safetyLockHoldPreview) safetyLockHoldPreview.textContent = formatSafetyLockHoldLabel(savedSafetyLockHoldMs);
    if (autoSaveToggle) autoSaveToggle.checked = savedAutoSaveEnabled;
    if (autoSaveSlider) autoSaveSlider.value = String(Math.round(savedAutoSaveIntervalMs / 1000));
    if (autoSaveInput) autoSaveInput.value = String(Math.round(savedAutoSaveIntervalMs / 1000));
    if (bgPatternSelect) bgPatternSelect.value = getSavedBgPattern();

    setRuntimeSoundSettings(savedButtonSoundsEnabled, savedButtonSoundType, savedButtonSoundVolume);
    setRuntimeSwitchSoundSettings(savedSwitchSoundsEnabled, savedSwitchSoundType, savedSwitchSoundVolume);
    setPerformanceMode(savedPerformanceMode);
    setUiLockMode(savedUiLockMode);
    setFocusMode(savedFocusMode);
    setSafetyLockMode(savedSafetyLockMode);
    updateGradientAccentPreview(savedAccent, savedGradientAccent2, savedGradientAccentEnabled);
    applyGradientAccentRuntime(savedAccent);
    setSafetyLockHoldMs(savedSafetyLockHoldMs, { persist: false });
    applyThemeStudioSettings(savedThemeStudio, { persist: false });
    syncThemeStudioControlsFromSettings(savedThemeStudio);
    applyBackgroundPattern(getSavedBgPattern(), { persist: false });
    themeStudioDraftState.bgPattern = getSavedBgPattern();
    themeStudioDraftState.sidebarIcons = { ...getSavedSidebarIconOverrides() };
    applySidebarIconOverrides(themeStudioDraftState.sidebarIcons);
    setAutoSaveEnabled(savedAutoSaveEnabled, { persist: false });
    loadKeybindMapFromStorage();
    loadKeybindModeMapFromStorage();
    loadKeybindProfileTargetsFromStorage();
    renderKeybindActions(activeKeybindGroup);
    loadPluginsFromStorage();
    renderPluginsList();
    setWorkspaceSyncStatus(localStorage.getItem(STORAGE_KEYS.WORKSPACE_SYNC_LAST) || 'No workspace sync action yet.', false);
    hackDemoState.refreshMs = getSavedDebugRefreshRate();
    setHackDemoCompactMode(getSavedDebugCompactMode(), false);
    setHackDemoAutoScroll(getSavedDebugAutoScroll(), false);
    updateHackDemoControlsUi();
    refreshDebugEnvironmentMetrics();
    renderHackDemoPanel();
    setActiveDebugMetric(hackDemoState.activeMetric);

    // Load feature states
    loadFeatureStates();
    ensureProfilesAndRolesConsistency();
    updateAutoSaveStatusUi();
    updateCrashReportStatusUi();
    applyRoleBasedControlState();
    refreshCustomColorInputDisplays();
    updateProfileUnsavedIndicator();
}

// ===== FEATURE MANAGEMENT =====
function saveFeatureStates() {
    const features = {};
    const toggles = document.querySelectorAll('.toggle-input');

    toggles.forEach(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim();
        if (!feature || feature === 'null' || feature === 'undefined') return;
        features[feature] = toggle.checked;
    });

    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(features));
}

function loadFeatureStates() {
    const savedFeatures = localStorage.getItem(STORAGE_KEYS.FEATURES);
    if (!savedFeatures) return;

    const features = JSON.parse(savedFeatures);
    Object.keys(features).forEach(feature => {
        const featureKey = (feature || '').trim();
        if (!featureKey || featureKey === 'null' || featureKey === 'undefined') return;

        const toggle = document.querySelector(`[data-feature="${featureKey}"]`);
        if (toggle) {
            toggle.checked = Boolean(features[feature]);
        }
    });
}

// Initialize feature state saving on toggle change
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.toggle-input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', saveFeatureStates);
    });
});

// ===== SLIDER AND SPINBOX SYNCHRONIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider:not(#borderRadiusSlider):not(#opacitySlider)');
    const spinboxes = document.querySelectorAll('.spinbox:not(#borderRadiusInput):not(#opacityInput)');

    // Sync sliders with spinboxes
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const inputGroup = slider.closest('.input-group');
            const spinbox = inputGroup.querySelector('.spinbox');
            if (spinbox) {
                spinbox.value = slider.value;
            }
        });
    });

    // Sync spinboxes with sliders
    spinboxes.forEach(spinbox => {
        spinbox.addEventListener('input', () => {
            const inputGroup = spinbox.closest('.input-group');
            const slider = inputGroup.querySelector('.slider');
            if (slider) {
                slider.value = spinbox.value;
            }
        });
    });
});

// ===== NOTIFICATIONS =====
function showNotification(message, options = {}) {
    const {
        duration = 2200,
        actionLabel = '',
        onAction = null
    } = options;

    let feed = document.getElementById('toastFeed');
    if (!feed) {
        feed = document.createElement('div');
        feed.id = 'toastFeed';
        feed.className = 'toast-feed';
        feed.setAttribute('aria-live', 'polite');
        feed.setAttribute('aria-atomic', 'false');
        document.body.appendChild(feed);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';

    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'toast-actions';

    if (actionLabel && typeof onAction === 'function') {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'toast-btn';
        actionBtn.textContent = actionLabel;
        actionBtn.addEventListener('click', () => {
            onAction();
            dismissToast();
        });
        actionsEl.appendChild(actionBtn);
    }

    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'toast-btn';
    dismissBtn.textContent = 'CLOSE';
    dismissBtn.addEventListener('click', dismissToast);
    actionsEl.appendChild(dismissBtn);

    toast.appendChild(actionsEl);
    feed.prepend(toast);

    let removed = false;
    const timerId = setTimeout(dismissToast, duration);

    function dismissToast() {
        if (removed) return;
        removed = true;
        clearTimeout(timerId);
        toast.classList.add('is-closing');
        setTimeout(() => toast.remove(), 220);
    }
}

// ===== ENHANCEMENTS (SEARCH, FAVORITES, QUICK TOGGLE, IMPORT/EXPORT, PRESETS, SHORTCUTS, DnD) =====
function initializeEnhancements() {
    setupSearch();
    setupFavorites();
    initializeTargetSelectors();
    setupFeatureCardTooltips();
    setupQuickToggle();
    setupImportExport();
    setupPresets();
    setupKeyboardShortcuts();
    setupDragAndDrop();
    setupUsageTracking();
    setupRecentChangesControls();
    updateFeatureStatusOverview();
    renderRecentChanges();
    applyMicroCardAnimations(document);
}

function setupSearch() {
    const input = document.getElementById('featureSearch');
    const dropdown = document.getElementById('searchDropdown');
    if (!input || !dropdown) return;

    const featureCards = Array.from(document.querySelectorAll('.feature-card'));
    const settingCards = Array.from(document.querySelectorAll(
        '#page-settings .settings-section .setting-card, #settingsDebugPage .setting-card, #settingsMarketplacePage .setting-card, #settingsThemeStudioPage .setting-card, #settingsWorkflowPage .setting-card, #settingsCustomPagesPage .setting-card, #page-about .setting-card, #page-support .setting-card, #page-changelog .setting-card'
    ));

    const resetFeatureVisibility = () => {
        featureCards.forEach(card => {
            card.style.display = '';
        });
    };

    const clearSearchUi = () => {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        resetFeatureVisibility();
    };

    const getSettingSearchEntry = (card) => {
        const title = (
            card.querySelector('label')?.textContent ||
            card.querySelector('h3')?.textContent ||
            ''
        ).trim();
        if (!title) return null;

        const rootPage = String(card.closest('[data-page]')?.getAttribute('data-page') || 'settings').trim().toLowerCase();
        if (rootPage !== 'settings') {
            const sectionTitle = (
                card.closest('.settings-section')?.querySelector('h2')?.textContent ||
                rootPage
            ).trim();

            const parts = [title, sectionTitle, rootPage];
            const noteText = card.querySelector('.setting-note')?.textContent?.trim();
            if (noteText) parts.push(noteText);
            card.querySelectorAll('button, option').forEach(el => {
                const text = String(el.textContent || '').trim();
                if (text) parts.push(text);
            });

            return {
                type: 'setting',
                title,
                page: rootPage,
                badge: rootPage.toUpperCase(),
                settingsSubpage: 'main',
                searchText: parts.join(' ').toLowerCase(),
                element: card
            };
        }

        const inDebugDashboard = Boolean(card.closest('#settingsDebugPage'));
        const inMarketplace = Boolean(card.closest('#settingsMarketplacePage'));
        const inThemeStudio = Boolean(card.closest('#settingsThemeStudioPage'));
        const inWorkflowCanvas = Boolean(card.closest('#settingsWorkflowPage'));
        const inCustomPages = Boolean(card.closest('#settingsCustomPagesPage'));
        const sectionTitle = (
            card.closest('.settings-section')?.querySelector('h2')?.textContent ||
            (inDebugDashboard
                ? 'Debug Dashboard'
                : (inMarketplace
                    ? 'Plugin Marketplace'
                    : (inThemeStudio
                        ? 'Theme Studio'
                        : (inWorkflowCanvas ? 'Workflow Canvas' : (inCustomPages ? 'Custom Page Studio' : 'Settings')))))
        ).trim();

        const parts = [title, sectionTitle];
        const noteText = card.querySelector('.setting-note')?.textContent?.trim();
        if (noteText) parts.push(noteText);

        card.querySelectorAll('option').forEach(optionEl => {
            const text = optionEl.textContent.trim();
            if (text) parts.push(text);
        });

        card.querySelectorAll('button').forEach(buttonEl => {
            const text = buttonEl.textContent.trim();
            if (text) parts.push(text);
        });

        return {
            type: 'setting',
            title,
            page: 'settings',
            badge: `SETTINGS | ${sectionTitle.toUpperCase()}`,
            settingsSubpage: inDebugDashboard
                ? 'debug'
                : (inMarketplace
                    ? 'marketplace'
                    : (inThemeStudio
                        ? 'theme-studio'
                        : (inWorkflowCanvas ? 'workflow-canvas' : (inCustomPages ? 'custom-pages' : 'main')))),
            searchText: parts.join(' ').toLowerCase(),
            element: card
        };
    };

    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();

        if (q.length === 0) {
            clearSearchUi();
            return;
        }

        const results = [];

        featureCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.trim() || '';
            const page = card.closest('[data-page]')?.getAttribute('data-page') || 'unknown';
            const searchable = `${title} ${page}`.toLowerCase();
            const isMatch = searchable.includes(q);

            card.style.display = isMatch ? '' : 'none';
            if (isMatch) {
                results.push({
                    type: 'feature',
                    title,
                    page,
                    badge: page.toUpperCase(),
                    searchText: searchable,
                    element: card
                });
            }
        });

        settingCards.forEach(card => {
            const entry = getSettingSearchEntry(card);
            if (!entry) return;
            if (!entry.searchText.includes(q)) return;
            results.push(entry);
        });

        if (!results.length) {
            dropdown.innerHTML = '<div class="search-result" style="cursor: default; text-align: center; color: var(--text-secondary);">No features or settings found</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map((result, index) => `
            <div class="search-result" data-index="${index}">
                <span>${result.title}</span>
                <span class="search-result-page">${result.badge}</span>
            </div>
        `).join('');
        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.search-result').forEach((resultEl, index) => {
            resultEl.addEventListener('click', () => {
                const result = results[index];
                if (!result) return;

                if (result.type === 'setting') {
                    closeKeybindConfigurator();
                    closeMacroConfigurator();
                    closeAutomationConfigurator();
                    closeWorkflowCanvasConfigurator();
                    closeCustomPagesConfigurator();
                    if (result.settingsSubpage === 'debug') {
                        openDebugDashboard();
                        closePluginMarketplace();
                        closeThemeStudio();
                    } else if (result.settingsSubpage === 'workflow-canvas') {
                        closeDebugDashboard();
                        closePluginMarketplace();
                        closeThemeStudio();
                        openWorkflowCanvasConfigurator();
                    } else if (result.settingsSubpage === 'custom-pages') {
                        closeDebugDashboard();
                        closePluginMarketplace();
                        closeThemeStudio();
                        openCustomPagesConfigurator();
                    } else if (result.settingsSubpage === 'marketplace') {
                        closeDebugDashboard();
                        openPluginMarketplace();
                        closeThemeStudio();
                    } else if (result.settingsSubpage === 'theme-studio') {
                        closeDebugDashboard();
                        closePluginMarketplace();
                        openThemeStudio();
                    } else {
                        closeDebugDashboard();
                        closePluginMarketplace();
                        closeThemeStudio();
                    }
                }

                selectPage(result.page);
                updatePageTitle(result.page);

                setTimeout(() => {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    result.element.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6)';
                    setTimeout(() => {
                        result.element.style.boxShadow = '';
                    }, 2000);
                }, 100);

                input.value = '';
                clearSearchUi();
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-controls')) {
            dropdown.style.display = 'none';
        }
    });
}

function setupFavorites() {
    const favs = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
    document.querySelectorAll('.feature-card').forEach(card => {
        const name = card.querySelector('h3')?.textContent.trim();
        if (!name) return;
        card.setAttribute('draggable', String(!isUiLockModeEnabled()));
        const star = document.createElement('span');
        star.className = 'favorite-star';
        star.textContent = '\u2606';
        if (favs.includes(name)) { star.classList.add('active'); star.textContent = '\u2605'; }
        star.title = 'Favorite hack';
        star.addEventListener('click', () => {
            let list = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
            if (list.includes(name)) {
                list = list.filter(x => x !== name);
                star.classList.remove('active'); star.textContent = '\u2606';
            } else {
                list.unshift(name);
                star.classList.add('active'); star.textContent = '\u2605';
            }
            localStorage.setItem('nexus-favorites', JSON.stringify(list));
            setupQuickToggle();
            recordRecentChange(`Hack favorite ${list.includes(name) ? 'added' : 'removed'}: ${name}`);
        });
        const header = card.querySelector('.feature-header');
        if (header) header.appendChild(star);
        // tooltip: use description attribute if present
        const desc = card.getAttribute('data-desc') || card.querySelector('h3')?.textContent;
        if (desc) card.title = desc;
    });
}

function setupQuickToggle() {
    const bar = document.getElementById('quickToggleBar');
    if (!bar) return;

    const isValidName = (value) => {
        const text = String(value ?? '').trim();
        const lower = text.toLowerCase();
        return text !== '' && lower !== 'null' && lower !== 'undefined';
    };

    bar.innerHTML = '';

    const rawHackFavorites = JSON.parse(localStorage.getItem('nexus-favorites') || '[]');
    const hackFavorites = (Array.isArray(rawHackFavorites) ? rawHackFavorites : [])
        .map(name => String(name).trim())
        .filter(isValidName);

    const availableProfiles = getProfilesDataFromStorage();
    const profileFavorites = getFavoriteProfiles()
        .filter(isValidName)
        .filter(name => Object.prototype.hasOwnProperty.call(availableProfiles, name));

    const presetFavorites = getFavoritePresetIds()
        .filter(isValidName)
        .filter(id => Boolean(getPresetDataById(id)));

    saveFavoriteProfiles(profileFavorites);
    saveFavoritePresetIds(presetFavorites);

    const renderSection = (title, items, clickHandler) => {
        if (!items.length) return;

        if (bar.children.length > 0) {
            const sep = document.createElement('span');
            sep.className = 'quick-toggle-separator';
            bar.appendChild(sep);
        }

        const label = document.createElement('span');
        label.className = 'quick-toggle-section-title';
        label.textContent = title;
        bar.appendChild(label);

        items.slice(0, 5).forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'quick-toggle-btn';
            btn.textContent = item.label;
            btn.addEventListener('click', () => clickHandler(item.value));
            bar.appendChild(btn);
        });
    };

    renderSection(
        'Favorite Hacks',
        hackFavorites.map(name => ({ label: name, value: name })),
        (name) => {
            const normalized = name.toLowerCase().replace(/\s+/g, '');
            const candidate = Array.from(document.querySelectorAll('.toggle-input')).find(el => {
                const feature = (el.getAttribute('data-feature') || '').toLowerCase();
                return feature && feature !== 'null' && feature !== 'undefined' && feature.includes(normalized);
            });
            if (!candidate) return;
            const prev = candidate.checked;
            try {
                suspendRecentTracking = true;
                candidate.checked = !candidate.checked;
                candidate.dispatchEvent(new Event('change', { bubbles: true }));
                updateFeatureStatusOverview();
            } finally {
                suspendRecentTracking = false;
            }
            recordRecentChange(`Quick bar toggled ${name}`, () => {
                try {
                    suspendRecentTracking = true;
                    candidate.checked = prev;
                    candidate.dispatchEvent(new Event('change', { bubbles: true }));
                    updateFeatureStatusOverview();
                } finally {
                    suspendRecentTracking = false;
                }
            });
        }
    );

    renderSection(
        'Favorite Profiles',
        profileFavorites.map(name => ({ label: name, value: name })),
        (profileName) => {
            const current = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
            if (profileName === current) return;
            loadProfile(profileName);
            recordRecentChange(`Quick bar profile load: ${profileName}`, () => loadProfile(current));
        }
    );

    renderSection(
        'Favorite Presets',
        presetFavorites.map(id => ({ label: getPresetLabelById(id), value: id })),
        (presetId) => {
            applyPresetById(presetId, { fromQuickBar: true });
        }
    );

    if (!hackFavorites.length && !profileFavorites.length && !presetFavorites.length) {
        const empty = document.createElement('span');
        empty.className = 'quick-toggle-section-title';
        empty.textContent = 'No favorites yet';
        bar.appendChild(empty);
    }
}

function setupImportExport() {
    const exportBtn = document.getElementById('exportProfileBtn');
    const importFileBtn = document.getElementById('importProfileFileBtn');
    const importFile = document.getElementById('importProfileFile');
    const importFileName = document.getElementById('importFileName');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!isRoleAllowed('profiles')) {
                showNotification('Profile export is blocked for this profile role.');
                return;
            }
            const current = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || 'Default';
            const profiles = getProfilesDataFromStorage();
            const data = profiles[current] || {
                theme: localStorage.getItem(STORAGE_KEYS.THEME),
                accent: localStorage.getItem(STORAGE_KEYS.ACCENT),
                borderRadius: localStorage.getItem(STORAGE_KEYS.BORDER_RADIUS),
                opacity: localStorage.getItem(STORAGE_KEYS.OPACITY),
                layout: localStorage.getItem(STORAGE_KEYS.LAYOUT),
                features: localStorage.getItem(STORAGE_KEYS.FEATURES),
                buttonSoundsEnabled: getSavedButtonSoundEnabled(),
                buttonSoundType: getSavedButtonSoundType(),
                buttonSoundVolume: getSavedButtonSoundVolume(),
                switchSoundsEnabled: getSavedSwitchSoundEnabled(),
                switchSoundType: getSavedSwitchSoundType(),
                switchSoundVolume: getSavedSwitchSoundVolume(),
                performanceMode: getSavedPerformanceMode(),
                uiLockMode: getSavedUiLockMode(),
                plugins: getCurrentPluginsForProfileData()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${current}-nexus-profile.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (importFileBtn) {
        importFileBtn.addEventListener('click', () => {
            importFile.click();
        });
    }

    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (!isRoleAllowed('profiles')) {
                showNotification('Profile import is blocked for this profile role.');
                return;
            }
            const file = e.target.files[0];
            if (file && importFileName) {
                importFileName.textContent = file.name;
                importFileName.style.color = '#00d9ff';
            }
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const obj = JSON.parse(reader.result);
                    const name = prompt('Name for imported profile:', file.name.replace(/\.json$/i, ''));
                    if (!name) return showNotification('Import cancelled');

                    const profiles = getProfilesDataFromStorage();
                    profiles[name] = obj;
                    saveProfilesDataToStorage(profiles);
                    if (!CORE_PROFILE_NAMES.has(name)) {
                        setProfileRole(name, PROFILE_ROLES.STANDARD, { silent: true });
                    }
                    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, name);
                    loadProfile(name);
                    showNotification('Profile imported!');
                } catch (err) {
                    showNotification('Invalid JSON');
                }
            };
            reader.readAsText(file);
        });
    }
}

function setupPresets() {
    const presetBtns = document.querySelectorAll('[data-preset]');
    const saveCustomPresetBtn = document.getElementById('saveCustomPresetBtn');
    const customPresetNameInput = document.getElementById('customPresetName');

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-preset');
            applyPresetById(`builtin:${key}`);
        });
    });

    if (saveCustomPresetBtn && customPresetNameInput) {
        saveCustomPresetBtn.addEventListener('click', () => {
            const name = String(customPresetNameInput.value || '').trim();
            if (!name) {
                showNotification('Enter a custom preset name first.');
                return;
            }

            const customPresets = getCustomPresets();
            const currentFeatures = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURES) || '{}');
            customPresets[name] = currentFeatures;
            saveCustomPresets(customPresets);
            customPresetNameInput.value = '';
            renderCustomPresetList();
            showNotification(`Custom preset saved: ${name}`);
            recordRecentChange(`Custom preset saved: ${name}`, () => {
                const next = getCustomPresets();
                delete next[name];
                saveCustomPresets(next);
                renderCustomPresetList();
            });
        });
    }

    decorateBuiltinPresetFavorites();
    renderCustomPresetList();
}

function getPresetLabelById(presetId) {
    if (presetId.startsWith('builtin:')) return presetId.replace('builtin:', '').toUpperCase();
    if (presetId.startsWith('custom:')) return presetId.replace('custom:', '');
    return presetId;
}

function getPresetDataById(presetId) {
    if (presetId.startsWith('builtin:')) {
        const key = presetId.replace('builtin:', '');
        return BUILTIN_HACK_PRESETS[key] || null;
    }
    if (presetId.startsWith('custom:')) {
        const key = presetId.replace('custom:', '');
        return getCustomPresets()[key] || null;
    }
    return null;
}

function applyPresetById(presetId, options = {}) {
    const presetData = getPresetDataById(presetId);
    if (!presetData) {
        showNotification('Preset not found.');
        return;
    }

    const beforeFeatures = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURES) || '{}');
    const nextFeatures = { ...beforeFeatures };
    Object.keys(presetData).forEach(feature => {
        nextFeatures[feature] = Boolean(presetData[feature]);
    });
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(nextFeatures));
    loadFeatureStates();
    setupQuickToggle();

    const label = getPresetLabelById(presetId);
    showNotification(`Hack preset applied: ${label}`);
    recordRecentChange(`Preset applied: ${label}`, () => {
        localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(beforeFeatures));
        loadFeatureStates();
        setupQuickToggle();
    });

    if (!options.fromQuickBar) {
        applyMicroCardAnimations(document.querySelector('#page-settings'));
    }
}

function togglePresetFavorite(presetId) {
    const previousFavorites = getFavoritePresetIds();
    let favorites = getFavoritePresetIds();
    if (favorites.includes(presetId)) {
        favorites = favorites.filter(id => id !== presetId);
    } else {
        favorites.unshift(presetId);
    }
    saveFavoritePresetIds(favorites);
    setupQuickToggle();
    decorateBuiltinPresetFavorites();
    renderCustomPresetList();
    const label = getPresetLabelById(presetId);
    recordRecentChange(`Preset favorite ${favorites.includes(presetId) ? 'added' : 'removed'}: ${label}`, () => {
        saveFavoritePresetIds(previousFavorites);
        setupQuickToggle();
        decorateBuiltinPresetFavorites();
        renderCustomPresetList();
    });
}

function decorateBuiltinPresetFavorites() {
    const favorites = getFavoritePresetIds();
    document.querySelectorAll('[data-preset]').forEach(btn => {
        const key = btn.getAttribute('data-preset');
        const presetId = `builtin:${key}`;
        let wrap = btn.parentElement;
        if (!wrap || !wrap.classList.contains('preset-fav-wrap')) {
            wrap = document.createElement('div');
            wrap.className = 'preset-fav-wrap';
            btn.parentNode.insertBefore(wrap, btn);
            wrap.appendChild(btn);

            const star = document.createElement('span');
            star.className = 'preset-fav-star';
            star.title = 'Favorite preset';
            star.addEventListener('click', () => togglePresetFavorite(presetId));
            wrap.appendChild(star);
        }
    });

    document.querySelectorAll('[data-preset]').forEach(btn => {
        const key = btn.getAttribute('data-preset');
        const presetId = `builtin:${key}`;
        const star = btn.parentElement?.querySelector('.preset-fav-star');
        if (!star) return;
        const active = favorites.includes(presetId);
        star.textContent = active ? '\u2605' : '\u2606';
        star.classList.toggle('active', active);
    });
}

function renderCustomPresetList() {
    const list = document.getElementById('customPresetsList');
    if (!list) return;

    const presets = getCustomPresets();
    const names = Object.keys(presets);
    const favorites = getFavoritePresetIds();
    list.innerHTML = '';

    if (!names.length) {
        const empty = document.createElement('div');
        empty.className = 'recent-change-empty';
        empty.textContent = 'No custom presets yet.';
        list.appendChild(empty);
        return;
    }

    names.forEach(name => {
        const presetId = `custom:${name}`;
        const row = document.createElement('div');
        row.className = 'custom-preset-item';

        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';

        const star = document.createElement('span');
        const active = favorites.includes(presetId);
        star.className = `preset-fav-star${active ? ' active' : ''}`;
        star.textContent = active ? '\u2605' : '\u2606';
        star.title = 'Favorite preset';
        star.addEventListener('click', () => togglePresetFavorite(presetId));

        const title = document.createElement('span');
        title.className = 'custom-preset-name';
        title.textContent = name;

        left.appendChild(star);
        left.appendChild(title);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';

        const applyBtn = document.createElement('button');
        applyBtn.className = 'profile-item-btn';
        applyBtn.textContent = 'APPLY';
        applyBtn.addEventListener('click', () => applyPresetById(presetId));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'profile-item-btn';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.addEventListener('click', () => {
            const prev = getCustomPresets();
            const deletedData = prev[name];
            delete prev[name];
            saveCustomPresets(prev);
            saveFavoritePresetIds(getFavoritePresetIds().filter(id => id !== presetId));
            renderCustomPresetList();
            setupQuickToggle();
            showNotification(`Custom preset deleted: ${name}`);
            recordRecentChange(`Custom preset deleted: ${name}`, () => {
                const restore = getCustomPresets();
                restore[name] = deletedData;
                saveCustomPresets(restore);
                renderCustomPresetList();
                setupQuickToggle();
            });
        });

        actions.appendChild(applyBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(left);
        row.appendChild(actions);
        list.appendChild(row);
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!e.altKey) return;
        const key = e.key.toLowerCase();
        if (key === '1') selectPage('combat');
        if (key === '2') selectPage('hacks');
        if (key === '3') selectPage('visuals');
        if (key === '4') selectPage('settings');
        if (key === 'k') {
            const el = document.querySelector('.toggle-input[data-feature="killaura"]') || document.querySelector('.toggle-input[data-feature*="killaura"]');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change', { bubbles: true })); }
        }
    });
}

function setupDragAndDrop() {
    document.querySelectorAll('.features-grid').forEach(grid => {
        let dragSrc = null;
        grid.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                if (isUiLockModeEnabled() || getSavedPerformanceMode() || multiSelectMode) {
                    e.preventDefault();
                    return;
                }
                dragSrc = card; card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => { if (dragSrc) dragSrc.classList.remove('dragging'); dragSrc = null; saveGridOrder(grid); });
            card.addEventListener('dragover', (e) => { e.preventDefault(); const target = e.currentTarget; if (dragSrc && target !== dragSrc) grid.insertBefore(dragSrc, target.nextSibling); });
        });
        // restore order
        restoreGridOrder(grid);
    });
    refreshDragState();
}

function refreshDragState() {
    const canDrag = !isUiLockModeEnabled() && !getSavedPerformanceMode() && !multiSelectMode;
    document.querySelectorAll('.feature-card').forEach(card => {
        card.setAttribute('draggable', String(canDrag));
    });
}

function saveGridOrder(grid) {
    const id = grid.id || 'grid';
    const order = Array.from(grid.querySelectorAll('.feature-card')).map(c => c.querySelector('h3')?.textContent.trim());
    localStorage.setItem('nexus-order-' + id, JSON.stringify(order));
}

function restoreGridOrder(grid) {
    const id = grid.id || 'grid';
    const order = JSON.parse(localStorage.getItem('nexus-order-' + id) || '[]');
    if (!order.length) return;
    const map = {};
    Array.from(grid.querySelectorAll('.feature-card')).forEach(c => { map[c.querySelector('h3')?.textContent.trim()] = c; });
    grid.innerHTML = '';
    order.forEach(name => { if (map[name]) grid.appendChild(map[name]); });
    // append remaining
    Object.keys(map).forEach(k => { if (!order.includes(k)) grid.appendChild(map[k]); });
}

function setupBatchButtons() {
    // Deprecated: global enable/disable buttons intentionally removed.
}

function setupUsageTracking() {
    document.querySelectorAll('.toggle-input').forEach(el => {
        el.addEventListener('change', () => {
            if (suspendRecentTracking) return;

            const feature = (el.getAttribute('data-feature') || '').trim();
            const labelFromIdMap = {
                enableButtonSounds: 'Button Sounds',
                enableSwitchSounds: 'Switch Sounds',
                enablePerformanceMode: 'Performance Mode',
                enableUiLockMode: 'UI Lock Mode',
                enableFocusMode: 'Focus Mode',
                enableSafetyLockMode: 'Safety Lock',
                enableBootPowerConfirm: 'Boot Power Confirmation'
            };

            const previousValue = !el.checked;
            let label = feature;
            if (!label || label === 'null' || label === 'undefined') {
                label = labelFromIdMap[el.id] || el.id || 'Toggle';
            }

            recordRecentChange(`${label} ${el.checked ? 'enabled' : 'disabled'}`, () => {
                el.checked = previousValue;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                updateFeatureStatusOverview();
            });

            if (!feature || feature === 'null' || feature === 'undefined') {
                updateFeatureStatusOverview();
                return;
            }

            const usage = JSON.parse(localStorage.getItem('nexus-usage') || '{}');
            usage[feature] = (usage[feature] || 0) + 1;
            localStorage.setItem('nexus-usage', JSON.stringify(usage));
            updateFeatureStatusOverview();
        });
    });
}

function updateFeatureStatusOverview() {
    const hackToggles = Array.from(document.querySelectorAll('.toggle-input[data-feature]')).filter(toggle => {
        const feature = (toggle.getAttribute('data-feature') || '').trim().toLowerCase();
        return feature && feature !== 'null' && feature !== 'undefined';
    });
    const total = hackToggles.length;
    const active = hackToggles.filter(t => t.checked).length;
    // show small badge in header
    let badge = document.getElementById('featureStatusBadge');
    if (!badge) {
        badge = document.createElement('div'); badge.id = 'featureStatusBadge'; badge.style.marginLeft='12px'; badge.style.color='var(--text-secondary)';
        document.querySelector('.header-status').appendChild(badge);
    }
    badge.textContent = `${active}/${total} active`;
    updateMiniHudData();
}

function applyMicroCardAnimations(scope = document) {
    const cards = scope.querySelectorAll('.feature-card, .setting-card, .profile-item');
    cards.forEach((card, index) => {
        card.style.setProperty('--micro-delay', `${Math.min(index * 28, 340)}ms`);
        card.classList.remove('micro-card-enter');
        void card.offsetWidth;
        card.classList.add('micro-card-enter');
    });
}

// small helper to find toggle by feature short name
function findToggleByFeatureShort(name) {
    return document.querySelector(`.toggle-input[data-feature="${name}"]`) || document.querySelector(`.toggle-input[data-feature*="${name}"]`);
}
