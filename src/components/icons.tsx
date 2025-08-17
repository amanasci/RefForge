import type { SVGProps } from "react";

export function RefForgeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.5 7.5L12 3l8.5 4.5" />
      <path d="M3.5 7.5v9L12 21l8.5-4.5v-9" />
      <path d="M12 12.5L3.5 8 12 3l8.5 5L12 12.5" />
      <path d="M12 12.5V21" />
      <path d="M18 10l-6 3-6-3" />
    </svg>
  );
}
