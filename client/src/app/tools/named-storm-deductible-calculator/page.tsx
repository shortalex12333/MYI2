'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Share2, Code, Info, ExternalLink } from 'lucide-react'

export default function NamedStormCalculatorPage() {
  const [insuredValue, setInsuredValue] = useState('300000')
  const [deductiblePercent, setDeductiblePercent] = useState('5')
  const [deductibleAmount, setDeductibleAmount] = useState(0)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  useEffect(() => {
    const value = parseFloat(insuredValue.replace(/,/g, '')) || 0
    const percent = parseFloat(deductiblePercent) || 0
    const calculated = (value * percent) / 100
    setDeductibleAmount(calculated)
  }, [insuredValue, deductiblePercent])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleInsuredValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setInsuredValue(value)
  }

  const scenarios = [
    { damage: 5000, label: 'Minor damage' },
    { damage: deductibleAmount * 0.5, label: 'Below deductible' },
    { damage: deductibleAmount * 2, label: 'Moderate damage' },
    { damage: deductibleAmount * 5, label: 'Severe damage' },
    { damage: parseFloat(insuredValue.replace(/,/g, '')) || 0, label: 'Total loss' },
  ]

  const shareUrl = `https://www.myyachtsinsurance.com/tools/named-storm-deductible-calculator`
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>Named Storm Deductible Calculator</span>
      </nav>

      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Calculator className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Named Storm Deductible Calculator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Calculate your exact hurricane deductible for Florida yacht insurance
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Calculator Input */}
        <Card>
          <CardHeader>
            <CardTitle>Your Policy Details</CardTitle>
            <CardDescription>
              Enter your yacht's insured value and named storm deductible percentage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="insured-value" className="text-base mb-2 block">
                Insured Value
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="insured-value"
                  type="text"
                  value={insuredValue ? parseInt(insuredValue).toLocaleString() : ''}
                  onChange={handleInsuredValueChange}
                  placeholder="300,000"
                  className="pl-8 text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The agreed value or ACV on your policy
              </p>
            </div>

            <div>
              <Label htmlFor="deductible-percent" className="text-base mb-2 block">
                Named Storm Deductible Percentage
              </Label>
              <div className="relative">
                <Input
                  id="deductible-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={deductiblePercent}
                  onChange={(e) => setDeductiblePercent(e.target.value)}
                  placeholder="5"
                  className="pr-8 text-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Typically 2-10% in Florida (check your policy)
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Your Deductible Amount:</span>
              </div>
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(deductibleAmount)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This is what you pay out-of-pocket before insurance covers the rest
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results & Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Damage Scenarios</CardTitle>
            <CardDescription>
              How your deductible affects different types of hurricane damage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.filter(s => s.damage > 0).map((scenario, index) => {
                const youPay = Math.min(scenario.damage, deductibleAmount)
                const insurancePays = Math.max(0, scenario.damage - deductibleAmount)

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-semibold mb-2">{scenario.label}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Damage:</div>
                        <div className="font-medium">{formatCurrency(scenario.damage)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">You Pay:</div>
                        <div className="font-medium text-red-600">{formatCurrency(youPay)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground">Insurance Pays:</div>
                        <div className="font-medium text-green-600">{formatCurrency(insurancePays)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <Info className="h-8 w-8 text-blue-600 mb-2" />
          <CardTitle>What This Means in Plain English</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>If Hurricane Ian damages your yacht:</strong> You pay the first {formatCurrency(deductibleAmount)} out of your own pocket. Insurance only starts paying once damage exceeds this amount.
          </p>
          <p>
            <strong>If damage is less than your deductible:</strong> You pay for all repairs yourself. For example, if a hurricane causes $8,000 in damage but your deductible is {formatCurrency(deductibleAmount)}, you cover the entire $8,000.
          </p>
          <p>
            <strong>If it's a total loss:</strong> You pay your {formatCurrency(deductibleAmount)} deductible, and insurance pays the remaining {formatCurrency((parseFloat(insuredValue.replace(/,/g, '')) || 0) - deductibleAmount)}.
          </p>
        </CardContent>
      </Card>

      {/* Share & Embed */}
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(shareUrl)
            setShowShareDialog(true)
            setTimeout(() => setShowShareDialog(false), 2000)
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Calculator
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowEmbedDialog(!showEmbedDialog)}
        >
          <Code className="h-4 w-4 mr-2" />
          Embed on Your Site
        </Button>
      </div>

      {showShareDialog && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          ✓ Link copied to clipboard!
        </div>
      )}

      {showEmbedDialog && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
            <CardDescription>
              Copy this code to embed the calculator on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <Button
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(embedCode)
              }}
            >
              Copy Embed Code
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Learn More */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Want to Learn More?</CardTitle>
          <CardDescription>
            Read our comprehensive guide to understand how named storm deductibles work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/learn/named-storm-deductible">
            <Button variant="outline" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Full Guide
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Related Pages */}
      <section className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Agreed Value vs ACV</CardTitle>
                <CardDescription>Understand policy valuation methods</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/navigation-limits-and-layup-warranty">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Navigation Limits</CardTitle>
                <CardDescription>Geographic coverage restrictions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/yacht-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Yacht Insurance Guide</CardTitle>
                <CardDescription>Complete coverage overview</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
