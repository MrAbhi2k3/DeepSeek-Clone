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
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) {
        toast.error("Please sign in to create a new chat");
        return null;
      }

      const token = await getToken();

      const response = await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Clear current selection and refresh chats
        setSelectedChat(null);
        await fetchUsersChats();
        toast.success("New chat created!");
      } else {
        toast.error(response.data.message || "Failed to create new chat");
      }
    } catch (error) {
      console.error("Create chat error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create chat");
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
        console.log("Fetched chats:", data.data);
        setChats(data.data);

        // If the user has no chats, create one
        if (data.data.length === 0) {
          // Don't create auto chat, let user create manually
          setSelectedChat(null);
        } else {
          // Sort chats by updated date
          data.data.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );

          // If no chat is selected or selected chat is deleted, select the most recent
          if (!selectedChat || !data.data.find(chat => chat._id === selectedChat._id)) {
            setSelectedChat(data.data[0]);
            console.log("Selected chat:", data.data[0]);
          }
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
        console.log("Refreshed chat:", data.data);
        
        // Update the specific chat in the chats array
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId ? data.data : chat
          )
        );

        // Update selectedChat if it's the one we refreshed
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(data.data);
        }
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