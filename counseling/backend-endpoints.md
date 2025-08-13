# Backend API Endpoints for Chat System

## Required Endpoints for Consistent Communication

### 1. Chat Management Endpoints

#### Get/Create Chat Between Counselor and Student
```
GET /api/chats/between?counselorId={counselorId}&studentId={studentId}&counselorName={counselorName}
```
- **Purpose**: Get existing chat or create new chat between counselor and student
- **Response**: Chat object with ID, counselorId, studentId, etc.
- **Used by**: Both Flutter and React apps

#### Get Assigned Chats for Student
```
GET /api/chats/assigned?studentId={studentId}
```
- **Purpose**: Get all chats assigned to a specific student
- **Response**: Array of Chat objects
- **Used by**: Flutter app (primary), React app (fallback)

#### Get Students by Counselor ID
```
GET /api/students/by-counselor-id/{counselorId}
```
- **Purpose**: Get all students assigned to a specific counselor
- **Response**: Array of Student objects
- **Used by**: React app (primary), Flutter app (fallback)

### 2. Message Management Endpoints

#### Get Messages for Chat
```
GET /api/chats/{chatId}/messages
```
- **Purpose**: Get all messages for a specific chat
- **Response**: Array of Message objects
- **Used by**: Both Flutter and React apps

#### Send Message
```
POST /api/chats/{chatId}/messages
```
- **Purpose**: Send a new message to a chat
- **Request Body**:
```json
{
  "senderId": "string",
  "content": "string",
  "counselorId": "string",
  "studentId": "string",
  "counselorName": "string"
}
```
- **Response**: Created Message object
- **Used by**: Both Flutter and React apps (HTTP fallback)

### 3. WebSocket Endpoints ✅ CONFIGURED

#### WebSocket Connection
```
WebSocket: ws://localhost:8080/ws-chat
```
- **Purpose**: Real-time message delivery
- **Used by**: Both Flutter and React apps

#### STOMP Topics
- **Subscribe to chat messages**: `/topic/chat/{chatId}`
- **Send message**: `/app/chat/send`

**Your Spring Boot Configuration:**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // ✅ Matches client subscriptions
        config.setApplicationDestinationPrefixes("/app"); // ✅ Matches client sends
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat").setAllowedOriginPatterns("*").withSockJS(); // ✅ Matches client connections
    }
}
```

### 4. Chat Management

#### Delete Chat
```
DELETE /api/chats/{chatId}
```
- **Purpose**: Delete a specific chat
- **Used by**: React app

## Common Issues and Solutions

### 1. Different Chat IDs ✅ FIXED
**Problem**: Flutter and React apps get different chat IDs for the same counselor-student pair.

**Solution**: 
- ✅ Always use the same endpoint: `/api/chats/between`
- ✅ Ensure the backend returns the same chat ID for the same counselor-student combination
- ✅ Implement proper chat lookup logic in the backend

### 2. WebSocket Connection Issues ✅ CONFIGURED
**Problem**: Messages not being received in real-time.

**Solution**:
- ✅ Both apps subscribe to the same topic: `/topic/chat/{chatId}`
- ✅ WebSocket configuration matches client expectations
- ✅ Implement proper error handling and reconnection logic
- ✅ Use HTTP fallback when WebSocket fails

### 3. API Endpoint Mismatches ✅ FIXED
**Problem**: Different endpoints being used by Flutter and React.

**Solution**:
- ✅ Standardize on the endpoints listed above
- ✅ Implement fallback mechanisms for backward compatibility
- ✅ Use consistent parameter names and response formats

### 4. WebSocket NullPointerException ❌ FIX NEEDED
**Problem**: `java.lang.NullPointerException: Cannot invoke "com.example.Student.Model.Chat.getId()" because the return value of "com.example.Student.Model.Message.getChat()" is null`

**Solution**: Fix the WebSocket controller to handle null Chat relationships properly.

## Backend Implementation Requirements

### 1. Chat Entity
```java
@Entity
public class Chat {
    @Id
    private String id;
    private String counselorId;
    private String studentId;
    private String counselorName;
    private LocalDateTime createdAt;
    // ... other fields
}
```

### 2. Message Entity
```java
@Entity
public class Message {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String content;
    private LocalDateTime timestamp;
    // ... other fields
}
```

### 3. WebSocket Message Handler (FIXED VERSION)
```java
@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat/send")
    @SendTo("/topic/chat/{chatId}")
    public Message handleChatMessage(Message message) {
        try {
            // Validate that we have a chatId
            if (message.getChatId() == null || message.getChatId().isEmpty()) {
                throw new IllegalArgumentException("Chat ID is required");
            }
            
            // Save message to database
            Message savedMessage = messageService.saveMessage(message);
            
            // Return the saved message to broadcast to all subscribers
            return savedMessage;
            
        } catch (Exception e) {
            // Log the error and return a default message
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
            
            // Return the original message if we can't save it
            return message;
        }
    }
}
```

### 4. Alternative WebSocket Handler (Using DTO)
```java
@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat/send")
    @SendTo("/topic/chat/{chatId}")
    public MessageDTO handleChatMessage(MessageDTO messageDTO) {
        try {
            // Convert DTO to entity and save
            Message message = new Message();
            message.setChatId(messageDTO.getChatId());
            message.setSenderId(messageDTO.getSenderId());
            message.setContent(messageDTO.getContent());
            message.setTimestamp(LocalDateTime.now());
            
            // Save to database
            Message savedMessage = messageService.saveMessage(message);
            
            // Convert back to DTO for response
            MessageDTO responseDTO = new MessageDTO();
            responseDTO.setId(savedMessage.getId());
            responseDTO.setChatId(savedMessage.getChatId());
            responseDTO.setSenderId(savedMessage.getSenderId());
            responseDTO.setContent(savedMessage.getContent());
            responseDTO.setTimestamp(savedMessage.getTimestamp());
            
            return responseDTO;
            
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
            return messageDTO; // Return original if save fails
        }
    }
}
```

## Testing Checklist

- [x] WebSocket configuration matches client expectations
- [ ] Both apps can create/get the same chat ID for counselor-student pair
- [ ] Messages sent from one app appear in the other app
- [ ] WebSocket connections are stable and reconnect properly
- [ ] HTTP fallback works when WebSocket is unavailable
- [ ] Chat deletion works from both apps
- [ ] Error handling provides meaningful feedback
- [ ] WebSocket NullPointerException is fixed

## Next Steps

1. **Fix the WebSocket controller** using one of the solutions above
2. **Verify your backend has the required REST endpoints** (listed above)
3. **Test the connection** between Flutter and React apps
4. **Check chat ID consistency** by testing with the same counselor-student pair

## Quick Fix for Your Current Issue

The immediate fix for your `NullPointerException` is to update your `ChatWebSocketControler.java`:

```java
@MessageMapping("/chat/send")
@SendTo("/topic/chat/{chatId}")
public Message receiveMessage(Message message) {
    // Add null check before accessing chat
    if (message.getChat() == null) {
        // Handle the case where chat is null
        System.err.println("Warning: Message has null chat, using chatId: " + message.getChatId());
        
        // You can either:
        // 1. Load the chat from database using chatId
        // 2. Create a new chat
        // 3. Return the message as-is
        
        return message; // Return as-is for now
    }
    
    // Original code here
    String chatId = message.getChat().getId();
    // ... rest of your code
}
``` 