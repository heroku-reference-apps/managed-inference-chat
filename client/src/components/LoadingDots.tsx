interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <div className={`loading-dots ${className}`}>
      <div />
      <div />
      <div />
    </div>
  );
}
