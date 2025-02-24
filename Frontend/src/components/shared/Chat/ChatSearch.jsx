import React, { useState } from "react";
import useChatSearch from "@/components/Hooks/useChatSocket";
import { Search } from "lucide-react";

const ChatSearch = ({ onSelect }) => {
    const [query, setQuery] = useState("");
    const { results, isLoading } = useChatSearch(query);

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search chats or messages..."
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 text-gray-400 h-5 w-5" />
            {query && (
                <ul className="absolute bg-white border mt-1 w-full rounded-md shadow-lg">
                    {isLoading ? (
                        <li className="p-2 text-gray-500">Searching...</li>
                    ) : results.length === 0 ? (
                        <li className="p-2 text-gray-500">No results found</li>
                    ) : (
                        results.map((item) => (
                            <li key={item._id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(item)}>
                                {item.fullname || item.content}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default ChatSearch;
