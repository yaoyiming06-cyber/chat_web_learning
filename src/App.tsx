import { useEffect, useRef, useState } from 'react'
import './App.css'
import MessageBubble from './components/MessageBubble';
import type { Session } from './types';
import { fakeStream } from './fakeStream';
import type { Reply } from './Reply';

function App() {
  const [input, setInput] = useState('');                                    // 输入框里的文字
  const [streaming, setStreaming] = useState(false);                         // true = 正在流式回答
  const [reply, setReply] = useState<Reply[]>([]);                           // 从 word.json 拿到的回复库
  // ★ 会话列表:初始必须给一条,否则 active 找不到 → 发消息时 map 里没有任何一项匹配 → 什么都不发生
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, title: '新对话', messages: [] },
  ]);
  const [activeId, setActiveId] = useState(1);                               // 当前选中哪条会话(必须是 state:改了要重画)

  const stopRef = useRef(false);                                             // 停止标记(必须是 ref:正在跑的循环要读它)

  // ★ 派生值:当前会话 + 当前要显示的消息(不是 state,每次渲染现算)
  const active = sessions.find((s) => s.id === activeId);
  const messages = active?.messages ?? [];                                   // 找不到就给空数组,兜住 undefined

  // 从 word.json 里 fetch 回复库
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + '/word/word.json')
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then((data: Reply[]) => setReply(data))
      .catch((err) => console.error('加载回复库失败', err));
  }, [])

  async function send() {
    const text = input.trim();
    if (text === '' || streaming) return;     // 空输入 / 正在流式 → 不发
    setInput('');
    stopRef.current = false;                  // 新一轮开始,重置停止标记
    setStreaming(true);

    const myId = activeId;                    // ★ 记住"这条消息属于哪条会话"(流式期间用户切走也不会串台)

    setSessions((prev) =>                     // ① 追加:用户消息 + 空的 AI 占位
      prev.map((s) => {
        if (s.id !== myId) return s;          //    不是当前会话 → 原样返回(引用不变,不重渲染)
        return {
          ...s,
          title: s.messages.length === 0 ? text.slice(0, 12) : s.title,   // 第一条消息的前 12 字当标题
          messages: [...s.messages, { role: 'user', content: text }, { role: 'ai', content: '' }],
        };
      })
    );

    const choice = 1 + Math.floor(Math.random() * reply.length);                        // 随机挑一条回复
    const REPLY = reply.find((r) => r.id === choice)?.content ?? '还没有回复';

    for await (const chunk of fakeStream(REPLY)) {
      if (stopRef.current) break;             // 用户点了停止 → 立刻退出循环
      setSessions((prev) =>                   // ② 流式:只改 myId 那条会话的最后一条消息
        prev.map((s) => {
          if (s.id !== myId) return s;
          const msgs = [...s.messages];                                   // 复制数组(不改原数组)
          const last = msgs[msgs.length - 1];
          msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
          return { ...s, messages: msgs };                                // 造新 session 对象
        })
      );
    }
    setStreaming(false);
  }

  function newSession() {
    const id = Date.now();                    // ★ 用时间戳当身份:不会和已有 id 重复
    setSessions((prev) => [
      { id, title: '新对话', messages: [] },   // ★ 插到最前面;要用 ...prev 保留已有会话(之前把整个列表覆盖掉了)
      ...prev,
    ]);
    setActiveId(id);                          // ★ 并立刻切到新会话(用同一个局部变量 id,别用 activeId)
  }

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <h3>Conversation</h3>
        <button className="new" onClick={newSession}>＋ 新对话</button>
        <div className='sessions'>
          {sessions.map((s) => (
            <div
              key={s.id}                                        // key 用身份,不用下标
              className={`session ${s.id === activeId ? 'active' : ''}`}   // 选中态高亮
              onClick={() => setActiveId(s.id)}                 // 点一下切会话
            >
              <div className='s-title'>{s.title}</div>
              <div className='s-preview'>
                {s.messages[s.messages.length - 1]?.content.slice(0, 18) ?? '还没有消息'}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="chat">
        <header className="chat-header">ChatGuopt</header>
        <div className="msgs">
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              fresh={m.role === 'user' && i === messages.length - 2}          // 最新那条用户消息播入场动画
              typing={streaming && i === messages.length - 1 && m.role === 'ai'}
            />
          ))}
        </div>
        <div className='chatcard'>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="please enter the text" />
          {streaming
            ? <button className="stop" onClick={() => { stopRef.current = true; }}>stop</button>
            : <button onClick={send} disabled={input.trim() === ''}>Send</button>
          }
        </div>
      </div>
    </div>
  );
}

export default App
