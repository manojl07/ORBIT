import API from "./axios";

/* =========================================
   CONVERSATIONS
========================================= */

// Get the authenticated user's inbox.
export const getConversations = async () => {
  const { data } = await API.get("/conversations");
  return data.data;
};

// Get an existing direct conversation or create one.
export const getOrCreateDirectConversation = async (userId) => {
  const { data } = await API.post(
    `/conversations/direct/${userId}`
  );

  return data.data;
};

/* =========================================
   MESSAGES
========================================= */

// Fetch one page of conversation history.
export const getMessages = async ({
  conversationId,
  cursor = null,
  limit = 30,
}) => {
  const params = { limit };

  if (cursor) {
    params.cursor = cursor;
  }

  const { data } = await API.get(
    `/conversations/${conversationId}/messages`,
    { params }
  );

  return data.data;
};

/* =========================================
   READ STATE
========================================= */

export const markConversationAsRead = async ({
  conversationId,
  messageId,
}) => {
  const { data } = await API.patch(
    `/conversations/${conversationId}/read`,
    { messageId }
  );

  return data.data;
};