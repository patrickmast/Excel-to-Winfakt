import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { HTMLAttributes } from "react"

export type MenubarShortcutProps = HTMLAttributes<HTMLSpanElement>
export type MenubarProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
export type MenubarTriggerProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
export type MenubarSubTriggerProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}
export type MenubarSubContentProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
export type MenubarContentProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
export type MenubarItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
  inset?: boolean
}
export type MenubarCheckboxItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
export type MenubarRadioItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
export type MenubarLabelProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}
export type MenubarSeparatorProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>