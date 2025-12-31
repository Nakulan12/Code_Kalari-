// UDCF Core Engine - Decision Logic, Storage, and Logging

let state = {
  consents: {},
  logs: [],
}

// Load from localStorage on startup
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("udcf_state")
  if (saved) {
    try {
      state = JSON.parse(saved)
    } catch {
      // use default
    }
  }
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem("udcf_state", JSON.stringify(state))
  }
}

// Consent Management
export function setConsent(userId, settings) {
  state.consents[userId] = settings
  persist()
}

export function getConsent(userId) {
  return (
    state.consents[userId] || {
      profile: false,
      usage: false,
      analytics: false,
    }
  )
}

// Decision Engine - CRITICAL COMPONENT
export function checkAccess(userId, appId, appName, purpose, dataCategory) {
  const consent = getConsent(userId)

  // STEP 1: Check Consent
  const categoryConsent = consent[dataCategory]
  if (!categoryConsent) {
    return {
      decision: "BLOCK",
      reason: `User has not consented to ${dataCategory} data access`,
    }
  }

  // STEP 2: Check Purpose Policy
  const policyRules = {
    analytics: ["analytics", "usage"],
    personalization: ["profile", "usage"],
    marketing: ["profile"],
    ai_training: ["analytics", "usage"],
  }

  const allowedCategories = policyRules[purpose] || []
  if (!allowedCategories.includes(dataCategory)) {
    return {
      decision: "BLOCK",
      reason: `Purpose '${purpose}' is not authorized for '${dataCategory}' data`,
    }
  }

  // STEP 3: Final Decision
  return {
    decision: "ALLOW",
    reason: `Consent verified and purpose authorized`,
  }
}

// Logging Engine
export function logAccess(userId, appId, appName, purpose, dataCategory, decision, reason) {
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId: `user_${userId}`,
    appId,
    appName,
    purpose,
    dataCategory,
    decision,
    reason,
  }

  state.logs.push(log)
  persist()
  return log
}

export function getLogs() {
  return [...state.logs].reverse()
}

export function getLogsByUserId(userId) {
  return state.logs.filter((log) => log.userId === `user_${userId}`).reverse()
}

export function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysLogs = state.logs.filter((log) => {
    const logDate = new Date(log.timestamp)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime()
  })

  return {
    totalRequests: todaysLogs.length,
    allowedRequests: todaysLogs.filter((log) => log.decision === "ALLOW").length,
    blockedRequests: todaysLogs.filter((log) => log.decision === "BLOCK").length,
    totalLogs: state.logs.length,
  }
}
