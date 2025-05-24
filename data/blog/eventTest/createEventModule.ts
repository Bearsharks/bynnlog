import { useRef, useEffect } from 'react'

export interface EventMap {
  [eventKey: symbol]: any
}

/**
 * 타입 안전한 이벤트 이미터 클래스
 * 이벤트 키에 맞는 페이로드 타입을 강제하는 이벤트 발생기
 */
export function emit<M extends EventMap, K extends keyof M>(eventKey: K, payload: M[K]): void {
  // CustomEvent 생성
  const event = new CustomEvent<M[K]>(String(eventKey), {
    detail: payload,
  })

  // 이벤트 발생
  window.dispatchEvent(event)
  console.log(`Typed event emitted: ${String(eventKey)}`, payload)
}

/**
 * 타입 안전한 커스텀 이벤트 리스너 훅
 *
 * @param eventKey 이벤트 키
 * @param handler 이벤트 핸들러 함수
 * @param options 이벤트 리스너 옵션
 */
export function useTypedEventListener<M extends EventMap, K extends keyof M>(
  eventKey: K,
  handler: (payload: M[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  // 핸들러 함수를 ref로 저장하여 불필요한 리렌더링 방지
  const handlerRef = useRef<(payload: M[K]) => void>(handler)

  // 핸들러 함수가 변경될 때마다 ref 업데이트
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // 이벤트 래퍼 함수 생성
    const eventListener = (event: Event) => {
      const customEvent = event as CustomEvent<M[K]>
      handlerRef.current(customEvent.detail)
    }

    // 이벤트 등록
    window.addEventListener(String(eventKey), eventListener, options)

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      window.removeEventListener(String(eventKey), eventListener, options)
    }
  }, [eventKey, options])
}
/**
 * 모듈별 이벤트 시스템을 생성하는 함수
 * 타입 안전한 emit과 useEventListener를 제공
 *
 * @template M 모듈별 이벤트 맵 타입
 * @returns 타입 안전한 emit과 useEventListener 함수
 */
export function createTypedEventModule<M extends EventMap>() {
  /**
   * 타입 안전한 이벤트 발생 함수
   *
   * @param eventKey 이벤트 키
   * @param payload 이벤트 페이로드
   */
  const typedEmit = <K extends keyof M>(eventKey: K, payload: M[K]): void => {
    return emit<M, K>(eventKey, payload)
  }

  /**
   * 타입 안전한 이벤트 리스너 훅
   *
   * @param eventKey 이벤트 키
   * @param handler 이벤트 핸들러
   * @param options 이벤트 리스너 옵션
   */
  const useTypedListener = <K extends keyof M>(
    eventKey: K,
    handler: (payload: M[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void => {
    return useTypedEventListener<M, K>(eventKey, handler, options)
  }

  return {
    emit: typedEmit,
    useListener: useTypedListener,
  }
}
