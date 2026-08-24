'use client'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * A fully-styled dropdown that replaces raw <select> elements.
 * Native <select> popups render with the OS/browser's own fonts and
 * colors and can't be themed - they always look out of place next to
 * this app's rounded, warm-toned buttons and inputs. This wraps
 * @base-ui/react's unstyled Select primitive (already a project
 * dependency - see package.json) with the same tokens/sizing used by
 * inputs elsewhere (bg-background, border-border, rounded-lg,
 * focus:border-accent), so every dropdown in the app looks like part
 * of the same design instead of a browser default.
 */
export function Select({ value, onValueChange, options, placeholder, className, size = 'default', disabled }) {
  // Default size intentionally has NO text-* utility class, same as
  // every other <input> in this app (see e.g. the Category text
  // input siblings in products/page.jsx) - they inherit the 18px
  // body font-size set in globals.css. The "sm" variant (used
  // inline in table rows and the status-change dropdown) uses
  // text-lg to match DataTable's own text-lg cells.
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-lg' : 'px-3.5 py-2.5'
  const itemSizeClass = size === 'sm' ? 'px-3 py-2 text-lg' : 'px-3.5 py-2.5'
  const labelOf = (val) => options.find((o) => o.value === val)?.label ?? val

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent hover:border-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClass,
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>{labelOf}</SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown size={size === 'sm' ? 16 : 18} className="text-foreground/50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={6} className="z-50">
          <SelectPrimitive.Popup className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[var(--anchor-width)] max-h-64 overflow-auto">
            <SelectPrimitive.List>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'group flex items-center gap-2 text-foreground rounded-md mx-1 cursor-pointer data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground select-none',
                    itemSizeClass,
                  )}
                >
                  <SelectPrimitive.ItemIndicator
                    keepMounted
                    className="w-4 shrink-0 opacity-0 group-data-[selected]:opacity-100"
                  >
                    <Check size={size === 'sm' ? 14 : 16} />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
