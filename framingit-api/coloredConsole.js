// coloredConsole.js

// =========================
// ANSI COLOR DEFINITIONS
// =========================
const COLORS = {
  reset: "\x1b[0m",

  // text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // bright text
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
};


// =========================
// INTERNAL HELPERS
// =========================

// Pretty‑print ANY value safely
function formatValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const type = typeof value;

  if (type === "string" || type === "number" || type === "boolean") {
    return String(value);
  }

  // Arrays and objects → pretty JSON ONCE
  if (Array.isArray(value) || type === "object") {
    return "\n" + JSON.stringify(value, null, 2) + "\n";
  }

  return String(value);
}

// Format all arguments passed to console.log
function formatArgs(args) {
  return args.map(formatValue).join(" ");
}


// =========================
// SAVE ORIGINAL CONSOLE FUNCTIONS
// =========================
const originalLog = console.log;
const originalDebug = console.debug;
const originalError = console.error;
const originalWarn = console.warn;


// =========================
// OVERRIDDEN CONSOLE FUNCTIONS
// =========================

// Normal log → white
console.log = (...args) => {
  originalLog(COLORS.white + formatArgs(args) + COLORS.reset);
};

// Success → green
console.success = (...args) => {
  originalLog(COLORS.green + formatArgs(args) + COLORS.reset);
};

// Error → red
console.error = (...args) => {
  originalError(COLORS.red + formatArgs(args) + COLORS.reset);
};

// Warning → yellow
console.warn = (...args) => {
  originalWarn(COLORS.yellow + formatArgs(args) + COLORS.reset);
};

// Debug → cyan
console.debug = (...args) => {
  originalDebug(COLORS.cyan + formatArgs(args) + COLORS.reset);
};


// =========================
// CUSTOM COLOR FUNCTION
// =========================
console.customColor = (colorName, ...args) => {
  const color = COLORS[colorName];

  if (!color) {
    originalError(
      COLORS.red +
      `[ERROR] Invalid color '${colorName}'. Valid colors: ${Object.keys(COLORS).join(", ")}` +
      COLORS.reset
    );
    return;
  }

  originalLog(color + formatArgs(args) + COLORS.reset);
};


// Export colors if needed
module.exports = { COLORS };