import { useState, useRef, useEffect} from 'react'
import './App.css'
import MessageBubble from './components/MessageBubble';
import type { Message } from './types';
import { fakeStream } from './fakeStream';
import type { Reply } from './Reply';


function App() {
  const [messages, setMessage] = useState<Message[]>([
    {role: 'user', content: 'how to us useState?'},
    {role: 'ai', content: 'It is used to add "variable data to components, such as const[n, setN] = useState(0)'}
  ]);
  const [input, setInput] = useState ('');
  const [streaming, setStreaming] = useState(false);//状态量true时表示正在回答 false表示停止回答
  const stopRef = useRef(false); //控制send函数启停
  const [reply, setReply] = useState<Reply[]>([]);

  //从word.json里fetch数据
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/word/word.json')
    .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then((data: Reply[]) =>setReply(data))
    .catch((err) => console.error('加载回复库失败', err));
  }, [])

  //回答函数 无输入 调用全局变量input
  async function send(){     //用户输入框按键onClick 或 输入框input驱动函数
    const text = input.trim();
    if(text === '' || streaming)return; //正在流时不消除input框文字
    setInput('');
    stopRef.current = false;
    setMessage((prev) => [...prev,{role: 'user', content:text},
      {role: 'ai', content: ''}
    ]);//在数组末尾插入数据
    setStreaming(true);

    const choice = 1 + Math.floor(Math.random() * reply.length); //随机从word.json里取一个回答
    const REPLY = reply.find((reply) => reply.id === choice)?.content ?? '还没有回复';//找对应文本

    for await(const chunk of fakeStream(REPLY)){
      if(stopRef.current)break;
      setMessage((prev) => {//函数式更新 只渲染多出来的部分
        const next = [...prev]; //复制整个message数组
        const last = next[next.length - 1];//取next数组最后一个数据
        next[next.length - 1] = {...last, content:last.content + chunk};//在末尾加上fakeStream中slice的text的字符
        return next;
      })
    }
    setStreaming(false);
  }

  return (
    <>
      <div className="chat">
        <header className="chat-header">ChatGuopt</header>
        <div className="msgs">
          {messages.map((m, i) => (
              <MessageBubble key={i} message={m} fresh={i === messages.length - 2}
              typing = {streaming && i === messages.length - 1 && m.role === 'ai'}
              />
          ))}
        </div>
        <div className='chatcard'>
          <input value = {input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send();}}
           placeholder="please enter the text" />
          {streaming
            ? <button className="stop" onClick={() => stopRef.current = true} >stop</button>//stop按钮 改变stopRef控制send函数启停
            : <button onClick = {send} disabled={input.trim() === ''}>Send
          </button>
          }
        </div>
      </div>
    </>
  );
}

export default App
