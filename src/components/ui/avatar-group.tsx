import * as React from "react"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "../../lib/utils"

interface AvatarGroupProps {
  avatarUrls: { imageUrl: string; name: string; profileUrl?: string }[]
  className?: string
  onClick?: () => void
}

export function AvatarGroup({ avatarUrls, className, onClick }: AvatarGroupProps) {
  return (
    <div className={cn("flex cursor-pointer items-center justify-center", className)} onClick={onClick}>
      {avatarUrls.map((avatar, index) => (
        <motion.div
          key={index}
          className={cn(
            "relative",
            index > 0 && "-ml-4"
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{
            scale: 1.1,
            zIndex: 10,
            transition: { duration: 0.2 }
          }}
        >
          <div className="group relative flex items-center">
            <Avatar variant="app" className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-cookbook-bg">
              <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
              <AvatarFallback className="bg-cookbook-primary/20 text-cookbook-primary text-xs">
                {avatar.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute left-full ml-2 whitespace-nowrap rounded-md bg-cookbook-bg/80 backdrop-blur-sm px-2 py-1 text-sm font-medium text-cookbook-text opacity-0 shadow-sm pointer-events-none"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 0 }}
              whileHover={{ opacity: 1, x: 0 }}
            >
              {avatar.name}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
