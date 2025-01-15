import { useEffect, useState, useRef } from "react";
import { WindowSetSize } from "../../wailsjs/runtime/runtime";

export function useWindowSetSize() {
  const [settingSize, setSettingSize] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (settingSize) {
      return;
    }

    const setSize = async () => {
      await WindowSetSize(windowSize.width, windowSize.height);
      setSettingSize(false);
    };

    setSize();
  }, [windowSize, settingSize]);

  return setWindowSize;
}

export default useWindowSetSize;
