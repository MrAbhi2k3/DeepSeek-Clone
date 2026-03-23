"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const createNewChat = async () => {
    try {
      if (isCreatingChat) return null;

      if (!user) {
        toast.error("Please sign in to create a new chat");
        return null;
      }

      if (selectedChat && selectedChat.name === "New Chat" && (selectedChat.messages?.length || 0) === 0) {
        toast("You already have an empty new chat open");
        return selectedChat;
      }

      setIsCreatingChat(true);

      const token = await getToken();

      const response = await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const createdChat = response.data.data;
        if (createdChat) {
          setChats((prev) => [createdChat, ...prev]);
          setSelectedChat(createdChat);
        } else {
          await fetchUsersChats();
        }

        await fetchUsersChats();
        toast.success("New chat created!");
        return createdChat || null;
      } else {
        toast.error(response.data.message || "Failed to create new chat");
        return null;
      }
    } catch (error) {
      console.error("Create chat error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create chat");
      return null;
    } finally {
      setIsCreatingChat(false);
    }
  };

  const fetchUsersChats = async () => {
    try {
      if (!user) return;

      const token = await getToken();

      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const nextChats = [...data.data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setChats(nextChats);

        if (nextChats.length === 0) {
          setSelectedChat(null);
        } else {
          setSelectedChat((prev) => {
            if (!prev) return nextChats[0];
            const found = nextChats.find((chat) => chat._id === prev._id);
            return found || nextChats[0];
          });
        }
      } else {
        toast.error(data.message || "Failed to fetch chats");
      }
    } catch (error) {
      console.error("Fetch chats error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch chats");
    }
  };

  const refreshChatById = async (chatId) => {
    try {
      if (!user || !chatId) return;

      const token = await getToken();

      const { data } = await axios.get(`/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === chatId ? data.data : chat
          )
        );

        setSelectedChat((prev) => {
          if (!prev || prev._id !== chatId) return prev;
          return data.data;
        });
      }
    } catch (error) {
      console.error("Refresh chat error:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    }
  }, [user]);

  const value = {
    user,
    isLoaded,
    isCreatingChat,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    refreshChatById,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};