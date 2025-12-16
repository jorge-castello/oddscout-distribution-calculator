/**
 * Quick test script to verify our odds conversion function
 * Run with: npx tsx test-odds.ts
 */

import { oddsToImpliedProbability } from './lib/odds'

console.log('Testing oddsToImpliedProbability()...\n')

// Test cases we worked through together
const testCases = [
  { odds: -110, expected: 0.5238, description: 'Standard vig (most common)' },
  { odds: +150, expected: 0.40, description: 'Underdog from Brady\'s example' },
  { odds: -200, expected: 0.6667, description: 'Strong favorite (we derived this!)' },
  { odds: +200, expected: 0.3333, description: 'Bigger underdog' },
  { odds: -300, expected: 0.75, description: 'Heavy favorite' },
]

testCases.forEach(({ odds, expected, description }) => {
  const result = oddsToImpliedProbability(odds)
  const percentage = (result * 100).toFixed(2)
  const expectedPercentage = (expected * 100).toFixed(2)
  const match = Math.abs(result - expected) < 0.001 ? '✅' : '❌'

  console.log(`${match} ${odds > 0 ? '+' : ''}${odds}`)
  console.log(`   ${description}`)
  console.log(`   Got: ${percentage}% | Expected: ${expectedPercentage}%`)
  console.log()
})

console.log('Done!')
