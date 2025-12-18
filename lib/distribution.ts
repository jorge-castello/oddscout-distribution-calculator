/**
 * Probability Distribution Calculator
 *
 * Calculates push probability distributions from sports betting market odds.
 *
 * CORE FORMULA: P(exactly X) = P(Over X-0.5) - P(Over X+0.5)
 *
 * This formula works because:
 * - P(Over X-0.5) gives us the probability of all outcomes ≥ X
 * - P(Over X+0.5) gives us the probability of all outcomes ≥ X+1
 * - The difference is the probability of exactly X
 */

import { Line, OutcomeRange, oddsToImpliedProbability } from './odds'

/**
 * Internal representation of a line normalized to "Over" probability
 */
type NormalizedLine = {
  line: number
  overProbability: number  // Always represents P(Over this line)
}

/**
 * Calculates the probability distribution from an array of betting lines
 *
 * ALGORITHM:
 * 1. Normalize all lines to "Over" probabilities (convert Under → Over)
 * 2. Sort lines by line number
 * 3. Calculate probability "slices" between consecutive lines
 * 4. Handle gaps by creating ranges instead of exact values
 *
 * @param lines - Array of betting lines from sportsbook
 * @returns Array of outcome ranges with probabilities
 *
 * @example
 * Input:
 *   [
 *     { direction: 'over', line: 28.5, odds: -110 },
 *     { direction: 'over', line: 29.5, odds: +150 }
 *   ]
 *
 * Output:
 *   [
 *     { label: '≤28', probability: 0.4762, max: 28 },
 *     { label: '29', probability: 0.1238, min: 29, max: 29 },
 *     { label: '≥30', probability: 0.40, min: 30 }
 *   ]
 */
export function calculateProbabilityDistribution(lines: Line[]): OutcomeRange[] {
  if (lines.length === 0) {
    return []
  }

  // Step 1: Group lines by line value and merge same-line pairs
  // When both Over and Under exist for the same line, use no-vig probability
  const lineGroups = new Map<number, { over?: number, under?: number }>()

  lines.forEach(line => {
    const impliedProb = oddsToImpliedProbability(line.odds)
    if (!lineGroups.has(line.line)) {
      lineGroups.set(line.line, {})
    }
    const group = lineGroups.get(line.line)!
    if (line.direction === 'over') {
      group.over = impliedProb
    } else {
      group.under = impliedProb
    }
  })

  // Step 2: Create normalized lines, merging same-line pairs with no-vig probability
  const normalized: NormalizedLine[] = []

  lineGroups.forEach((group, lineValue) => {
    let overProbability: number

    if (group.over !== undefined && group.under !== undefined) {
      // Both Over and Under exist - calculate no-vig probability
      // noVigOverProb = overProb / (overProb + underProb)
      const totalProb = group.over + group.under
      overProbability = group.over / totalProb
    } else if (group.over !== undefined) {
      // Only Over exists
      overProbability = group.over
    } else if (group.under !== undefined) {
      // Only Under exists - convert to Over
      overProbability = 1 - group.under
    } else {
      return // Skip if no valid data
    }

    normalized.push({
      line: lineValue,
      overProbability
    })
  })

  // Step 3: Sort by line number (ascending)
  normalized.sort((a, b) => a.line - b.line)

  // Step 3: Calculate probability ranges
  const ranges: OutcomeRange[] = []

  // Bottom range: everything ≤ (lowest line - 0.5)
  const lowestLine = normalized[0]
  const bottomValue = Math.floor(lowestLine.line)  // 28.5 → 28
  ranges.push({
    label: `≤${bottomValue}`,
    probability: 1 - lowestLine.overProbability,
    max: bottomValue
  })

  // Middle ranges: slices between consecutive lines
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i]
    const next = normalized[i + 1]

    // Calculate the probability slice
    const probability = current.overProbability - next.overProbability

    // Determine the range this represents
    const currentValue = Math.ceil(current.line)    // 28.5 → 29
    const nextValue = Math.floor(next.line)         // 29.5 → 29, or 31.5 → 31

    if (currentValue === nextValue) {
      // Consecutive lines → exact value
      ranges.push({
        label: `${currentValue}`,
        probability,
        min: currentValue,
        max: currentValue
      })
    } else {
      // Gap in lines → range
      ranges.push({
        label: `${currentValue}-${nextValue}`,
        probability,
        min: currentValue,
        max: nextValue
      })
    }
  }

  // Top range: everything ≥ (highest line + 0.5)
  const highestLine = normalized[normalized.length - 1]
  const topValue = Math.ceil(highestLine.line)  // 29.5 → 30
  ranges.push({
    label: `≥${topValue}`,
    probability: highestLine.overProbability,
    min: topValue
  })

  return ranges
}
