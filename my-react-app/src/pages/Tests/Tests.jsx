import React, { useState } from 'react';

export default function Tests() {
    const [selectedFile, setSelectedFile] = useState(null);

    const predefinedFiles = [
        //ex: { id: x, name: 'Document x', url: 'https://drive.google.com/file/d/file_id/preview' }, replace file_id with actual file id from google drive
        { id: 1, name: 'Business Management & Administration', url: 'https://drive.google.com/file/d/1XkvwWt0N3ovx1rlQ3UxZlBum3E_7Q-PX/preview' },
        { id: 2, name: 'Document 2', url: 'https://drive.google.com/file/d/file_id/preview' },
        { id: 3, name: 'Document 3', url: 'https://drive.google.com/file/d/file_id/preview' },
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
        </div>
    );
}
