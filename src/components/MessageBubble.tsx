import type { Message } from "../types";

interface MessageBubbleProps{
    message: Message;
    fresh?: boolean;
}

function MessageBubble({message, fresh}: MessageBubbleProps){
    const isUser = message.role === 'user';
    return(
        <div className = {`row ${isUser? 'user': 'ai'} ${fresh? 'fresh': ''}`}>
            <div className = "bubble">{message.content}</div>
        </div>
    );
}

export default MessageBubble;