import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-14 w-14 text-primary"
      {...props}
    >
      <path d="M15 6.343a4.5 4.5 0 0 1 0 6.364L10.05 17.657a4.5 4.5 0 1 1-6.364-6.364L8.636 6.343a4.5 4.5 0 0 1 6.364 0Z" />
      <path d="M9 17.657a4.5 4.5 0 0 1 0-6.364L13.95 6.343a4.5 4.5 0 1 1 6.364 6.364L15.364 17.657a4.5 4.5 0 0 1-6.364 0Z" />
    </svg>
  );
}
