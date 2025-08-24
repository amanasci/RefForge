import type { SVGProps } from "react";

export function RefForgeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 800 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="24"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        {/* Left hexagon (flat-top) */}
        <polygon
          points="
            390,200
            325,310
            195,310
            130,200
            195,90
            325,90
          "
        />

        {/* Right hexagon (flat-top) */}
        <polygon
          points="
            670,200
            605,310
            475,310
            410,200
            475,90
            605,90
          "
        />
      </g>
    </svg>
  );
}
