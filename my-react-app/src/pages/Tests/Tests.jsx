import React, { useState } from 'react';
import './Tests.css';

export default function Tests () {
    const [selectedFile, setSelectedFile] = useState(null);

    const predefinedFiles = [
        //ex: { id: x, name: 'Document x', url: 'https://drive.google.com/file/d/file_id/preview' }, replace file_id with actual file id from google drive
        { id: 1, name: 'Business Management & Administration', url: 'https://drive.google.com/file/d/1XkvwWt0N3ovx1rlQ3UxZlBum3E_7Q-PX/preview' },
        { id: 2, name: 'Business Administration', url: 'https://drive.google.com/file/d/1gycSHrMxJQOMUxukyaHXn-q9mJS7e1bf/preview' },
        { id: 3, name: 'Finance', url: 'https://drive.google.com/file/d/1XlPzPe75QszHsmWxxgCpeyPdzhhcwJI0/preview' },
        { id: 4, name: 'Hospitality & Tourism', url: 'https://drive.google.com/file/d/1oezSfkH877er7EJRCARjY_vTDEVkiu5p/preview' },
        { id: 5, name: 'Marketing', url: 'https://drive.google.com/file/d/1QZH6mnRsMiDND6e68jesAI74wSv4J26L/preview' },
    ];

    return (
        <div className="tests-container">
            <h1>Tests</h1>
            <div className="file-list-section">
                <div className="files-list">
                    {predefinedFiles.map((file) => (
                        <button
                            key={file.id}
                            className={`file-item ${selectedFile?.id === file.id ? 'active' : ''}`}
                            onClick={() => setSelectedFile(file)}>
                            {file.name}
                        </button>
                    ))}
                </div>
            </div>
            {selectedFile && (
                <div className="file-viewer">
                    <h3>{selectedFile.name}</h3>
                    <iframe
                        src={selectedFile.url}
                        title={selectedFile.name}
                        className="file-embed"
                    />
                </div>
            )}
            {selectedFile && (
                <div>
                    <h2>If you'd like to download this file, please click the download button below: </h2>
                    
                    <a href={selectedFile.url.replace('/preview', '/uc?export=download')} download>
                        <button className="download-button">Download {selectedFile.name}</button>
                    </a>
                </div>
            )}
        </div>
    );
}
