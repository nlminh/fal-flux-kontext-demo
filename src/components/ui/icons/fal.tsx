import type React from "react";

export const FalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="40"
      height="20"
      viewBox="0 0 40 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.5 5.5V14.5M8.5 5.5H3.5M8.5 10H5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 5.5V14.5M17.5 5.5C17.5 5.5 19.5 5.5 20.5 6.5C21.5 7.5 21.5 8.5 21.5 10C21.5 11.5 21.5 12.5 20.5 13.5C19.5 14.5 17.5 14.5 17.5 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.5 5.5V14.5M26.5 5.5H31M26.5 14.5H31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="13" r="1.5" fill="currentColor" />
      <circle cx="38" cy="13" r="1.5" fill="currentColor" />
      <path
        d="M34 5.5V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 5.5V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
