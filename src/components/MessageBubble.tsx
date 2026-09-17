import type { Message } from "../types";

interface MessageBubbleProps{
    message: Message;
    fresh?: boolean;
    typing?: boolean; //判断是否进行流式回答
}

function MessageBubble({message, fresh, typing}: MessageBubbleProps){
    const isUser = message.role === 'user';
    return(
        <div className = {`row ${isUser? 'user': 'ai'} ${fresh? 'fresh': ''}`}>
            <div className = "bubble">{message.content}
                {typing && <span className = 'cursor'></span>}
                </div>
        </div>
    );
}

export default MessageBubble;