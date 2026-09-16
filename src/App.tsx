import { useState } from 'react'
import './App.css'
import MessageBubble from './components/MessageBubble';
import type { Message } from './types';

function App() {
  const [messages, setMessage] = useState<Message[]>([
    {role: 'user', content: 'how to us useState?'},
    {role: 'ai', content: 'It is used to add "variable data to components, such as const[n, setN] = useState(0)'}
  ]);
  const [input, setInput] = useState ('');

  function send(){     //用户输入框按键onClick驱动函数
    setMessage((prev) => [...prev,{role: 'user', content:input.trim()},
      {role: 'ai', content: '我是黄建辉 哦哦耶耶'}
    ]);
    setInput('');
  }

  return (
    <>
      <div className="chat">
        <header className="chat-header">ChatGuopt</header>
        <div className="msgs">
          {messages.map((m, i) => (
              <MessageBubble key={i} message={m} fresh={i === messages.length - 1}/>
          ))}
        </div>
        <div className='chatcard'>
          <input value = {input} onChange={(e) => setInput(e.target.value)} 
          placeholder="please enter the text"/>
          <button onClick = {send} disabled={input.trim() === ''}>Send
          </button>
        </div>
      </div>
    </>
  );
}

export default App
