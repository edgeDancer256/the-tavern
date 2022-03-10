import { createContext, useState, useEffect, useContext } from 'react';
import { fb } from 'service';
import { deleteChat, getMessages, leaveChat, newChat } from 'react-chat-engine';

export const ChatContext = createContext();

export const ChatProvider = ({ children, authUser }) => {
  const [myChats, setMyChats] = useState();
  const [chatConfig, setChatConfig] = useState();
  const [selectedChat, setSelectedChat] = useState();

  //Creating a chat
  const createChatClick = () => {
    newChat(chatConfig, { title: '1' });
  };

  //
  const deleteChatClick = chat => {
    const isAdmin = chat.admin.username === chatConfig.userName;

    if (isAdmin) {
      if (window.confirm('Are you sure you want to delete this chat?')) {
        deleteChat(chatConfig, chat.id);
      }
    } else if (window.confirm('Are you sure you want to leave this chat?')) {
      leaveChat(chatConfig, chat.id, chatConfig.userName);
    }

    // if (
    //   isAdmin &&
    //   window.confirm('Are you sure you want to delete this chat?')
    // ) {
    //   deleteChat(chatConfig, chat.id);
    // } else if (window.confirm('Are you sure you want to leave this chat?')) {
    //   leaveChat(chatConfig, chat.id, chatConfig.userName);
    // }
  };

  //
  const selectChatClick = chat => {
    getMessages(chatConfig, chat.id, messages => {
      setSelectedChat({
        ...chat,
        messages,
      });
    });
  };

  //
  useEffect(() => {
    if (authUser) {
      fb.firestore
        .collection('chatUsers')
        .doc(authUser.uid)
        .onSnapshot(snap => {
          setChatConfig({
            userSecret: authUser.uid,
            avatar: snap.data().avatar,
            userName: snap.data().userName,
            projectID: '01111800-fcef-4871-8c2a-9152f55e501f',
          });
        });
    }
  }, [authUser]);

  //
  return (
    <ChatContext.Provider
      value={{
        myChats,
        setMyChats,
        chatConfig,
        selectedChat,
        setChatConfig,
        setSelectedChat,
        selectChatClick,
        deleteChatClick,
        createChatClick,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

//
export const useChat = () => {
  const {
    myChats,
    setMyChats,
    chatConfig,
    selectedChat,
    setChatConfig,
    setSelectedChat,
    selectChatClick,
    deleteChatClick,
    createChatClick,
  } = useContext(ChatContext);

  return {
    myChats,
    setMyChats,
    chatConfig,
    selectedChat,
    setChatConfig,
    setSelectedChat,
    selectChatClick,
    deleteChatClick,
    createChatClick,
  };
};
