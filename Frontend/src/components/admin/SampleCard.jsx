import React from 'react';

const Card = ({ title, value }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-2xl">{value}</p>
        </div>
    );
};

export default Card;
