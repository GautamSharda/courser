import React from 'react';
import PropTypes from 'prop-types';

const ToolTip = ({ text, children }) => {
    return (
        <div className="relative inline-block">
            {children}
            <div className="absolute bottom-6 right-6 flex justify-center items-center w-16 bg-iowaYellow-500 opacity-0 text-white font-semibold p-2 rounded-md transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                {text}
            </div>
        </div>
    );
};

ToolTip.propTypes = {
    text: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default ToolTip;
