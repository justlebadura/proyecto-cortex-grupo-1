import os
from ultracontext import UltraContext

def main():
    """
    Example of using UltraContext to manage chat application state.
    """
    
    # 1. Initialize the client
    # You can pass the key directly or rely on environment variables if supported.
    # Here we assume a placeholder or env var 'ULTRACONTEXT_API_KEY'
    api_key = os.getenv("ULTRACONTEXT_API_KEY", "uc_live_YOUR_KEY_HERE")
    
    # Initialize the UltraContext client
    uc = UltraContext(api_key=api_key)
    print("1. Client initialized")

    # 2. Create a new context (Chat Session)
    # Think of a 'context' as a conversation thread.
    # We can attach metadata like user_id to query it later.
    try:
        # Note: In a real scenario with a fake key, this will error out, 
        # so we wrap in try/except for specific API calls if running without a valid key.
        context = uc.create(metadata={"session_name": "Support Ticket #42"})
        context_id = context["id"]
        print(f"2. Created new context (session) with ID: {context_id}")

        # 3. Add a User Message
        # The .append() method pushes data to the end of the context list.
        # It is schema-agnostic, but standard {"role": ..., "content": ...} is best for LLMs.
        user_message = {"role": "user", "content": "Hello, how do I reset my password?"}
        uc.append(context_id, user_message)
        print("3. Appended user message")

        # 4. Extract Context for LLM
        # When you need to generate a response, fetch the current state.
        # 'data' contains the list of messages.
        stored_context = uc.get(context_id)
        chat_history = stored_context["data"]
        
        # Example: response = openai.chat.completions.create(model="gpt-4", messages=chat_history)
        print(f"4. Retrieved {len(chat_history)} messages to send to LLM")

        # 5. Append Assistant Response
        # After the LLM generates a response, save it back to the context.
        assistant_response = {"role": "assistant", "content": "You can reset it in the settings page."}
        uc.append(context_id, assistant_response)
        print("5. Appended assistant response")
        
        # 6. Edit/Correction (Context Management)
        # If we need to fix the last message (e.g., retrieval correction), we can update it.
        # Index -1 refers to the last item.
        uc.update(context_id, index=-1, content="You can reset it in the 'Security' tab of settings.")
        print("6. Updated last message with correction")

        # 7. Final History
        final_history = uc.get(context_id)["data"]
        print("\n--- Current Chat History ---")
        for msg in final_history:
            print(f"[{msg.get('role', 'unknown')}]: {msg.get('content', '')}")

    except Exception as e:
        print(f"\n[!] API Error (expected if no valid key provided): {e}")
        print("To run this successfully, set your ULTRACONTEXT_API_KEY.")

if __name__ == "__main__":
    main()
