import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    seoDescription?: string;
    link?: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6",
        className
      )}
    >
      {items.map((item, idx) => {
        const Component = item.link ? 'a' : 'div';
        const linkProps = item.link ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : {};

        return (
          <Component
            key={item?.title}
            className="relative group block p-2 h-full w-full cursor-pointer touch-manipulation"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => setHoveredIndex(idx)}
            onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 2000)}
            {...linkProps}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-muted/50 dark:bg-accent/20 block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <HoverCard>
              <HoverCardTitle>{item.title}</HoverCardTitle>
              <HoverCardDescription>{item.description}</HoverCardDescription>
              {item.seoDescription && (
                <div className="mt-2 text-xs text-muted-foreground/80 leading-relaxed">
                  {item.seoDescription}
                </div>
              )}
            </HoverCard>
          </Component>
        );
      })}
    </div>
  );
};

export const HoverCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-card border border-border group-hover:border-primary/50 relative z-20 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02] min-h-[200px] flex flex-col",
        className
      )}
    >
      <div className="relative z-50 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">{children}</div>
      </div>
    </div>
  );
};

export const HoverCardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-card-foreground font-bold tracking-wide text-lg", className)}>
      {children}
    </h4>
  );
};

export const HoverCardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "text-muted-foreground tracking-wide leading-relaxed text-sm space-y-2",
        className
      )}
    >
      {typeof children === 'string' ? (
        children.split('\n').map((line, index) => (
          line.trim() ? <p key={index}>{line}</p> : <br key={index} />
        ))
      ) : (
        children
      )}
    </div>
  );
};
