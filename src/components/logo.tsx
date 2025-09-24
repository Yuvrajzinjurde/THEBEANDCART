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
      <circle cx="50" cy="50" r="48" fill="#4CAF50" stroke="#388E3C" strokeWidth="4"/>
      <path d="M68 30H42C36.4772 30 32 34.4772 32 40V48H42C47.5228 48 52 43.5228 52 38V30H68ZM42 52H32V60C32 65.5228 36.4772 70 42 70H68V62C68 56.4772 63.5228 52 58 52H42Z" fill="white"/>
      <path d="M52 38V30H68V62C68 56.4772 63.5228 52 58 52H52V38Z" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}
