'use client'

import { useState } from 'react'
import { Line } from '@/lib/odds'
import { calculateProbabilityDistribution } from '@/lib/distribution'
import { EXAMPLE_SCENARIOS } from '@/lib/examples'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'

export default function Home() {
  // Form state
  const [direction, setDirection] = useState<'over' | 'under'>('over')
  const [lineValue, setLineValue] = useState('')
  const [odds, setOdds] = useState('')

  // Lines state
  const [lines, setLines] = useState<Line[]>([
    // Start with Brady's example
    { direction: 'over', line: 28.5, odds: -110 },
    { direction: 'over', line: 29.5, odds: 150 }
  ])

  // Add a new line
  const handleAddLine = () => {
    const parsedLine = parseFloat(lineValue)
    const parsedOdds = parseInt(odds)

    if (isNaN(parsedLine) || isNaN(parsedOdds)) {
      alert('Please enter valid numbers')
      return
    }

    setLines([...lines, {
      direction,
      line: parsedLine,
      odds: parsedOdds
    }])

    // Reset form
    setLineValue('')
    setOdds('')
  }

  // Remove a line
  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  // Load an example scenario
  const loadExample = (exampleLines: Line[]) => {
    setLines(exampleLines)
    // Reset form inputs
    setLineValue('')
    setOdds('')
  }

  // Calculate distribution
  const distribution = lines.length >= 1 ? calculateProbabilityDistribution(lines) : []
  const total = distribution.reduce((sum, range) => sum + range.probability, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-6 py-12 sm:py-16">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Betting Odds Analyzer
            </h1>
            <div className="w-12 h-px mx-auto bg-slate-300 dark:bg-slate-700" />
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Turn sportsbook odds into probability distributions
            </p>
          </div>
        </div>

        {/* Quick Start Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Load an example or add lines manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accordion for examples and manual entry */}
            <Accordion type="single" collapsible>
              <AccordionItem value="controls">
                <AccordionTrigger>Load Example or Add Lines</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  {/* Examples section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Load Example:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EXAMPLE_SCENARIOS.map((example) => (
                        <Button
                          key={example.id}
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample(example.lines)}
                          className="text-xs"
                        >
                          {example.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Manual entry form */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Add Lines Manually:</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Direction</label>
                        <Select value={direction} onValueChange={(val) => setDirection(val as 'over' | 'under')}>
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
                          onChange={(e) => setLineValue(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Odds</label>
                        <Input
                          type="number"
                          placeholder="-110"
                          value={odds}
                          onChange={(e) => setOdds(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddLine}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      + Add Line
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Current Lines - Always visible, outside accordion */}
            {lines.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Current Lines:</h3>
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg"
                    >
                      <span className="font-mono text-sm">
                        {line.direction === 'over' ? 'Over' : 'Under'} {line.line} @ {line.odds > 0 ? '+' : ''}{line.odds}
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
          </CardContent>
        </Card>

        {/* Results Card */}
        {distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Probability Distribution</CardTitle>
              <CardDescription>
                Calculated from {lines.length} betting line{lines.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-medium">{range.label}</TableCell>
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

              {/* Chart visualization */}
              <div className="mt-8 pt-8 border-t outline-none focus:outline-none select-none">
                <ResponsiveContainer width="100%" height={300} className="outline-none focus:outline-none select-none">
                  <BarChart
                    data={distribution.map(range => ({
                      outcome: range.label,
                      probability: range.probability * 100
                    }))}
                    margin={{ left: 10, right: 10, top: 20, bottom: 5 }}
                    style={{ cursor: 'default' }}
                  >
                    <XAxis
                      dataKey="outcome"
                      tick={{ fill: 'currentColor', fontFamily: 'inherit' }}
                      style={{ fontSize: '14px' }}
                    />
                    <Bar
                      dataKey="probability"
                      fill="hsl(var(--foreground))"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={false}
                      label={{
                        position: 'top',
                        formatter: (value: number) => `${value.toFixed(1)}%`,
                        fill: 'currentColor',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
