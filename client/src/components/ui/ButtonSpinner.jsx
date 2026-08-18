const ButtonSpinner = ({ size = 18 }) => {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{width: size, height: size,}}
    />
  );
};

export default ButtonSpinner;