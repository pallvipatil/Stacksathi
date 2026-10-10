export function productImage(name: string) {
  const normalized = name.toLowerCase()
  if (/rice|चावल|तांदूळ/.test(normalized)) return "/images/rice.svg"
  if (/sugar|चीनी|साखर/.test(normalized)) return "/images/sugar.svg"
  if (/atta|flour|आटा|पीठ/.test(normalized)) return "/images/flour.svg"
  if (/oil|तेल/.test(normalized)) return "/images/oil.svg"
  if (/tea|चाय|चहा/.test(normalized)) return "/images/tea.svg"
  if (/dal|pulse|डाळ|दाल/.test(normalized)) return "/images/pulses.svg"
  if (/parle|biscuit/.test(normalized)) return "/images/biscuits.svg"
  if (/salt|नमक|मीठ/.test(normalized)) return "/images/salt.svg"
  return undefined
}
