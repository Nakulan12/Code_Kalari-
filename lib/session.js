export function getSession() {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem("udcf_session")
  return session ? JSON.parse(session) : null
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("udcf_session")
  }
}
