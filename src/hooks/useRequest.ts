import { useState, useRef, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, Canceler } from 'axios';
import { getRandomId, isEmpty } from '@/utils';
import useDidUpdate from '@/hooks/useDidUpdate';

const clientRequest = axios.create({});

const COMPONENT_UPDATE_MESSAGE = 'component update';
const COMPONENT_UNMOUNT_MESSAGE = 'component unmount';

interface RequestCancelerRef {
  [key: string]: Canceler;
}

/**
 * @description 组件内请求的 hooks
 * @param inputs 改变会取消正在发起的请求
 * @returns {[function(*, *=): Promise<[*, null]|[null, null]>, boolean]}
 */
const useRequest = <T = any>(inputs = []) => {
  const requests = useRef<RequestCancelerRef>({});
  const [loading, setLoading] = useState(false);

  const unmount = useRef(false);
  useDidUpdate(() => {
    handleCancelRequests(COMPONENT_UPDATE_MESSAGE);
  }, inputs);

  useEffect(() => {
    return () => {
      unmount.current = true;
      handleCancelRequests(COMPONENT_UNMOUNT_MESSAGE);
    };
  }, []);

  const handleCancelRequests = (message: string) => {
    const { current } = requests;

    for (let key in current) {
      current.hasOwnProperty(key) && current[key]?.(message);
    }
  };

  const request = useCallback(
    async (url: string, data?: object, config?: object) => {
      if (!data && !config) {
        // 无参数则是开启 loading 之后有异步任务，然后再进行请求，通过 loading 可以禁用按钮
        !loading && setLoading(true);
        return;
      }

      // 规定组件内所有请求都通过 此方法来发送以便维护
      !loading && setLoading(true);

      const _id = getRandomId();
      const promise = clientRequest<T>(
        Object.assign({ data, url }, config, {
          cancelToken: new axios.CancelToken(cancel => {
            requests.current[_id] = cancel;
          })
        })
      );

      let error = null;
      let res: AxiosResponse<T> | null = null;

      try {
        res = await promise;
      } catch (err) {
        // 这里因为组件已经卸载了，就直接返回，不走下面的逻辑了
        if (axios.isCancel(err) && err.message === COMPONENT_UNMOUNT_MESSAGE) {
          return [err, {}];
        }
        error = err;
      }

      delete requests.current[_id];
      if (isEmpty(requests.current)) {
        setLoading(false);
      }

      return [error, res];
    },
    [loading]
  );

  return [request, loading];
};

export default useRequest;
