"use client";

import { useState } from "react";
import { Line, oddsToImpliedProbability } from "@/lib/odds";
import { calculateProbabilityDistribution } from "@/lib/distribution";
import { EXAMPLE_SCENARIOS } from "@/lib/examples";
import { validateLines, findSameLinePairs, shouldShowDistribution } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";

export default function Home() {
  // Form state
  const [direction, setDirection] = useState<"over" | "under">("over");
  const [lineValue, setLineValue] = useState("");
  const [odds, setOdds] = useState("");
  const [selectedExample, setSelectedExample] = useState("basic");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [formError, setFormError] = useState("");

  // Lines state
  const [lines, setLines] = useState<Line[]>([
    { direction: "over", line: 28.5, odds: -110 },
    { direction: "over", line: 29.5, odds: 150 },
  ]);

  // Add a new line
  const handleAddLine = () => {
    const parsedLine = parseFloat(lineValue);
    const parsedOdds = parseInt(odds);

    // Validation
    if (!lineValue || !odds) {
      setFormError("Please enter both line and odds");
      return;
    }

    if (isNaN(parsedLine)) {
      setFormError("Line must be a valid number (e.g., 28.5)");
      return;
    }

    if (isNaN(parsedOdds)) {
      setFormError("Odds must be a valid number (e.g., -110 or +150)");
      return;
    }

    if (parsedOdds === 0) {
      setFormError("Odds cannot be 0");
      return;
    }

    // Check for duplicate line
    const duplicateLine = lines.find(
      (l) => l.line === parsedLine && l.direction === direction
    );
    if (duplicateLine) {
      setFormError(
        `A ${direction} ${parsedLine} line already exists. Please remove it first or use a different line value.`
      );
      return;
    }

    // Clear any previous errors
    setFormError("");

    setLines([
      ...lines,
      {
        direction,
        line: parsedLine,
        odds: parsedOdds,
      },
    ]);

    // Reset form
    setLineValue("");
    setOdds("");

    // Collapse manual entry
    setShowManualEntry(false);
  };

  // Remove a line
  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  // Load an example scenario
  const loadExample = (exampleLines: Line[]) => {
    setLines(exampleLines);
    // Reset form inputs
    setLineValue("");
    setOdds("");
  };

  // Handle example selection from dropdown
  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    const example = EXAMPLE_SCENARIOS.find((ex) => ex.id === exampleId);
    if (example) {
      loadExample(example.lines);
    }
  };

  // Calculate distribution
  const distribution =
    lines.length >= 1 ? calculateProbabilityDistribution(lines) : [];
  const total = distribution.reduce((sum, range) => sum + range.probability, 0);

  // Validate lines
  const validation = validateLines(lines);

  // Market efficiency detection
  const sameLinePairs = findSameLinePairs(lines);
  const showDist = shouldShowDistribution(lines);

  // Helper to get market efficiency data for a specific line value
  const getMarketEfficiencyData = (lineValue: number) => {
    const overLine = lines.find(l => l.line === lineValue && l.direction === 'over');
    const underLine = lines.find(l => l.line === lineValue && l.direction === 'under');

    if (!overLine || !underLine) return null;

    const overProb = oddsToImpliedProbability(overLine.odds);
    const underProb = oddsToImpliedProbability(underLine.odds);
    const totalProb = overProb + underProb;

    return {
      overProb,
      underProb,
      overOdds: overLine.odds,
      underOdds: underLine.odds,
      vigOrArbitrage: totalProb > 1 ? 'vig' : 'arbitrage' as const,
      margin: Math.abs(totalProb - 1)
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Betting Odds Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Turn sportsbook odds into probability distributions
          </p>
        </div>

        {/* Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configure Lines</CardTitle>
            <CardDescription>
              Load an example or add betting lines manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Examples & Add Lines Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Examples:
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedExample}
                  onValueChange={handleExampleChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Load an example..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMPLE_SCENARIOS.map((example) => (
                      <SelectItem key={example.id} value={example.id}>
                        {example.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="px-4"
                >
                  {showManualEntry ? "−" : "+"}
                </Button>
              </div>
            </div>

            {/* Manual Entry Form - Slides in when button clicked */}
            {showManualEntry && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold tracking-tight">
                  Add a betting line:
                </h3>

                {/* Form Error */}
                {formError && (
                  <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <p className="text-sm flex-1">{formError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Direction</label>
                    <Select
                      value={direction}
                      onValueChange={(val) =>
                        setDirection(val as "over" | "under")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="over">Over</SelectItem>
                        <SelectItem value="under">Under</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Line</label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="28.5"
                      value={lineValue}
                      onChange={(e) => {
                        setLineValue(e.target.value);
                        setFormError("");
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Odds</label>
                    <Input
                      type="number"
                      placeholder="-110"
                      value={odds}
                      onChange={(e) => {
                        setOdds(e.target.value);
                        setFormError("");
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddLine}
                  className="w-full sm:w-auto"
                  size="lg"
                  disabled={!lineValue || !odds}
                >
                  + Add Line
                </Button>
              </div>
            )}

            {/* Current Lines - Always visible */}
            {lines.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Lines ({lines.length}):
                </h3>
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg"
                    >
                      <span className="font-mono text-sm">
                        {line.direction === "over" ? "Over" : "Under"}{" "}
                        {line.line} @ {line.odds > 0 ? "+" : ""}
                        {line.odds}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLine(index)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Warnings - filter out vig/arbitrage since they're shown in Market Efficiency card */}
            {validation.issues.filter(issue => issue.type !== 'vig' && issue.type !== 'arbitrage').length > 0 && (
              <div className="space-y-2">
                {validation.issues
                  .filter(issue => issue.type !== 'vig' && issue.type !== 'arbitrage')
                  .map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      issue.severity === "error"
                        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                        : issue.severity === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
                        : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {issue.severity === "error"
                          ? "⚠️"
                          : issue.severity === "warning"
                          ? "ℹ️"
                          : "💡"}
                      </span>
                      <p className="text-sm flex-1">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Efficiency Card - shows when same-line pairs exist */}
        {sameLinePairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Market Efficiency Analysis</CardTitle>
              <CardDescription>
                Vig and arbitrage calculations for same-line scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sameLinePairs.map(lineValue => {
                  const data = getMarketEfficiencyData(lineValue);
                  if (!data) return null;

                  const isVig = data.vigOrArbitrage === 'vig';
                  const marginPct = (data.margin * 100).toFixed(1);

                  return (
                    <div key={lineValue} className="space-y-3">
                      {/* Header for this line */}
                      {sameLinePairs.length > 1 && (
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Line {lineValue}
                        </h3>
                      )}

                      {/* Table showing breakdown */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bet</TableHead>
                            <TableHead>Odds</TableHead>
                            <TableHead className="text-right">Implied Probability</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Over {lineValue}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {data.overOdds > 0 ? '+' : ''}{data.overOdds}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {(data.overProb * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Under {lineValue}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {data.underOdds > 0 ? '+' : ''}{data.underOdds}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {(data.underProb * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell className="font-bold">Total</TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {((data.overProb + data.underProb) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>

                      {/* Vig/Arbitrage callout */}
                      <div className={`p-3 rounded-lg border ${
                        isVig
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                          : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{isVig ? '💡' : '🎯'}</span>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold mb-1 ${
                              isVig
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-green-900 dark:text-green-100'
                            }`}>
                              {isVig ? `Bookmaker Vig: ${marginPct}%` : `Arbitrage Opportunity: ${marginPct}%`}
                            </p>
                            <p className={`text-xs ${
                              isVig
                                ? 'text-blue-800 dark:text-blue-200'
                                : 'text-green-800 dark:text-green-200'
                            }`}>
                              {isVig
                                ? `The bookmaker has a ${marginPct}% edge built into these odds.`
                                : `You could bet both sides and guarantee a ${marginPct}% profit!`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Probability Distribution Card - shows when lines at different values */}
        {showDist && distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Probability Distribution</CardTitle>
              <CardDescription>
                Calculated from {lines.length} betting line
                {lines.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart visualization */}
              <div className="outline-none focus:outline-none select-none">
                <ResponsiveContainer
                  width="100%"
                  height={150}
                  className="outline-none focus:outline-none select-none"
                >
                  <BarChart
                    data={distribution.map((range) => ({
                      outcome: range.label,
                      probability: range.probability * 100,
                    }))}
                    margin={{ left: 10, right: 10, top: 20, bottom: 5 }}
                    style={{ cursor: "default" }}
                  >
                    <XAxis
                      dataKey="outcome"
                      tick={{ fill: "currentColor", fontFamily: "inherit" }}
                      style={{ fontSize: "14px" }}
                    />
                    <Bar
                      dataKey="probability"
                      fill="hsl(var(--foreground))"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={false}
                      label={{
                        position: "top",
                        formatter: (value) =>
                          typeof value === "number"
                            ? `${value.toFixed(1)}%`
                            : "",
                        fill: "currentColor",
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="mt-4 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Outcome</TableHead>
                      <TableHead className="text-right">Probability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distribution.map((range, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {range.label}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(range.probability * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {(total * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
