import { useDebounce } from 'hooks';
import { useChat } from 'context';
import { Search } from 'semantic-ui-react';
import { useState, useRef, useEffect } from 'react';
import { addPerson, getOtherPeople } from 'react-chat-engine';

export const SearchUsers = ({ visible, closeFunc }) => {
  let searchRef = useRef();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceSearchTerm = useDebounce(searchTerm, 500);

  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (visible && searchRef) {
      searchRef.focus();
    }
  }, [visible]);

  const { myChats, setMyChats, chatConfig, selectedChat, setSelectedChat } =
    useChat();

  const selectUser = username => {
    addPerson(chatConfig, selectedChat.id, username, () => {
      const filterChat = myChats.filter(c => c.id !== selectedChat.id);

      const updatedChat = {
        ...selectedChat,
        people: [...selectedChat.people, { person: { username } }],
      };

      setSelectedChat(updatedChat);
      setMyChats([...filterChat, updatedChat]);

      closeFunc();
    });
  };

  useEffect(() => {
    if (debounceSearchTerm) {
      setLoading(true);

      getOtherPeople(chatConfig, selectedChat.id, (chatId, data) => {
        const usernames = Object.keys(data)
          .map(key => data[key].username)
          .filter(u =>
            u.toLowerCase().includes(debounceSearchTerm.toLowerCase()),
          );

        setSearchResults(usernames.map(u => ({ title: u })));
        setLoading(false);
      });
    } else {
      setSearchResults(null);
    }
  }, [chatConfig, selectedChat, debounceSearchTerm]);

  return (
    <div
      className="user-search"
      style={{ display: visible ? 'block' : 'none' }}
    >
      <Search
        fluid
        onBlur={closeFunc}
        loading={loading}
        value={searchTerm}
        results={searchResults}
        placeholder="Search for Users"
        open={!!searchResults && !loading}
        input={{ ref: r => (searchRef = r) }}
        onSearchChange={e => setSearchTerm(e.target.value)}
        onResultSelect={(e, data) => {
          if (data.result?.title) {
            selectUser(data.result.title);
          }
        }}
      />
    </div>
  );
};
