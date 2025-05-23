import ChatInterface from "@/components/chat-interface";
import ProtectedRoute from "@/components/protected-route";

export default function ChatPage() {
  return <ProtectedRoute> 
    <ChatInterface />
  </ProtectedRoute>;
}
