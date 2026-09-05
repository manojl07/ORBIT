export const backdropVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },

  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 16,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1], // smoother than "easeOut"
    },
  },

  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.18,
    },
  },
};

export const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
};