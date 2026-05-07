import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "../../lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    variant?: "close-friends" | "normal" | "none" | "app"
  }
>(({ className, variant = "none", ...props }, ref) => {
  let variantClass = ""
  switch (variant) {
    case "close-friends":
      variantClass = "p-[2px] bg-gradient-to-tr from-green-400 to-green-600 rounded-full"
      break
    case "normal":
      variantClass = "p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full"
      break
    case "app":
      variantClass = "p-[2px] bg-cookbook-primary rounded-full transition-colors duration-300"
      break
  }

  return (
    <div className={cn("relative flex shrink-0 overflow-hidden rounded-full", variantClass, className)}>
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex h-full w-full shrink-0 overflow-hidden rounded-full border-2 border-background",
        )}
        {...props}
      />
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
