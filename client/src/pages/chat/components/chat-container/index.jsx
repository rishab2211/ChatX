import ChatHeader from './components/chat-header'
import MessageContainer from './components/message-container'


const ChatContainer = () => {
  return (
    <div className='absolute top-0 h-[100vh] w-[100vw] flex flex-col md:static md:flex-1'>
        <ChatHeader/>
        <MessageContainer/>
    </div>
  )
}

export default ChatContainer