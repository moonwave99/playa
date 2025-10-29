import { ReactNode, Children } from "react";
import { motion, AnimatePresence } from "motion/react";
import useHover from "../hooks/useHover";

import cx from "clsx";
import styles from "./SlidingCardsView.module.css";

const MAIN_DELAY = 0.3;
const MAIN_DURATION = 0.3;
const SCALE_RATIO = 0.9;

type SlidingCardsViewProps = {
  className?: string;
  contentClassName?: string;
  padding?: number;
  coverGap?: number;
  labelJump?: number;
  coverSize: number;
  contentElement: ReactNode;
  children: ReactNode;
};

export default function SlidingCardsView({
  className,
  contentClassName,
  padding = 0,
  coverGap = 4,
  labelJump = 50,
  coverSize,
  children,
  contentElement,
}: SlidingCardsViewProps) {
  const { isHover: showCards, onMouseEnter, onMouseLeave } = useHover();

  const items = Children.toArray(children);
  const cover = items.pop();

  const scale = padding === 0 ? SCALE_RATIO : 1;
  const distance = coverSize * scale + coverGap;

  const itemVariants = {
    exit: { x: 0, scale: 1 },
  };

  const labelVariants = {
    hide: items.length ? { y: -labelJump, opacity: 0 } : {},
    show: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.2 + length / 40,
      },
    },
  };

  const coverVariants = {
    hide: {
      x: items.length * distance,
      scale: items.length ? scale : 1,
      transition: {
        x: {
          duration: MAIN_DURATION,
          delay: 0.1,
        },
        scale: {
          duration: MAIN_DURATION,
        },
      },
    },
    show: {
      x: 0,
      scale: 1,
      transition: {
        duration: MAIN_DURATION,
      },
    },
  };

  return (
    <motion.article
      className={cx(styles.view, className, {
        [styles.withPadding]: padding > 0,
      })}
      onMouseLeave={onMouseLeave}
    >
      <AnimatePresence>
        {showCards &&
          items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              exit="exit"
              animate={{
                x: index * distance,
                scale,
              }}
              transition={{
                delay: (index / items.length) * MAIN_DELAY,
                duration: (MAIN_DURATION * 3) / 4,
              }}
              className={styles.itemWrapper}
            >
              {item}
            </motion.div>
          ))}
      </AnimatePresence>

      <motion.div
        variants={coverVariants}
        animate={showCards ? "hide" : "show"}
        onMouseEnter={onMouseEnter}
      >
        {cover}
      </motion.div>

      <motion.div
        variants={labelVariants}
        className={cx(styles.contentElement, contentClassName)}
        animate={showCards ? "hide" : "show"}
      >
        {contentElement}
      </motion.div>
    </motion.article>
  );
}
