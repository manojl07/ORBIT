import { BadgeCheck } from "lucide-react";

const VerifiedBadge = ({ size = 16 }) => {
  return (
    <span
      className="inline-flex shrink-0 items-center text-blue-400"
      role="img"
      aria-label="Email verified"
      title="Email verified"
    >
      <BadgeCheck
        size={size}
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
};

export default VerifiedBadge;