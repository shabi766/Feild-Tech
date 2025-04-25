// ProviderTabs.jsx
import React from 'react';
import ProviderRequests from "../Providercomps/ProviderRequests";
import ProviderTalentpool from "../Providercomps/ProviderTalentpool";
import ProviderTechnicians from "../Providercomps/ProviderTechnicians";

const ProviderTabs = ({ providerTab, setProviderTab }) => {
    return (
        <div>
            <div className="border-b border-gray-300 mb-4 flex justify-around">
                <button onClick={() => setProviderTab("Requests")} className={`py-2 px-4 ${providerTab === "Requests" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}>
                    Requests
                </button>
                <button onClick={() => setProviderTab("Talentpool")} className={`py-2 px-4 ${providerTab === "Talentpool" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}>
                    Talentpool
                </button>
                <button onClick={() => setProviderTab("Technicians")} className={`py-2 px-4 ${providerTab === "Technicians" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}>
                    Technicians
                </button>
            </div>
            {providerTab === "Requests" && <ProviderRequests />}
            {providerTab === "Talentpool" && <ProviderTalentpool />}
            {providerTab === "Technicians" && <ProviderTechnicians />}
        </div>
    );
};

export default ProviderTabs;