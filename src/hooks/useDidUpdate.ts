import { useEffect, useRef } from 'react';

/**
 * @description 此 hooks 类似于 class 组件的额 componentDidUpdate 不包含 DidMount
 */
const useDidUpdate = (callback: Function, inputs: any[]) => {
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    callback?.();
  }, inputs);
};

export default useDidUpdate;
