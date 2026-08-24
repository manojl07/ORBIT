const backdropVariants = {

  hidden: { opacity: 0, },

  visible: { opacity: 1, },

  exit: { opacity: 0, },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20, },

  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.25, ease: "easeOut", },
  },

  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2,}},
};

export { backdropVariants, modalVariants };