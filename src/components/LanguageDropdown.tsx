"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/context/LanguageContext"

export function LanguageDropdown() {

  const { lang, setLang } = useLanguage()


  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button variant="ghost" className="gap-1.5 rounded-full! border! border-[rgba(245,220,160,0.25)]! bg-transparent! text-[rgba(245,220,160,0.8)]! hover:bg-[rgba(245,220,160,0.08)]! hover:text-[rgba(245,220,160,1)]! px-3! h-8! text-xs! font-semibold! tracking-widest!">
                {lang.toLocaleUpperCase()}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-28! bg-[#1a0f07]! border! border-[rgba(201,150,63,0.2)]! rounded-md! shadow-xl! p-2! ring-0!">
            <DropdownMenuItem onClick={() => setLang("es")} className="text-[rgba(245,220,160,0.7)]! hover:text-[rgba(245,220,160,1)]! focus:bg-[rgba(245,220,160,0.06)]! focus:text-[rgba(245,220,160,1)]! cursor-pointer! text-sm! px-3! py-1.5! rounded!">Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("en")} className="text-[rgba(245,220,160,0.7)]! hover:text-[rgba(245,220,160,1)]! focus:bg-[rgba(245,220,160,0.06)]! focus:text-[rgba(245,220,160,1)]! cursor-pointer! text-sm! px-3! py-1.5! rounded!">English</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
   
  )
}
