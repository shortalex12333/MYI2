'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    bio: '',
    yachts_owned: '',
    primary_vessel: '',
  })
  const [vessels, setVessels] = useState<Array<{
    name: string
    type: string
    length_ft: string
    year_built: string
    home_port: string
  }>>([{
    name: '',
    type: '',
    length_ft: '',
    year_built: '',
    home_port: '',
  }])

  const handleAddVessel = () => {
    setVessels([...vessels, {
      name: '',
      type: '',
      length_ft: '',
      year_built: '',
      home_port: '',
    }])
  }

  const handleVesselChange = (index: number, field: string, value: string) => {
    const newVessels = [...vessels]
    newVessels[index] = { ...newVessels[index], [field]: value }
    setVessels(newVessels)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Update profile
      await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      // Add vessels
      for (const vessel of vessels) {
        if (vessel.name) {
          await fetch('/api/v1/vessels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vessel),
          })
        }
      }

      router.push('/')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {step === 1
                ? 'Tell us about yourself'
                : 'Add information about your yacht(s)'}
            </CardDescription>
            <div className="flex gap-2 mt-4">
              <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell the community about yourself..."
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yachts_owned">Number of Yachts Owned</Label>
                  <Input
                    id="yachts_owned"
                    type="number"
                    min="0"
                    value={profileData.yachts_owned}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        yachts_owned: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_vessel">Primary Vessel Name (Optional)</Label>
                  <Input
                    id="primary_vessel"
                    placeholder="e.g., Ocean Dream"
                    value={profileData.primary_vessel}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        primary_vessel: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {vessels.map((vessel, index) => (
                  <div key={index} className="space-y-4 pb-6 border-b last:border-0">
                    <h3 className="font-semibold">Yacht {index + 1}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Vessel Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={vessel.name}
                          onChange={(e) =>
                            handleVesselChange(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`type-${index}`}>Type</Label>
                        <Input
                          id={`type-${index}`}
                          placeholder="e.g., Sailing, Motor"
                          value={vessel.type}
                          onChange={(e) =>
                            handleVesselChange(index, 'type', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`length-${index}`}>Length (ft)</Label>
                        <Input
                          id={`length-${index}`}
                          type="number"
                          value={vessel.length_ft}
                          onChange={(e) =>
                            handleVesselChange(index, 'length_ft', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`year-${index}`}>Year Built</Label>
                        <Input
                          id={`year-${index}`}
                          type="number"
                          value={vessel.year_built}
                          onChange={(e) =>
                            handleVesselChange(index, 'year_built', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`port-${index}`}>Home Port</Label>
                        <Input
                          id={`port-${index}`}
                          placeholder="e.g., Miami, FL"
                          value={vessel.home_port}
                          onChange={(e) =>
                            handleVesselChange(index, 'home_port', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddVessel} className="w-full">
                  Add Another Yacht
                </Button>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
