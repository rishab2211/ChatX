import ChatHeader from './components/chat-header'
import MessageContainer from './components/message-container'
import MessageBar from './components/message-bar'

const ChatContainer = () => {
  return (
    <div className='absolute top-0 h-[100vh] w-[100vw] flex flex-col md:static md:flex-1'>
        <ChatHeader/>
        <MessageContainer/>
        <MessageBar/>
    </div>
  )
}

export default ChatContainer