import { AnimatePresence, motion } from "framer-motion";
import { Users, X } from "lucide-react";

import useFollowing from "../../hooks/useFollowing";
import UserRow from "./UserRow";

import {
  backdropVariants,
  modalVariants,
} from "../../utils/animation";

const FollowingModal = ({
  isOpen,
  onClose,
  onNavigate,
  userId,
}) => {
  const {
    data,
    isLoading,
    isError,
  } = useFollowing(userId, isOpen);

  const following = data?.data || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">
                Following
              </h2>

              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-125 overflow-y-auto">
              {isLoading && (
                <div className="space-y-4 p-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-800" />

                      <div className="flex-1">
                        <div className="h-4 w-28 rounded bg-zinc-800 mb-2" />

                        <div className="h-3 w-40 rounded bg-zinc-900" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isError && (
                <div className="py-16 text-center text-red-500">
                  Failed to load following.
                </div>
              )}

              {!isLoading &&
                !isError &&
                following.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users
                      size={44}
                      className="text-zinc-700"
                    />

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      Not Following Anyone
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500 text-center px-8">
                      Accounts you follow will appear here.
                    </p>
                  </div>
                )}

              {!isLoading &&
                !isError &&
                following.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onNavigate={onNavigate}
                  />
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowingModal;