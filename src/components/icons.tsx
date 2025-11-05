import * as React from "react";

export const DraglistLogo: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  style,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    style={{ width: "100%", height: "100%", ...style }}
    fill="currentColor"
    aria-label="Draglist Logo"
    {...props}
  >
    <path
      d="M 62.5,50
         L 62.5,150
         L 87.5,150
         L 87.5,112.5
         L 112.5,150
         L 137.5,150
         L 100,100
         L 137.5,50
         L 112.5,50
         L 87.5,87.5
         L 87.5,50
         Z"
    />
  </svg>
);

export const Logo = DraglistLogo;
