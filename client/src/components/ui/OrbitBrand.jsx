import orbitLogo from "../../brand/orbit-logo-mark.svg";

const OrbitBrand = ({ className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
    >
      {/* ORBIT SYMBOL */}
      <img
        src={orbitLogo}
        alt=""
        aria-hidden="true"
        className="
          h-9
          w-9
          object-contain
        "
      />

      {/* ORBIT WORDMARK */}
      <span
        className="
          text-4xl
          font-semibold
          tracking-tight
          fontfamily
          font-[Manrope]
        "
      >
        <span
          className="
            bg-linear-to-r
            from-[#7B2CBF]
            to-[#FF6B6B]
            bg-clip-text
            text-transparent
          "
        >
          o
        </span>

        <span className="text-white ">
          rbit
        </span>
      </span>
    </div>
  );
};

export default OrbitBrand;