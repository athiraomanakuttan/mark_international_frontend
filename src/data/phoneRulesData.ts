export const phoneRules: Record<string, RegExp> = {
  // 🇮🇳 India
  "+91": /^[6-9]\d{9}$/,

  // 🇺🇸 United States
  "+1": /^\d{10}$/,

  // 🇬🇧 United Kingdom
  "+44": /^7\d{9}$/,

  // 🇦🇺 Australia
  "+61": /^4\d{8}$/,

  // 🇨🇦 Canada
  "+1-CA": /^\d{10}$/,

  // 🇩🇪 Germany
  "+49": /^1[5-7]\d{8}$/,

  // 🇫🇷 France
  "+33": /^6\d{8}$/,

  // 🇸🇬 Singapore
  "+65": /^[89]\d{7}$/,

  // 🇦🇪 UAE
  "+971": /^5[0-9]\d{7}$/,

  // 🇸🇦 Saudi Arabia
  "+966": /^5\d{8}$/,

  // 🇳🇵 Nepal
  "+977": /^98\d{8}$/,

  // 🇧🇩 Bangladesh
  "+880": /^1[3-9]\d{8}$/,

  // 🇵🇰 Pakistan
  "+92": /^3\d{9}$/,

  // 🇱🇰 Sri Lanka
  "+94": /^7\d{8}$/,

  // 🇯🇵 Japan
  "+81": /^90\d{8}$/,

  // 🇨🇳 China
  "+86": /^1[3-9]\d{9}$/,

  // 🇧🇷 Brazil
  "+55": /^(\d{10}|\d{11})$/,

  // 🇷🇺 Russia
  "+7": /^9\d{9}$/,

  // 🇿🇦 South Africa
  "+27": /^6\d{8}$/,

  // 🇮🇩 Indonesia
  "+62": /^8\d{8,10}$/,

  // 🇹🇭 Thailand
  "+66": /^8\d{8}$/,

  // Default fallback
  "default": /^\d{6,14}$/, // E.164 general rule (6 to 14 digits)
};
