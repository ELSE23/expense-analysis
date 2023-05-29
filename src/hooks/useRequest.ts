import { useState, useRef, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, Canceler } from 'axios';
import { getRandomId, isEmpty } from '@/utils';
import useDidUpdate from '@/hooks/useDidUpdate';

const clientRequest = axios.create({
  method: 'POST',
  baseURL: '/api'
});

const COMPONENT_UPDATE_MESSAGE = 'component update';
const COMPONENT_UNMOUNT_MESSAGE = 'component unmount';

interface RequestCancelerRef {
  [key: string]: Canceler;
}

/**
 * @description 组件内请求的 hooks
 * @param inputs 改变会取消正在发起的请求
 */
const useRequest = (inputs: any[] = []) => {
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

  async function request(
    url: string,
    data?: object,
    config?: object
  ): Promise<[null, AxiosResponse<any>]>;
  async function request(
    url: string,
    data?: object,
    config?: object
  ): Promise<[object]>;
  async function request(url: string, data?: object, config?: object) {
    // 规定组件内所有请求都通过 此方法来发送以便维护
    !loading && setLoading(true);

    const _id = getRandomId();
    const promise = clientRequest(
      Object.assign({ data, url }, config, {
        cancelToken: new axios.CancelToken(cancel => {
          requests.current[_id] = cancel;
        })
      })
    );

    let error: unknown = null;
    let res: AxiosResponse | null = null;

    try {
      res = await promise;
    } catch (err) {
      // 这里因为组件已经卸载了，就直接返回，不走下面的逻辑了
      if (axios.isCancel(err) && err.message === COMPONENT_UNMOUNT_MESSAGE) {
        return [err];
      }
      error = err;
    }

    delete requests.current[_id];
    if (isEmpty(requests.current)) {
      setLoading(false);
    }

    if (error) {
      return [error];
    } else {
      return [null, res];
    }
  }
  return [useCallback(request, [loading]), loading] as const;
};

export default useRequest;
