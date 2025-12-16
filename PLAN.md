# Oddscout Push Probability Visualizer - Implementation Plan

**Goal:** Build a tool that calculates and visualizes push probability distributions from sports betting market odds.

**Core Formula:** P(exactly X) = P(Over X-0.5) - P(Over X+0.5)

**Tech Stack:** NextJS 14 + TypeScript + Tailwind + shadcn/ui + Recharts

---

## 🎓 Collaborative Learning Approach

**This is a learning journey, not just a build sprint.**

- **Discussion First:** Before implementing each feature, discuss the concept, explore examples, and understand the "why" behind the approach
- **Back-and-Forth:** Don't just create files and implement - collaborate on design decisions, review code together, and iterate based on learnings
- **Research Together:** When encountering new concepts (odds formats, vig, market efficiency), explore them through discussion and examples before coding
- **Document As We Go:** Capture insights, edge cases, and "aha moments" in comments and documentation
- **Ask Questions:** If something is unclear or there are multiple approaches, discuss options rather than picking one silently
- **Validate Understanding:** After implementing something, review it together to ensure the concept is clear and the implementation makes sense

**Pace:** Take time to understand each concept deeply before moving forward. It's okay to spend significant time on one milestone if it means truly grasping the underlying principles.

---

## Milestone 1: Core Library Functions ✅
**Learning Focus:** Odds fundamentals, implied probability

- [x] Research American odds format (negative vs positive odds)
- [x] Understand implied probability formula
  - How does -110 convert to 52.4%?
  - How does +150 convert to 40%?
  - Why do bookmakers use -110 as standard?
- [x] Create `lib/odds.ts` with type definitions
  ```typescript
  type Line = {
    direction: 'over' | 'under'
    line: number
    odds: number  // American odds
  }

  type OutcomeRange = {
    label: string
    probability: number
    min?: number
    max?: number
  }
  ```
- [x] Implement `oddsToImpliedProbability(odds: number): number`
- [x] Write tests for odds conversion (verify against online calculators)
- [x] Document learnings in inline comments

---

## Milestone 2: Script POC ✅
**Learning Focus:** Push probability math, distribution calculation

- [x] Research push probability concept
  - What is a "push" in sports betting?
  - Why do half-point lines exist (28.5 vs 28)?
  - How do bettors use push probabilities?
- [x] Understand the core formula deeply
  - P(exactly X) = P(Over X-0.5) - P(Over X+0.5)
  - Walk through Brady's example by hand
  - What happens with gaps in lines?
- [x] Implement `calculateProbabilityDistribution(lines: Line[]): OutcomeRange[]`
  - Handle sorting lines
  - Detect gaps and create ranges
  - Handle both Over and Under directions
- [x] Create standalone script (`scripts/poc.ts`)
- [x] Test with Brady's example:
  - Input: Over 28.5 @ -110, Over 29.5 @ +150
  - Expected output: ≤28 (47.6%), 29 (12.4%), ≥30 (40%)
- [x] Test with gaps scenario:
  - Input: Over 25.5 @ -110, Over 27.5 @ +150
  - Expected output: ≤25 (47.6%), 26-27 (12.4%), ≥28 (40%)
- [x] Test with mixed Over/Under on same line
- [x] Document edge cases discovered

---

## Milestone 3: NextJS + Table UI
**Learning Focus:** User input patterns, validation, dynamic updates

**Design Priority:** Mobile-first! Brady will likely view on phone first.
- Touch-friendly UI (big buttons, full-width inputs on mobile)
- Vertical stacked layout on mobile
- Responsive breakpoints for desktop enhancement

- [x] Set up NextJS project with TypeScript + Tailwind
  - `npx create-next-app@latest oddscout-push-prob --typescript --tailwind --app`
- [x] Install shadcn/ui (or decide on alternative)
  - `npx shadcn@latest init`
  - Install components: Button, Input, Card, Table, Select
- [ ] Build form component for adding/removing lines
  - Direction dropdown (Over/Under)
  - Line input (number, supports X and X.5)
  - Odds input (American format, e.g., -110, +150)
  - Add/Remove line buttons
- [ ] Build table component displaying results
  - Columns: Outcome, Probability
  - Footer: Total (should sum to 100%)
  - Updates dynamically when inputs change
- [ ] Integrate library functions from Milestone 1-2
- [ ] Add basic validation
  - Minimum 2 lines required
  - Valid number formats
  - Valid American odds format
- [ ] Test dynamic updates (add/remove/edit lines)
- [ ] Document UX decisions and any usability issues discovered

---

## Milestone 4: Graph Visualization
**Learning Focus:** Data presentation, how bettors interpret probability charts

- [ ] Research how bettors use probability distributions
  - What insights do they look for?
  - What makes a chart actionable vs confusing?
- [ ] Set up Recharts (or alternative: Chart.js, D3)
  - `npm install recharts`
- [ ] Build bar chart component
  - X-axis: Outcome ranges
  - Y-axis: Probability (0-100%)
  - Bars with clear labels
- [ ] Style for clarity
  - Color scheme (consider colorblind-friendly)
  - Hover tooltips with exact percentages
  - Clear axis labels
  - Responsive design
- [ ] Test with various distributions
  - Simple (2 lines, consecutive)
  - Complex (5+ lines, gaps)
  - Edge cases (very skewed distributions)
- [ ] Document visualization choices and reasoning

---

## Milestone 5: Examples Sidebar
**Learning Focus:** Real-world betting scenarios, practical applications

- [ ] Research 5+ realistic betting scenarios
  - Look at actual sportsbook lines for inspiration
  - Understand common betting patterns
- [ ] **Example 1 (Simple):** NFL Game Total
  - Over 45.5 @ -110, Over 46.5 @ +120
  - Clean, consecutive lines
- [ ] **Example 2 (Medium):** NBA Player Props
  - Over 27.5 points @ -115, Over 28.5 @ +105, Over 29.5 @ +140
  - 3-4 lines, shows granular distribution
- [ ] **Example 3 (Complex):** Multi-line Totals
  - 5+ lines covering wide range
  - Shows full distribution curve
- [ ] **Example 4 (Edge Case):** Gaps in Lines
  - Over 48.5 @ -110, Over 51.5 @ +130
  - Demonstrates range outputs (49-51)
- [ ] **Example 5 (Edge Case):** Contradictory Lines
  - Over 50.5 @ +200, Over 49.5 @ -300
  - Demonstrates validation warnings (negative probabilities)
- [ ] Build sidebar UI component
  - List of examples with descriptions
  - Click to load into form
  - Highlight what each example demonstrates
- [ ] Implement click-to-load functionality
- [ ] Document what each example teaches

---

## Milestone 6: Validation & Polish
**Learning Focus:** Market efficiency, vig/juice, arbitrage

- [ ] Research market efficiency concepts
  - What is vig (juice)?
  - How to calculate vig from Over/Under on same line
  - What's a "sharp" line vs "public" line?
  - When do arbitrage opportunities exist?
- [ ] Implement `validateLines(lines: Line[]): ValidationResult`
  - Check for contradictory probabilities
  - Detect when P(Over X) < P(Over X+1) (impossible)
  - Flag negative probabilities
- [ ] Add warning system
  - ⚠️ "Lines appear contradictory - check odds"
  - Highlight negative probabilities in red
  - Show helpful error messages
- [ ] **(Optional)** Calculate and display vig
  - If Over/Under on same line, show bookmaker edge
  - Educational tooltip explaining vig
- [ ] **(Optional)** Flag arbitrage opportunities
  - Detect when total implied probability < 100%
  - Show potential profit opportunity
- [ ] Test all edge cases thoroughly
  - Negative probabilities
  - Sum > 100% or < 100%
  - Empty inputs
  - Invalid odds formats
- [ ] Write brief technical writeup
  - How you approached the problem
  - Key design decisions (flexible input, range handling, etc.)
  - What you'd improve with more time

---

## Milestone 7: Deployment & Feedback
**Deliverables:** Working app, code repo, writeup

- [ ] Clean up code
  - Remove console.logs
  - Add helpful comments
  - Ensure consistent formatting
- [ ] Deploy to Vercel
  - Connect GitHub repo
  - Configure production build
  - Test deployment
- [ ] Test production build thoroughly
  - All examples work
  - Form validation works
  - Chart renders correctly
  - Mobile responsive
- [ ] Create README.md
  - Project overview
  - Local setup instructions
  - Link to live demo
  - Link to technical writeup
- [ ] Share with Brady
  - Send deployed link
  - Send GitHub repo
  - Send technical writeup
- [ ] Document feedback and iterate
  - Note any questions or suggestions
  - Plan next steps based on feedback

---

## Technical Writeup Outline

**1. Problem Approach**
- Understanding the push probability formula
- Decision to handle flexible inputs (gaps, ranges)
- Exploration of sports betting concepts

**2. Key Design Decisions**
- Why NextJS + TypeScript (type safety for calculations)
- Why Recharts (simplicity, React integration)
- Why allow gaps vs require consecutive lines (flexibility)
- How ranges are calculated and labeled
- Validation strategy (progressive: POC → warnings → full validation)

**3. What I'd Improve With More Time**
- No-vig probability calculation (remove bookmaker edge)
- Support for decimal/fractional odds formats
- Ability to save/share distributions (URL params or export)
- Mobile app version (React Native)
- Integration with live odds APIs
- Advanced analytics (EV calculation, arbitrage detection, etc.)

**4. Learnings**
- Deeper understanding of sports betting markets
- Implied probability and market efficiency
- How professional bettors use these tools
- [Any other insights gained during development]
