import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <rect width="100" height="100" rx="20" fill="#2E7D32"/>
        <text x="50" y="68" fontFamily="Arial, sans-serif" fontSize="60" fill="white" textAnchor="middle" fontWeight="bold">B</text>
    </svg>
  );
}
