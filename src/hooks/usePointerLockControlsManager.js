import { useEffect, useCallback, useState, useRef } from "react";
import useAppStore from "../store/useAppStore";

export default function usePointerLockControlsManager(controlsRef) {
  const {
    setPointerLocked,
    setShowStartPanel,
    isPointerLocked: storeIsPointerLocked,
  } = useAppStore();
  const [isActuallyLocked, setIsActuallyLocked] = useState(false);

  const listenersAttachedRef = useRef(false);

  const lockControls = useCallback(() => {
    if (controlsRef.current && !controlsRef.current.isLocked) {
      // console.log("PLCManager Hook: Calling controls.lock()");
      controlsRef.current.lock();
    } else if (!controlsRef.current) {
      console.warn(
        "PLCManager Hook: Attempted to lock, but controlsRef.current is null."
      );
    } else if (controlsRef.current && controlsRef.current.isLocked) {
      // console.log("PLCManager Hook: Attempted to lock, but already locked.");
    }
  }, [controlsRef]);

  const unlockControls = useCallback(() => {
    if (controlsRef.current && controlsRef.current.isLocked) {
      // console.log("PLCManager Hook: Calling controls.unlock()");
      controlsRef.current.unlock();
    } else if (!controlsRef.current) {
      console.warn(
        "PLCManager Hook: Attempted to unlock, but controlsRef.current is null."
      );
    } else if (controlsRef.current && !controlsRef.current.isLocked) {
      // console.log("PLCManager Hook: Attempted to unlock, but already unlocked.");
    }
  }, [controlsRef]); // Stable: depends only on the ref object

  // useEffect ensures controlsRef.current exists before proceeding
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls && !listenersAttachedRef.current) {
      // console.log("PLCManager Hook Effect: Controls ready, attaching listeners.", controls);
      // Initialize isActuallyLocked BASED ON THE FRESHLY AVAILABLE controls instance
      setIsActuallyLocked(controls.isLocked);

      const onLock = () => {
        // console.log("PLCManager Hook Event: Locked");
        setIsActuallyLocked(true);
        setPointerLocked(true);
        setShowStartPanel(false);
      };

      const onUnlock = () => {
        // console.log("PLCManager Hook Event: Unlocked");
        setIsActuallyLocked(false);
        setPointerLocked(false);
        setShowStartPanel(true);
      };

      controls.addEventListener("lock", onLock);
      controls.addEventListener("unlock", onUnlock);

      listenersAttachedRef.current = true;

      const handleKeyDown = (event) => {
        if (event.code === "KeyP" && controls.isLocked) {
          controls.unlock();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        // console.log("PLCManager Hook Effect: Cleaning up listeners for", controls);
        controls.removeEventListener("lock", onLock);
        controls.removeEventListener("unlock", onUnlock);
        window.removeEventListener("keydown", handleKeyDown);
        listenersAttachedRef.current = false;
      };
    } else if (!controls && listenersAttachedRef.current) {
      // console.log("PLCManager Hook Effect: Controls became null after listeners were attached.");
      // This case indicates the PointerLockControls component might have unmounted.
      // The cleanup from the *previous successful run* of this effect should have handled it.
      listenersAttachedRef.current = false; // Reset this flag
    } else if (controls && listenersAttachedRef.current) {
      // console.log("PLCManager Hook Effect: Controls already set up, doing nothing extra.");
    } else {
      // console.log("PLCManager Hook Effect: Controls not ready yet.");
    }
    // This effect should re-run if controlsRef.current changes (from null to an instance).
    // Also include other dependencies that, if changed, require re-attaching listeners or re-evaluating.
  }, [
    controlsRef.current,
    setPointerLocked,
    setShowStartPanel,
    storeIsPointerLocked,
  ]);
  return { lockControls, unlockControls, isLocked: isActuallyLocked };
}
