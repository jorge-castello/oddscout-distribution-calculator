/**
 * Example Scenarios for Betting Odds Analyzer
 *
 * Pre-configured betting line scenarios to demonstrate different features
 * and help users understand the calculator.
 */

import { Line } from './odds'

export type ExampleScenario = {
  id: string
  name: string
  description: string
  lines: Line[]
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: 'brady-basic',
    name: "Brady's Example",
    description: "Basic consecutive lines - perfect for understanding the fundamentals",
    lines: [
      { direction: 'over', line: 28.5, odds: -110 },
      { direction: 'over', line: 29.5, odds: 150 }
    ]
  },
  {
    id: 'gap',
    name: "Gap Scenario",
    description: "Shows range handling when lines skip values (26-27)",
    lines: [
      { direction: 'over', line: 25.5, odds: -110 },
      { direction: 'over', line: 27.5, odds: 150 }
    ]
  },
  {
    id: 'mixed',
    name: "Mixed Over/Under",
    description: "Demonstrates direction normalization with both Over and Under lines",
    lines: [
      { direction: 'over', line: 48.5, odds: 110 },
      { direction: 'under', line: 49.5, odds: -130 }
    ]
  },
  {
    id: 'granular',
    name: "Granular Distribution",
    description: "Multiple lines create a detailed probability breakdown",
    lines: [
      { direction: 'over', line: 27.5, odds: -150 },
      { direction: 'over', line: 28.5, odds: -110 },
      { direction: 'over', line: 29.5, odds: 150 },
      { direction: 'over', line: 30.5, odds: 220 }
    ]
  },
  {
    id: 'wide-spread',
    name: "Wide Spread",
    description: "Large gap between lines - heavy favorite vs big underdog",
    lines: [
      { direction: 'over', line: 45.5, odds: -200 },
      { direction: 'over', line: 50.5, odds: 300 }
    ]
  }
]
