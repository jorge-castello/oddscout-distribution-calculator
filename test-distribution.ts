/**
 * Test script for probability distribution calculation
 * Run with: npx tsx test-distribution.ts
 */

import { Line } from './lib/odds'
import { calculateProbabilityDistribution } from './lib/distribution'

console.log('Testing calculateProbabilityDistribution()...\n')

// Test 1: Brady's Example (consecutive lines)
console.log('━━━ Test 1: Brady\'s Example (Consecutive Lines) ━━━')
const bradyLines: Line[] = [
  { direction: 'over', line: 28.5, odds: -110 },
  { direction: 'over', line: 29.5, odds: +150 }
]

const bradyResult = calculateProbabilityDistribution(bradyLines)
console.log('Input:')
console.log('  Over 28.5 @ -110  (52.38% chance of ≥29)')
console.log('  Over 29.5 @ +150  (40% chance of ≥30)')
console.log('\nOutput:')
bradyResult.forEach(range => {
  const pct = (range.probability * 100).toFixed(2)
  console.log(`  ${range.label.padEnd(8)} ${pct}%`)
})
console.log(`  Total:   ${(bradyResult.reduce((sum, r) => sum + r.probability, 0) * 100).toFixed(2)}%`)
console.log()

// Test 2: Gap in Lines
console.log('━━━ Test 2: Gap in Lines ━━━')
const gapLines: Line[] = [
  { direction: 'over', line: 25.5, odds: -110 },
  { direction: 'over', line: 27.5, odds: +150 }
]

const gapResult = calculateProbabilityDistribution(gapLines)
console.log('Input:')
console.log('  Over 25.5 @ -110  (52.38% chance of ≥26)')
console.log('  Over 27.5 @ +150  (40% chance of ≥28)')
console.log('\nOutput (should show 26-27 range):')
gapResult.forEach(range => {
  const pct = (range.probability * 100).toFixed(2)
  console.log(`  ${range.label.padEnd(8)} ${pct}%`)
})
console.log(`  Total:   ${(gapResult.reduce((sum, r) => sum + r.probability, 0) * 100).toFixed(2)}%`)
console.log()

// Test 3: Mixed Over/Under
console.log('━━━ Test 3: Mixed Over/Under Directions ━━━')
const mixedLines: Line[] = [
  { direction: 'over', line: 48.5, odds: +110 },   // 47.62% chance of ≥49
  { direction: 'under', line: 49.5, odds: -130 }   // 56.52% chance of ≤49 → 43.48% chance of ≥50
]

const mixedResult = calculateProbabilityDistribution(mixedLines)
console.log('Input:')
console.log('  Over 48.5 @ +110   (47.62% chance of ≥49)')
console.log('  Under 49.5 @ -130  (56.52% chance of ≤49 → 43.48% of ≥50)')
console.log('\nOutput:')
mixedResult.forEach(range => {
  const pct = (range.probability * 100).toFixed(2)
  console.log(`  ${range.label.padEnd(8)} ${pct}%`)
})
console.log(`  Total:   ${(mixedResult.reduce((sum, r) => sum + r.probability, 0) * 100).toFixed(2)}%`)
console.log()

// Test 4: Multiple Lines (more granular distribution)
console.log('━━━ Test 4: Multiple Lines (Granular Distribution) ━━━')
const multiLines: Line[] = [
  { direction: 'over', line: 27.5, odds: -150 },
  { direction: 'over', line: 28.5, odds: -110 },
  { direction: 'over', line: 29.5, odds: +150 },
  { direction: 'over', line: 30.5, odds: +220 }
]

const multiResult = calculateProbabilityDistribution(multiLines)
console.log('Input: 4 consecutive lines from 27.5 to 30.5')
console.log('\nOutput:')
multiResult.forEach(range => {
  const pct = (range.probability * 100).toFixed(2)
  console.log(`  ${range.label.padEnd(8)} ${pct}%`)
})
console.log(`  Total:   ${(multiResult.reduce((sum, r) => sum + r.probability, 0) * 100).toFixed(2)}%`)
console.log()

console.log('✅ All tests completed!')
