import { createTypedEventModule, EventMap } from "../createEventModule";

export type MessageInfo = {
  id: number;
  text: string;
  timestamp: number;
};

export type CounterInfo = {
  value: number;
  previousValue: number;
};

export namespace MyEvent {
  export const MESSAGE_SENT = Symbol("MESSAGE_SENT");
  export const COUNTER_CHANGED = Symbol("COUNTER_CHANGED");
}

export interface TypedMyEventMap extends EventMap {
  [MyEvent.MESSAGE_SENT]: MessageInfo;
  [MyEvent.COUNTER_CHANGED]: CounterInfo;
}

export const { emit: myEmit, useListener: useMyEventListener } =
  createTypedEventModule<TypedMyEventMap>("myEvent");
