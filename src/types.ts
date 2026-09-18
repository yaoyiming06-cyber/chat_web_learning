export type Role = 'user' | 'ai';

export interface Message {
  role: Role;
  content: string;
}

// 一条会话(侧栏里的一项):id = 身份,title = 侧栏显示的名字,messages = 它自己的消息列表
export interface Session {
  id: number;
  title: string;
  messages: Message[];   // ★ 字段名全项目统一用 messages(之前 msg / messages 混用是最大的坑)
}
