import type { Message } from "../types";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps{
    message: Message;
    fresh?: boolean;
    typing?: boolean; //判断是否进行流式回答
}

function MessageBubble({message, fresh, typing}: MessageBubbleProps){
    const isUser = message.role === 'user';
    return(
        <div className = {`row ${isUser? 'user': 'ai'} ${fresh? 'fresh': ''}`}>
            <div className = "bubble">
                {isUser ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
                {typing && <span className = 'cursor'></span>}
                </div>
        </div>
    );
}

export default MessageBubble;