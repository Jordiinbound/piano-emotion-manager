/**
 * Language Selector Component - Web Version
 * Piano Emotion Manager
 * 
 * Selector de idioma con dropdown
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check } from 'lucide-react';

export function LanguageSelector() {
  const { currentLanguage, currentLanguageInfo, changeLanguage, supportedLanguages } = useLanguage();

  const handleSelectLanguage = async (languageCode: string) => {
    await changeLanguage(languageCode as any);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-lg">{currentLanguageInfo.flag}</span>
          <span className="hidden sm:inline">{currentLanguageInfo.nativeName}</span>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className={isSelected ? 'font-semibold' : ''}>
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
