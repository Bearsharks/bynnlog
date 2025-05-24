import React, { useState } from 'react';
import {CounterInfo, MessageInfo, myEmit, MyEvent, useMyEventListener } from './myEvent';

// 이벤트 키를 Symbol로 정의
export const MyEventKeys = {
  MESSAGE_SENT: Symbol('MESSAGE_SENT'),
  COUNTER_CHANGED: Symbol('COUNTER_CHANGED')
};


// 이벤트 송신 컴포넌트
const EventSender: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [counter, setCounter] = useState(0);

  // 메시지 전송 이벤트 발생
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const messagePayload = {
      id: Date.now(),
      text: messageText,
      timestamp: Date.now(),
    };
    
    myEmit(MyEvent.MESSAGE_SENT, messagePayload);
    setMessageText('');
  };

  // 카운터 변경 이벤트 발생
  const handleChangeCounter = (increment: boolean) => {
    const previousValue = counter;
    const newValue = increment ? counter + 1 : counter - 1;
    
    setCounter(newValue);
    
    const counterPayload = {
      value: newValue,
      previousValue: previousValue,
    };
    
    myEmit(MyEvent.COUNTER_CHANGED, counterPayload);
  };

  return (
    <div className="event-sender">
      <h3>이벤트 송신기</h3>
      
      <div>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="메시지 입력"
        />
        <button onClick={handleSendMessage}>메시지 전송</button>
      </div>
      
      <div>
        <button onClick={() => handleChangeCounter(false)}>-</button>
        <span>카운터: {counter}</span>
        <button onClick={() => handleChangeCounter(true)}>+</button>
      </div>
    </div>
  );
};

// 이벤트 수신 컴포넌트
const EventReceiver: React.FC = () => {
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [counterHistory, setCounterHistory] = useState<CounterInfo[]>([]);
  const [lastUserAction, setLastUserAction] = useState<string>('없음');

  // 메시지 이벤트 리스너
  useMyEventListener(MyEvent.MESSAGE_SENT, (payload) => {
    setMessages((prev) => [...prev, payload]);
  });

  // 카운터 이벤트 리스너
  useMyEventListener(MyEvent.COUNTER_CHANGED, (payload) => {
    setCounterHistory((prev) => [...prev, payload]);
  });

  return (
    <div className="event-receiver">
      <h3>이벤트 수신기</h3>
      
      <div>
        <h4>수신된 메시지</h4>
        <ul>
          {messages.map((message) => (
            <li key={message.id}>
              {message.text} ({new Date(message.timestamp).toLocaleTimeString()})
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4>카운터 변경 기록</h4>
        <ul>
          {counterHistory.map((record, index) => (
            <li key={index}>
              {record.previousValue} → {record.value}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4>마지막 사용자 액션</h4>
        <pre>{lastUserAction}</pre>
      </div>
    </div>
  );
};

// 메인 컴포넌트
const EventExample: React.FC = () => {
  return (
    <div className="event-example">
      <h2>이벤트 시스템 예제</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <EventSender />
        <EventReceiver />
      </div>
    </div>
  );
};

export default EventExample; 