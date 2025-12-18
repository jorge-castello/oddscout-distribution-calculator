# Push Probability Visualizer

A web tool that calculates and visualizes probability distributions from sports betting market odds.

## What It Does

This tool takes betting lines from sportsbooks (e.g., "Over 28.5 @ -110") and calculates the implied probability distribution for all possible outcomes. It helps bettors understand what the market thinks will happen.

**Example:**
- Input: Over 28.5 @ -110, Over 29.5 @ +150
- Output: ≤28 (47.6%), 29 (12.4%), ≥30 (40%)

## How It Works

### The Core Formula

```
P(exactly X) = P(Over X-0.5) - P(Over X+0.5)
```

The algorithm:
1. **Convert odds to probabilities** - American odds (e.g., -110, +150) are converted to implied probabilities
2. **Normalize directions** - All lines are normalized to "Over" probabilities for consistent calculation
3. **Handle same-line pairs** - When both Over and Under exist on the same line (e.g., Over 28.5 + Under 28.5), use no-vig probability: `overProb / (overProb + underProb)`
4. **Calculate slices** - Probability between consecutive lines represents outcomes in that range
5. **Handle gaps** - When lines skip values (28.5 → 30.5), create ranges (29-30)

### Market Efficiency Analysis

When you enter both Over and Under on the same line, the tool displays:
- **Vig (bookmaker edge)** - When total probability > 100%
- **Arbitrage opportunities** - When total probability < 100% (rare, theoretical)

## Key Features

- **Flexible input** - Handles Over/Under lines, gaps, and mixed scenarios
- **Real-time visualization** - Bar chart and table update as you add/edit lines
- **Example scenarios** - Pre-built examples demonstrating different patterns
- **Validation** - Detects contradictory odds and mathematically impossible scenarios
- **Mobile-first design** - Optimized for viewing on phones and tablets

## Technical Approach

### Design Decisions

1. **Flexible range handling** - Instead of requiring consecutive lines, the algorithm handles gaps by creating ranges. This matches real-world usage where bettors may only have access to certain lines.

2. **Direction normalization** - Converting all lines to "Over" probabilities simplifies the math and makes the algorithm more robust.

3. **No-vig calculation for same-line pairs** - When both Over and Under exist on the same line, we calculate the no-vig probability to remove bookmaker edge from the distribution. This provides more accurate outcome probabilities.

4. **Separate market efficiency view** - Vig and arbitrage calculations are shown in a dedicated section, distinct from the probability distribution. This prevents conceptual confusion between market structure analysis and outcome prediction.

5. **Type safety** - TypeScript ensures calculations are correct and reduces runtime errors.

6. **Mobile-first UI** - Compact, touch-friendly design prioritizes the most common use case (viewing on mobile while placing bets).

### Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety for probability calculations
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Component library built on Radix UI
- **Recharts 3** - Declarative charts for probability visualization

### Code Structure

```
lib/
  odds.ts          - Type definitions and odds conversion
  distribution.ts  - Core probability distribution algorithm
  validation.ts    - Input validation and market efficiency checks
  examples.ts      - Pre-configured betting scenarios
  utils.ts         - Utility functions

app/
  page.tsx         - Main UI component
  layout.tsx       - App layout
  globals.css      - Global styles

components/ui/
  accordion.tsx    - Collapsible example scenarios
  button.tsx       - Button component
  card.tsx         - Card container
  input.tsx        - Form inputs
  select.tsx       - Dropdown selects
  table.tsx        - Data table
```

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## What I'd Improve With More Time

1. **Support for other odds formats** - Decimal and fractional odds in addition to American odds
2. **URL sharing** - Save line configurations in URL params for easy sharing
3. **Export functionality** - Download distributions as CSV or images
4. **Live odds integration** - Connect to sportsbook APIs for real-time data
5. **Advanced analytics** - Expected value (EV) calculations, Kelly criterion betting recommendations
6. **Historical tracking** - Save and compare distributions over time
7. **Multi-sport templates** - Pre-configured input patterns for different sports

## How Bettors Use This

Professional bettors use probability distributions to:
1. **Find value** - Compare market probabilities to their own models
2. **Identify inefficiencies** - Spot when lines are mispriced
3. **Manage risk** - Understand the full range of likely outcomes
4. **Arbitrage detection** - Find guaranteed profit opportunities across books

## Learnings

This project deepened my understanding of:
- **Sports betting mathematics** - Implied probability, vig, market efficiency
- **Edge cases in algorithms** - Handling gaps, same-line pairs, and contradictory inputs
- **Mobile-first design** - Prioritizing the most common use case drives better UX decisions
- **Progressive enhancement** - Starting simple (POC script) before building full UI
- **Type safety for calculations** - TypeScript catches math errors at compile time

---

**Built with Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4**
