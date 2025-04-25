import React, { useRef } from "react";
import { Paperclip } from "lucide-react";

const ChatFileUpload = ({ onUpload }) => {
    const fileInputRef = useRef(null);

    return (
        <div>
            <input type="file" ref={fileInputRef} hidden onChange={(e) => onUpload(e.target.files[0])} />
            <button onClick={() => fileInputRef.current.click()}>
                <Paperclip className="h-5 w-5 text-gray-500 hover:text-blue-500 cursor-pointer" />
            </button>
        </div>
    );
};

export default ChatFileUpload;
