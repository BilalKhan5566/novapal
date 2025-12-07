"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type PersonalizationTone = 'neutral' | 'friendly' | 'formal';
export type PersonalizationLength = 'concise' | 'normal' | 'detailed';
export type PersonalizationLanguage = 'english';

export interface PersonalizationSettings {
  tone: PersonalizationTone;
  answerLength: PersonalizationLength;
  language: PersonalizationLanguage;
}

interface PersonalizePanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PersonalizationSettings;
  onSettingsChange: (settings: PersonalizationSettings) => void;
}

export default function PersonalizePanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: PersonalizePanelProps) {
  if (!isOpen) return null;

  const handleToneChange = (tone: PersonalizationTone) => {
    onSettingsChange({ ...settings, tone });
  };

  const handleLengthChange = (answerLength: PersonalizationLength) => {
    onSettingsChange({ ...settings, answerLength });
  };

  const handleLanguageChange = (language: PersonalizationLanguage) => {
    onSettingsChange({ ...settings, language });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card border-l border-border z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Personalize NovaPal</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize how NovaPal responds
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Tone */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Tone</Label>
              <p className="text-sm text-muted-foreground mt-1">
                How should NovaPal communicate with you?
              </p>
            </div>
            <RadioGroup
              value={settings.tone}
              onValueChange={(value) => handleToneChange(value as PersonalizationTone)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="neutral" id="tone-neutral" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="tone-neutral" className="font-medium cursor-pointer">
                    Neutral
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Balanced and professional responses
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="friendly" id="tone-friendly" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="tone-friendly" className="font-medium cursor-pointer">
                    Friendly
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Warm and conversational tone
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="formal" id="tone-formal" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="tone-formal" className="font-medium cursor-pointer">
                    Formal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Professional and precise language
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Answer Length */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Answer Length</Label>
              <p className="text-sm text-muted-foreground mt-1">
                How detailed should responses be?
              </p>
            </div>
            <RadioGroup
              value={settings.answerLength}
              onValueChange={(value) => handleLengthChange(value as PersonalizationLength)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="concise" id="length-concise" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="length-concise" className="font-medium cursor-pointer">
                    Concise
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Brief and to the point
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="normal" id="length-normal" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="length-normal" className="font-medium cursor-pointer">
                    Normal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Balanced detail level
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="detailed" id="length-detailed" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="length-detailed" className="font-medium cursor-pointer">
                    Detailed
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive and thorough
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Default Language */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Default Language</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Primary language for responses
              </p>
            </div>
            <RadioGroup
              value={settings.language}
              onValueChange={(value) => handleLanguageChange(value as PersonalizationLanguage)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="english" id="lang-english" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="lang-english" className="font-medium cursor-pointer">
                    English
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Default language
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}
