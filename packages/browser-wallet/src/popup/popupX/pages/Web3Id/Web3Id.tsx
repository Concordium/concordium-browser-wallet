import React from 'react';
import File from '@assets/svgX/file.svg';
import FolderOpen from '@assets/svgX/folder-open.svg';

export default function Web3Id() {
    return (
        <div className="web-id-container">
            <div className="web-id__title">
                <span className="heading_medium">Import Web3 ID Credentials</span>
            </div>
            <div className="web-id__drop-area">
                <File />
                <span className="capture__main_small">Drag and drop here</span>
                <span className="capture__main_small">your Credentials file here</span>
            </div>
            <div className="web-id__file-select">
                <FolderOpen />
                <span className="label__main">or Select file to import</span>
            </div>
        </div>
    );
}
