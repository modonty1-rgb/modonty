interface ModontyIconProps {
  className?: string;
}

export function ModontyIcon({ className }: ModontyIconProps) {
  return (
    <svg
      viewBox="0 0 54.81 54.91"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="54.81" height="54.91" rx="4.59" fill="#0e065a" />
      <rect x="8.43" y="37.56" width="4.22" height="4.22" transform="translate(-24.96 19.07) rotate(-45)" fill="#00d8d8" />
      <path
        d="M46.38,22.8v18.98h-4.22v-18.98c0-3.49-2.83-6.33-6.32-6.33s-6.33,2.84-6.33,6.33v18.98h-4.21v-18.98c0-3.49-2.84-6.33-6.33-6.33s-6.33,2.84-6.33,6.33v10.54h-4.21v-10.54c0-.72.07-1.43.21-2.11.31-1.56.97-2.98,1.89-4.21.6-.79,1.31-1.5,2.11-2.1,1.76-1.32,3.95-2.11,6.33-2.11s4.56.79,6.33,2.11c.79.59,1.5,1.31,2.1,2.1.6-.79,1.31-1.5,2.11-2.1,1.76-1.32,3.95-2.11,6.33-2.11s4.56.79,6.32,2.11c.8.59,1.52,1.31,2.11,2.1.92,1.23,1.58,2.66,1.9,4.21.13.69.21,1.39.21,2.11Z"
        fill="#3030ff"
      />
    </svg>
  );
}
