# 이벤트 팩토리 함수: 모듈별 타입 안전한 이벤트 시스템 구축하기

## 문제 상황

기존의 전역 이벤트 시스템에서는 이벤트 키가 늘어날수록 관리가 어려워집니다. 예를 들어 `onClear` 같은 이벤트가 있다면 무엇을 클리어하는지 명확하지 않아 `onShoppingCartClear`, `onShoppingListPageClear` 같이 접두사를 붙여야 합니다. 이러면 결국 각각의 이벤트를 별도로 선언하고 import해서 사용하는 것과 비슷해져서 전역 이벤트 시스템의 장점이 줄어듭니다.

또한 이벤트 맵이 여러 개가 되면 `emit`과 `listen` 함수에서 어떤 이벤트 맵의 페이로드를 사용해야 할지 추론할 수 없는 문제가 발생합니다.

## 해결책: 이벤트 팩토리 패턴

이 문제를 해결하기 위해 **이벤트 팩토리 함수**를 구현했습니다. 각 모듈이나 도메인별로 독립적인 이벤트 시스템을 생성하여 관련 있는 이벤트들을 한 곳에 모아 관리할 수 있습니다.

## 팩토리 함수 구현

```typescript
/**
 * 모듈별 이벤트 시스템을 생성하는 함수
 * 타입 안전한 emit과 useEventListener를 제공
 */
export function createTypedEventModule<M extends EventMap>() {
  const typedEmit = <K extends keyof M>(eventKey: K, payload: M[K]): void => {
    return emit<M, K>(eventKey, payload)
  }

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
```

이 팩토리 함수는 제네릭 타입 `M`을 받아서 해당 이벤트 맵에 특화된 `emit`과 `useListener` 함수를 반환합니다.

## 실제 사용 예시

### 1. 이벤트 맵과 키 정의

```typescript
import { createTypedEventModule, EventMap } from '../createEventModule'

// 페이로드 타입 정의
export type MessageInfo = {
  id: number
  text: string
  timestamp: number
}

export type CounterInfo = {
  value: number
  previousValue: number
}

// 이벤트 키를 Symbol로 정의
export namespace MyEvent {
  export const MESSAGE_SENT = Symbol('MESSAGE_SENT')
  export const COUNTER_CHANGED = Symbol('COUNTER_CHANGED')
}

// 이벤트 맵 정의
export interface TypedMyEventMap extends EventMap {
  [MyEvent.MESSAGE_SENT]: MessageInfo
  [MyEvent.COUNTER_CHANGED]: CounterInfo
}

// 팩토리 함수로 모듈별 이벤트 시스템 생성
export const { emit: myEmit, useListener: useMyEventListener } =
  createTypedEventModule<TypedMyEventMap>()
```

### 2. 이벤트 발생 (Emit)

```typescript
const EventSender: React.FC = () => {
  const [messageText, setMessageText] = useState('')
  const [counter, setCounter] = useState(0)

  // 메시지 전송 이벤트 발생
  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const messagePayload = {
      id: Date.now(),
      text: messageText,
      timestamp: Date.now(),
    }

    // 타입 안전한 이벤트 발생
    myEmit(MyEvent.MESSAGE_SENT, messagePayload)
    setMessageText('')
  }

  // 카운터 변경 이벤트 발생
  const handleChangeCounter = (increment: boolean) => {
    const previousValue = counter
    const newValue = increment ? counter + 1 : counter - 1

    setCounter(newValue)

    const counterPayload = {
      value: newValue,
      previousValue: previousValue,
    }

    // 타입 안전한 이벤트 발생
    myEmit(MyEvent.COUNTER_CHANGED, counterPayload)
  }

  // JSX 생략...
}
```

### 3. 이벤트 수신 (Listen)

```typescript
const EventReceiver: React.FC = () => {
  const [messages, setMessages] = useState<MessageInfo[]>([])
  const [counterHistory, setCounterHistory] = useState<CounterInfo[]>([])

  // 메시지 이벤트 리스너 - 타입 안전하게 페이로드 받음
  useMyEventListener(MyEvent.MESSAGE_SENT, (payload) => {
    // payload는 자동으로 MessageInfo 타입으로 추론됨
    setMessages((prev) => [...prev, payload])
  })

  // 카운터 이벤트 리스너 - 타입 안전하게 페이로드 받음
  useMyEventListener(MyEvent.COUNTER_CHANGED, (payload) => {
    // payload는 자동으로 CounterInfo 타입으로 추론됨
    setCounterHistory((prev) => [...prev, payload])
  })

  // JSX 생략...
}
```

## 팩토리 패턴의 장점

### 1. **모듈별 격리**

각 모듈은 자신만의 독립적인 이벤트 시스템을 가집니다. 다른 모듈의 이벤트와 충돌하지 않으며, 관련 있는 이벤트들만 한 곳에 모아 관리할 수 있습니다.

### 2. **타입 안전성**

팩토리로 생성된 `emit`과 `useListener`는 해당 모듈의 이벤트 맵에만 의존하므로, 컴파일 타임에 이벤트 키와 페이로드 타입이 정확히 매칭되는지 검증할 수 있습니다.

### 3. **명확한 네이밍**

이벤트 키에 접두사를 붙일 필요가 없습니다. `MyEvent.MESSAGE_SENT`처럼 네임스페이스를 활용하여 명확하고 간결한 이름을 사용할 수 있습니다.

### 4. **재사용성**

`createTypedEventModule` 함수는 어떤 이벤트 맵에도 적용할 수 있어, 다양한 모듈에서 일관된 패턴으로 이벤트 시스템을 구축할 수 있습니다.

## 다른 모듈에서의 활용

```typescript
// 쇼핑카트 모듈
interface ShoppingCartEventMap extends EventMap {
  [ShoppingCartEvent.ITEM_ADDED]: { item: CartItem; quantity: number }
  [ShoppingCartEvent.ITEM_REMOVED]: { itemId: string }
  [ShoppingCartEvent.CART_CLEARED]: { prevCartInfo: CartInfo }
}

export const { emit: cartEmit, useListener: useCartListener } =
  createTypedEventModule<ShoppingCartEventMap>()

// 로그인 모듈
interface AuthEventMap extends EventMap {
  [AuthEvent.LOGIN_SUCCESS]: { id: string; name: string }
  [AuthEvent.LOGOUT]: { reason: string }
}

export const { emit: authEmit, useListener: useAuthListener } =
  createTypedEventModule<AuthEventMap>()
```

## 결론

이벤트 팩토리 패턴을 통해 다음과 같은 이점을 얻을 수 있습니다:

- **확장성**: 새로운 모듈마다 독립적인 이벤트 시스템 생성
- **유지보수성**: 관련 이벤트를 모듈별로 그룹화하여 관리
- **타입 안전성**: 컴파일 타임 타입 검증으로 런타임 오류 방지
- **일관성**: 모든 모듈에서 동일한 패턴으로 이벤트 시스템 구현

이벤트가 많아질수록 팩토리 패턴의 장점이 더욱 명확해지며, 대규모 애플리케이션에서도 깔끔하고 관리하기 쉬운 이벤트 시스템을 구축할 수 있습니다.
