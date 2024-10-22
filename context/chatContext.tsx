import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

interface ChatContextType {
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <ChatContext.Provider value={{ selectedUser, setSelectedUser }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
