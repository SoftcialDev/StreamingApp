// src/components/ui/button.tsx

import React from "react";
import clsx from "clsx";

/**
 * Props for when rendering as a <button>.
 */
interface ButtonAsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}

/**
 * Props for when rendering as an <a>.
 */
interface ButtonAsAnchorProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as: "a";
  href: string;
}

/**
 * Union of the two modes. Exactly one of these will apply.
 */
type ButtonProps = (ButtonAsButtonProps | ButtonAsAnchorProps) & {
  /**
   * Optional Tailwind class overrides.
   */
  className?: string;
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = (props) => {
  const baseStyles =
    "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700";

  const { as = "button", className, children, ...rest } = props as any;

  const Comp = as === "a" ? "a" : "button";

  return (
    <Comp className={clsx(baseStyles, className)} {...rest}>
      {children}
    </Comp>
  );
};

export default Button;
