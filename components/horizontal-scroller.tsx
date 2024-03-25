import { cn } from "~/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

type HorizontalScrollerProps = {
  asChild?: boolean;
  snap?: boolean;
} & React.ComponentPropsWithoutRef<"ul">;

export const HorizontalScroller = forwardRef<
  React.ComponentRef<"ul">,
  HorizontalScrollerProps
>(({ snap, asChild, children, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "ul";

  return (
    <Comp
      ref={ref}
      className={cn(
        "no-scrollbar -m-8 flex overflow-x-auto bg-gradient-to-r px-8 [--_margin:2rem] md:-mx-16 md:px-16 md:[--_margin:4rem]",
        snap && "snap-x snap-mandatory md:snap-none",
        className,
      )}
      style={{
        webkitMaskImage:
          "linear-gradient(to right, transparent, black var(--_margin), black calc(100% - var(--_margin)), transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black var(--_margin), black calc(100% - var(--_margin)), transparent)",
      }}
      {...props}
    >
      {children}
    </Comp>
  );
});

HorizontalScroller.displayName = "HorizontalScroller";
