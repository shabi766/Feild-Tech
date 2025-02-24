import { useState, useEffect } from "react";
import axios from "axios";
import { USER_API_END_POINT } from "@/components/utils/constant";

const useChatSearch = (query) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${USER_API_END_POINT}/search-users?query=${query}`, { withCredentials: true });
                setUsers(data || []);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [query]);

    return { users, loading };
};

export default useChatSearch;
