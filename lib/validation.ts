/**
 * Validation utilities for betting lines
 *
 * Detects mathematically impossible or contradictory line combinations
 */

import { Line, oddsToImpliedProbability } from './odds'

export type ValidationIssue = {
  type: 'negative_probability' | 'contradictory_probabilities' | 'total_probability' | 'vig' | 'arbitrage'
  message: string
  severity: 'error' | 'warning' | 'info'
}

export type ValidationResult = {
  isValid: boolean
  issues: ValidationIssue[]
}

/**
 * Validates an array of betting lines for logical consistency
 *
 * Checks for:
 * 1. Contradictory probabilities (P(Over X) < P(Over X+1))
 * 2. Negative probabilities in distribution
 * 3. Total probability significantly off from 100%
 */
export function validateLines(lines: Line[]): ValidationResult {
  const issues: ValidationIssue[] = []

  if (lines.length === 0) {
    return { isValid: true, issues: [] }
  }

  // Normalize all lines to "Over" probabilities and sort
  type NormalizedLine = {
    line: number
    overProbability: number
    originalIndex: number
  }

  const normalized: NormalizedLine[] = lines.map((line, index) => {
    const impliedProb = oddsToImpliedProbability(line.odds)
    const overProbability = line.direction === 'under' ? 1 - impliedProb : impliedProb

    return {
      line: line.line,
      overProbability,
      originalIndex: index
    }
  })

  // Sort by line value
  normalized.sort((a, b) => a.line - b.line)

  // Check for contradictory probabilities
  // Higher lines should have lower or equal probability
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i]
    const next = normalized[i + 1]

    if (current.overProbability < next.overProbability) {
      issues.push({
        type: 'contradictory_probabilities',
        message: `Contradictory odds: Over ${current.line} has lower probability (${(current.overProbability * 100).toFixed(1)}%) than Over ${next.line} (${(next.overProbability * 100).toFixed(1)}%). This is mathematically impossible.`,
        severity: 'error'
      })
    }
  }

  // Check for lines that are too close together
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i]
    const next = normalized[i + 1]
    const gap = next.line - current.line

    if (gap < 1.0) {
      issues.push({
        type: 'contradictory_probabilities',
        message: `Lines ${current.line} and ${next.line} are very close together (${gap.toFixed(1)} apart). This can create confusing duplicate outcomes in the distribution. Consider using lines at least 1.0 apart.`,
        severity: 'warning'
      })
    }
  }

  // Check for negative probabilities in the distribution
  // Calculate the probability slices
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i]
    const next = normalized[i + 1]
    const probability = current.overProbability - next.overProbability

    if (probability < 0) {
      issues.push({
        type: 'negative_probability',
        message: `Negative probability detected between lines ${current.line} and ${next.line}. Check your odds.`,
        severity: 'error'
      })
    }
  }

  // Check for vig and arbitrage opportunities
  // Group lines by line value to find Over/Under pairs
  const lineGroups = new Map<number, { over?: Line, under?: Line }>()

  lines.forEach(line => {
    if (!lineGroups.has(line.line)) {
      lineGroups.set(line.line, {})
    }
    const group = lineGroups.get(line.line)!
    if (line.direction === 'over') {
      group.over = line
    } else {
      group.under = line
    }
  })

  // Check each line value for vig or arbitrage
  lineGroups.forEach((group, lineValue) => {
    if (group.over && group.under) {
      const overProb = oddsToImpliedProbability(group.over.odds)
      const underProb = oddsToImpliedProbability(group.under.odds)
      const totalProb = overProb + underProb

      if (totalProb > 1.0) {
        // Vig detected (bookmaker edge)
        const vig = (totalProb - 1.0) * 100
        issues.push({
          type: 'vig',
          message: `Line ${lineValue} shows ${vig.toFixed(1)}% vig (bookmaker edge). Over: ${(overProb * 100).toFixed(1)}% + Under: ${(underProb * 100).toFixed(1)}% = ${(totalProb * 100).toFixed(1)}%`,
          severity: 'info'
        })
      } else if (totalProb < 1.0) {
        // Arbitrage opportunity detected
        const arbitrageMargin = (1.0 - totalProb) * 100
        issues.push({
          type: 'arbitrage',
          message: `Arbitrage opportunity on line ${lineValue}! Total implied probability is ${(totalProb * 100).toFixed(1)}% (${arbitrageMargin.toFixed(1)}% margin). You could bet both sides and guarantee a profit.`,
          severity: 'info'
        })
      }
    }
  })

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues
  }
}
