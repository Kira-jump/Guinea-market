const UUID_REGEX = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i

export function extraireId(input) {
  if (!input) return null
  const match = input.match(UUID_REGEX)
  return match ? match[1].toLowerCase() : null
}
