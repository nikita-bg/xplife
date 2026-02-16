'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LogOut, Upload, Plus, X } from 'lucide-react'
import { AvatarCropDialog } from './avatar-crop-dialog'
import { useTranslations, useLocale } from 'next-intl'

interface SettingsFormProps {
  userId: string
  currentDisplayName: string
  currentAvatarUrl: string | null
  currentAboutMe: string
  // Personalization
  initialTimePreference?: string
  initialTaskDuration?: string
  initialOccupation?: string | null
  initialWorkSchedule?: string | null
  initialLifePhase?: string | null
  initialMainChallenge?: string | null
  initialInterests: string[]
}

const INTEREST_OPTIONS = [
  'Yoga', 'Running', 'Meditation', 'Reading', 'Writing', 'Coding', 'Painting',
  'Music', 'Gaming', 'Cooking', 'Photography', 'Languages', 'Hiking',
  'Gardening', 'Dancing', 'Cycling', 'Swimming', 'Drawing', 'Journaling', 'Podcasts'
]

export function SettingsForm({
  userId,
  currentDisplayName,
  currentAvatarUrl,
  currentAboutMe,
  initialTimePreference,
  initialTaskDuration,
  initialOccupation,
  initialWorkSchedule,
  initialLifePhase,
  initialMainChallenge,
  initialInterests
}: SettingsFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('profile.settings')

  // General State
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [aboutMe, setAboutMe] = useState(currentAboutMe)

  // Personalization State
  const [timePreference, setTimePreference] = useState(initialTimePreference || 'morning')
  const [taskDuration, setTaskDuration] = useState(initialTaskDuration || 'medium')
  const [occupation, setOccupation] = useState(initialOccupation || undefined)
  const [workSchedule, setWorkSchedule] = useState(initialWorkSchedule || undefined)
  const [lifePhase, setLifePhase] = useState(initialLifePhase || undefined)
  const [mainChallenge, setMainChallenge] = useState(initialMainChallenge || undefined)
  const [interests, setInterests] = useState<string[]>(initialInterests)
  const [newInterest, setNewInterest] = useState('')

  // UI State
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const supabase = createClient()

    // 1. Update User Profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        about_me: aboutMe || null,
        time_preference: timePreference,
        preferred_task_duration: taskDuration,
        occupation_type: !occupation || occupation === 'none' ? null : occupation,
        work_schedule: !workSchedule || workSchedule === 'none' ? null : workSchedule,
        life_phase: !lifePhase || lifePhase === 'none' ? null : lifePhase,
        main_challenge: !mainChallenge || mainChallenge === 'none' ? null : mainChallenge,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save profile: ' + updateError.message)
      setSaving(false)
      return
    }

    // 2. Update Interests (Delete all -> Insert new)
    // First delete existing
    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting interests:', deleteError)
    }

    // Then insert new ones
    if (interests.length > 0) {
      const interestInserts = interests.map(interest => ({
        user_id: userId,
        interest
      }))
      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(interestInserts)

      if (insertError) {
        console.error('Error inserting interests:', insertError)
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
    router.refresh()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropImage(url)
    setCropDialogOpen(true)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleCropComplete = () => {
    setCropDialogOpen(false)
    setCropImage(null)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      if (interests.length >= 10) return // Limit to 10
      setInterests([...interests, interest])
    }
  }

  const addCustomInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      if (interests.length >= 10) return
      setInterests([...interests, newInterest])
      setNewInterest('')
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold text-foreground">{t('title')}</h2>
        {saved && (
          <span className="text-sm font-medium text-accent animate-in fade-in slide-in-from-right-4">
            {t('saveSuccess')}
          </span>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="personalization">{t('tabs.personalization')}</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t('displayName')}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutMe">{t('aboutMe')}</Label>
            <Textarea
              id="aboutMe"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value.slice(0, 500))}
              placeholder={t('aboutMePlaceholder')}
              className="bg-background/50 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {t('aboutMeChars', { count: aboutMe.length })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <Label>{t('avatar')}</Label>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {t('uploadAvatar')}
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </TabsContent>

        {/* PERSONALIZATION SETTINGS */}
        <TabsContent value="personalization" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('personalization.timePreference')}</Label>
              <Select value={timePreference} onValueChange={setTimePreference}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{t('personalization.timeOptions.morning')}</SelectItem>
                  <SelectItem value="afternoon">{t('personalization.timeOptions.afternoon')}</SelectItem>
                  <SelectItem value="evening">{t('personalization.timeOptions.evening')}</SelectItem>
                  <SelectItem value="night">{t('personalization.timeOptions.night')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('personalization.taskDuration')}</Label>
              <Select value={taskDuration} onValueChange={setTaskDuration}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">{t('personalization.durationOptions.quick')}</SelectItem>
                  <SelectItem value="medium">{t('personalization.durationOptions.medium')}</SelectItem>
                  <SelectItem value="deep">{t('personalization.durationOptions.deep')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('personalization.occupation')}</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('personalization.selectOccupation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">{t('personalization.occupationOptions.student')}</SelectItem>
                  <SelectItem value="Office Worker">{t('personalization.occupationOptions.officeWorker')}</SelectItem>
                  <SelectItem value="Remote Worker">{t('personalization.occupationOptions.remoteWorker')}</SelectItem>
                  <SelectItem value="Freelancer">{t('personalization.occupationOptions.freelancer')}</SelectItem>
                  <SelectItem value="Stay-at-home Parent">{t('personalization.occupationOptions.stayAtHomeParent')}</SelectItem>
                  <SelectItem value="Entrepreneur">{t('personalization.occupationOptions.entrepreneur')}</SelectItem>
                  <SelectItem value="Retired">{t('personalization.occupationOptions.retired')}</SelectItem>
                  <SelectItem value="Other">{t('personalization.occupationOptions.other')}</SelectItem>
                  <SelectItem value="none">{t('personalization.preferNotToSay')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('personalization.workSchedule')}</Label>
              <Select value={workSchedule} onValueChange={setWorkSchedule}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('personalization.selectSchedule')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9-to-5">{t('personalization.scheduleOptions.standard')}</SelectItem>
                  <SelectItem value="Flexible">{t('personalization.scheduleOptions.flexible')}</SelectItem>
                  <SelectItem value="Shift Work">{t('personalization.scheduleOptions.shiftWork')}</SelectItem>
                  <SelectItem value="Part-time">{t('personalization.scheduleOptions.partTime')}</SelectItem>
                  <SelectItem value="Irregular">{t('personalization.scheduleOptions.irregular')}</SelectItem>
                  <SelectItem value="none">{t('personalization.preferNotToSay')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('personalization.lifePhase')}</Label>
              <Select value={lifePhase} onValueChange={setLifePhase}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('personalization.selectLifePhase')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">{t('personalization.lifePhaseOptions.highSchool')}</SelectItem>
                  <SelectItem value="University">{t('personalization.lifePhaseOptions.university')}</SelectItem>
                  <SelectItem value="Early Career">{t('personalization.lifePhaseOptions.earlyCareer')}</SelectItem>
                  <SelectItem value="Mid Career">{t('personalization.lifePhaseOptions.midCareer')}</SelectItem>
                  <SelectItem value="Parent">{t('personalization.lifePhaseOptions.parent')}</SelectItem>
                  <SelectItem value="Career Change">{t('personalization.lifePhaseOptions.careerChange')}</SelectItem>
                  <SelectItem value="Retired">{t('personalization.lifePhaseOptions.retired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('personalization.mainChallenge')}</Label>
              <Select value={mainChallenge} onValueChange={setMainChallenge}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('personalization.selectChallenge')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Time">{t('personalization.challengeOptions.time')}</SelectItem>
                  <SelectItem value="Energy">{t('personalization.challengeOptions.energy')}</SelectItem>
                  <SelectItem value="Focus">{t('personalization.challengeOptions.focus')}</SelectItem>
                  <SelectItem value="Motivation">{t('personalization.challengeOptions.motivation')}</SelectItem>
                  <SelectItem value="Consistency">{t('personalization.challengeOptions.consistency')}</SelectItem>
                  <SelectItem value="none">{t('personalization.preferNotToSay')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t('personalization.interests', { count: interests.length })}</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder={t('personalization.addCustomInterest')}
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
                className="max-w-[200px] bg-background/50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCustomInterest}
                disabled={!newInterest || interests.includes(newInterest)}
                aria-label="Add custom interest"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.filter(i => !INTEREST_OPTIONS.includes(i)).map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? t('saving') : t('save')}
        </Button>

        <div className="border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </Button>
        </div>
      </div>

      {cropImage && (
        <AvatarCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open)
            if (!open) setCropImage(null)
          }}
          imageSrc={cropImage}
          userId={userId}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
