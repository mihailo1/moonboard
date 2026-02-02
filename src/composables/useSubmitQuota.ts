const KEY = 'mb_submit_quota_v1'

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { date: todayStr(), count: 0 }
    const obj = JSON.parse(raw)
    if (obj?.date !== todayStr()) return { date: todayStr(), count: 0 }
    return { date: obj.date, count: Number(obj.count) || 0 }
  } catch (e) {
    return { date: todayStr(), count: 0 }
  }
}

function write(state: { date: string; count: number }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    // ignore
  }
}

export function getSubmitCountToday() {
  if (typeof window === 'undefined') return 0
  return read().count
}

export function canSubmitToday(limit = 5) {
  if (typeof window === 'undefined') return true
  return read().count < limit
}

export function incrementSubmitCount() {
  if (typeof window === 'undefined') return 0
  const s = read()
  s.count = (s.count || 0) + 1
  s.date = todayStr()
  write(s)
  try {
    window.dispatchEvent(new CustomEvent('mb-submit-quota-changed', { detail: { date: s.date, count: s.count } }))
  } catch (e) {
    // ignore
  }
  return s.count
}

export function resetSubmitCount() {
  if (typeof window === 'undefined') return
  write({ date: todayStr(), count: 0 })
  try {
    window.dispatchEvent(new CustomEvent('mb-submit-quota-changed', { detail: { date: todayStr(), count: 0 } }))
  } catch (e) {}
}

export default {
  getSubmitCountToday,
  canSubmitToday,
  incrementSubmitCount,
  resetSubmitCount,
}
