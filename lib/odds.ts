/**
 * Odds Conversion Library
 *
 * This library handles conversion between American odds and implied probabilities.
 *
 * KEY CONCEPT: Implied probability is derived from Expected Value (EV) = 0
 * - For a fair bet, EV = (P × winAmount) - ((1-P) × riskAmount) = 0
 * - Solving for P gives us the implied probability
 */

/**
 * Represents a single betting line from a sportsbook
 */
export type Line = {
  direction: 'over' | 'under'  // Which side of the line you're betting
  line: number                  // The threshold (e.g., 28.5 points)
  odds: number                  // American odds (e.g., -110 or +150)
}

/**
 * Represents a probability outcome range
 * Used to display results after calculating push probabilities
 */
export type OutcomeRange = {
  label: string         // Human-readable label (e.g., "≤28" or "29" or "≥30")
  probability: number   // Probability as decimal (e.g., 0.476 for 47.6%)
  min?: number         // Minimum value in range (optional)
  max?: number         // Maximum value in range (optional)
}

/**
 * Converts American odds to implied probability
 *
 * NEGATIVE ODDS (favorites, e.g., -110):
 * - You risk |odds| to win $100
 * - Formula: P = |odds| / (|odds| + 100)
 * - Example: -110 → 110/(110+100) = 110/210 = 52.38%
 * - Derivation: EV = (P × 100) - ((1-P) × 110) = 0
 *
 * POSITIVE ODDS (underdogs, e.g., +150):
 * - You risk $100 to win odds
 * - Formula: P = 100 / (odds + 100)
 * - Example: +150 → 100/(150+100) = 100/250 = 40%
 * - Derivation: EV = (P × 150) - ((1-P) × 100) = 0
 *
 * @param odds - American odds (negative for favorites, positive for underdogs)
 * @returns Implied probability as a decimal (0 to 1)
 */
export function oddsToImpliedProbability(odds: number): number {
  if (odds < 0) {
    // Negative odds: favorite
    // Risk |odds| to win $100
    const absOdds = Math.abs(odds)
    return absOdds / (absOdds + 100)
  } else {
    // Positive odds: underdog
    // Risk $100 to win odds
    return 100 / (odds + 100)
  }
}
