import { type ReactNode } from "react";
import { motion } from "motion/react";

import styles from "./Onboarding.module.css";

const variants = {
  hidden: { opacity: 0, x: 0, y: 50 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: 50 },
};

type AnimatedLayoutProps = {
  children: ReactNode;
};

export function AnimatedLayout({ children }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.75 }}
      className={styles.stepWrapper}
    >
      {children}
    </motion.div>
  );
}
