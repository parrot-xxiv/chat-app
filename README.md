## Chat App
### Next JS + Pocketbase 

- Add shadcn component: `npx shadcn@latest add button`

current collections:
- users(default)
- direct_messages
	1. sender: RelationField to Users (single relation)  
	2. receiver: RelationField to Users (single relation)  
	3. content: TextField  
	4. timestamp: AutodateField  
- conversations
	1. user1: RelationField to Users (single relation)  
	2. user2: RelationField to Users (single relation)  
	3. last_message: RelationField to Direct Messages (single relation)  
	4. created_at: AutodateField
api rules already set