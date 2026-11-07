(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$auth$2d$screen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/auth-screen.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$app$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/app-shell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$home$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/home-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$puzzles$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/puzzles-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$cases$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/cases-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$gd$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/gd-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$arena$2f$arena$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/arena/arena-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$quiz$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/quiz-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$crosswords$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/crosswords-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$leaderboard$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/leaderboard-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$studio$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/welearn/studio-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
function Page() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("home");
    const [streak, setStreak] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            // Restore session from localStorage after mount (deferred to keep hydration clean)
            let cancelled = false;
            Promise.resolve().then({
                "Page.useEffect": ()=>{
                    if (cancelled) return;
                    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadSession"])();
                    if (s) setUser(s);
                    setReady(true);
                }
            }["Page.useEffect"]);
            return ({
                "Page.useEffect": ()=>{
                    cancelled = true;
                }
            })["Page.useEffect"];
        }
    }["Page.useEffect"], []);
    const refreshStreak = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Page.useCallback[refreshStreak]": ()=>{
            if (!user) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"])(`/api/stats/user?userId=${user.id}`).then({
                "Page.useCallback[refreshStreak]": (s)=>setStreak(s.totals.streak)
            }["Page.useCallback[refreshStreak]"]).catch({
                "Page.useCallback[refreshStreak]": ()=>{
                // non-critical
                }
            }["Page.useCallback[refreshStreak]"]);
        }
    }["Page.useCallback[refreshStreak]"], [
        user
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            if (!user) return;
            let cancelled = false;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"])(`/api/stats/user?userId=${user.id}`).then({
                "Page.useEffect": (s)=>{
                    if (!cancelled) setStreak(s.totals.streak);
                }
            }["Page.useEffect"]).catch({
                "Page.useEffect": ()=>{
                // non-critical
                }
            }["Page.useEffect"]);
            return ({
                "Page.useEffect": ()=>{
                    cancelled = true;
                }
            })["Page.useEffect"];
        }
    }["Page.useEffect"], [
        user,
        view
    ]);
    function onAuthed(u) {
        setUser(u);
        setView("home");
    }
    function logout() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearSession"])();
        setUser(null);
        setStreak(0);
    }
    if (!ready) return null;
    if (!user) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$auth$2d$screen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthScreen"], {
        onAuthed: onAuthed
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 74,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$app$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppShell"], {
        user: user,
        view: view,
        onView: setView,
        onLogout: logout,
        streak: streak,
        children: [
            view === "home" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$home$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HomeView"], {
                user: user,
                onView: setView
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 78,
                columnNumber: 27
            }, this),
            view === "puzzles" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$puzzles$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PuzzlesView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 79,
                columnNumber: 30
            }, this),
            view === "cases" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$cases$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CasesView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 80,
                columnNumber: 28
            }, this),
            view === "gd" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$gd$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GDView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 81,
                columnNumber: 25
            }, this),
            view === "arena" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$arena$2f$arena$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ArenaView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 82,
                columnNumber: 28
            }, this),
            view === "quiz" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$quiz$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 83,
                columnNumber: 27
            }, this),
            view === "crosswords" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$crosswords$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CrosswordsView"], {
                user: user,
                onPointsEarned: refreshStreak
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 84,
                columnNumber: 33
            }, this),
            view === "leaderboard" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$leaderboard$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LeaderboardView"], {
                user: user
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 85,
                columnNumber: 34
            }, this),
            view === "studio" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$welearn$2f$studio$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudioView"], {
                user: user
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 86,
                columnNumber: 29
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(Page, "HOQ8s8zfgHWJd2ZDUCswy508SVc=");
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/haptics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Haptic feedback — tiny vibration cues for game-feel on mobile browsers.
// Gracefully no-ops on desktop/unsupported devices.
__turbopack_context__.s([
    "haptic",
    ()=>haptic
]);
const PATTERNS = {
    tick: 8,
    tap: 14,
    success: [
        18,
        40,
        18
    ],
    fail: [
        40,
        60,
        40,
        60,
        40
    ],
    heart: [
        30,
        50,
        30
    ],
    unlock: [
        12,
        30,
        12,
        30,
        30,
        60,
        30
    ]
};
function haptic(pattern = "tick") {
    try {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(PATTERNS[pattern] ?? 10);
        }
    } catch  {
    // never let haptics break the app
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/session.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Client-side session helpers — user stored in localStorage after name+PIN auth.
__turbopack_context__.s([
    "api",
    ()=>api,
    "clearSession",
    ()=>clearSession,
    "loadSession",
    ()=>loadSession,
    "saveSession",
    ()=>saveSession
]);
const KEY = "welearn.session.v1";
function loadSession() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.id || !parsed?.name) return null;
        return parsed;
    } catch  {
        return null;
    }
}
function saveSession(user) {
    localStorage.setItem(KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(KEY);
}
async function api(url, init) {
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers ?? {}
        }
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
    }
    return data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/themes.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_THEME",
    ()=>DEFAULT_THEME,
    "THEMES",
    ()=>THEMES,
    "applyTheme",
    ()=>applyTheme,
    "storedTheme",
    ()=>storedTheme
]);
"use client";
const THEMES = [
    {
        id: "dark-plus",
        name: "Dark+ (default)",
        dark: true,
        swatch: [
            "#1e1e1e",
            "#3794ff",
            "#89d185"
        ]
    },
    {
        id: "light-plus",
        name: "Light+",
        dark: false,
        swatch: [
            "#f8f8f8",
            "#005fb8",
            "#0f9b58"
        ]
    },
    {
        id: "pink-moon",
        name: "Pink Moon",
        dark: true,
        swatch: [
            "#170f1e",
            "#f472b6",
            "#a78bfa"
        ]
    },
    {
        id: "yellow-nitro",
        name: "Yellow Nitro",
        dark: true,
        swatch: [
            "#101010",
            "#ffd60a",
            "#fb923c"
        ]
    },
    {
        id: "dracula",
        name: "Dracula",
        dark: true,
        swatch: [
            "#282a36",
            "#bd93f9",
            "#ff79c6"
        ]
    },
    {
        id: "monokai-pro",
        name: "Monokai Pro",
        dark: true,
        swatch: [
            "#2d2a2e",
            "#ffd866",
            "#fc9867"
        ]
    },
    {
        id: "one-dark",
        name: "One Dark Pro",
        dark: true,
        swatch: [
            "#282c34",
            "#61afef",
            "#98c379"
        ]
    },
    {
        id: "abyss",
        name: "Abyss",
        dark: true,
        swatch: [
            "#000c18",
            "#2ec4b6",
            "#4fc3f7"
        ]
    },
    {
        id: "synthwave-84",
        name: "Synthwave '84",
        dark: true,
        swatch: [
            "#241b2f",
            "#ff7edb",
            "#36f9f6"
        ]
    },
    {
        id: "everglades",
        name: "Everglades",
        dark: true,
        swatch: [
            "#0f1c19",
            "#34d399",
            "#a3e635"
        ]
    }
];
const KEY = "welearn.theme.v2";
const DEFAULT_THEME = "dark-plus";
function applyTheme(id) {
    const def = THEMES.find((t)=>t.id === id) ?? THEMES[0];
    document.documentElement.dataset.theme = def.id;
    document.documentElement.classList.toggle("dark", def.dark);
    try {
        localStorage.setItem(KEY, def.id);
    } catch  {
    // storage disabled — session-only theme
    }
}
function storedTheme() {
    try {
        return localStorage.getItem(KEY) ?? DEFAULT_THEME;
    } catch  {
        return DEFAULT_THEME;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_15di6jrl10qda._.js.map