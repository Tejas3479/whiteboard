import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

export function AnimatedBorder({
  children,
  className,
  containerClassName,
  ...props
}: AnimatedBorderProps) {
  return (
    <div className={cn("relative group", containerClassName)} {...props}>
      <div className={cn("animated-border-card p-[1px] w-full h-full")}>
        <div className={cn("relative z-10 h-full w-full bg-transparent rounded-[inherit]", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
