import React, { useEffect, useState } from 'react';
import './Tests.css';

export default function Tests () {
    const initialPracticeTests = [
        //ex: { id: x, name: 'Document x', url: 'https://drive.google.com/file/d/file_id/preview' }, replace file_id with actual file id from google drive
        { id: 1, name: 'Business Management & Administration', url: 'https://drive.google.com/file/d/1XkvwWt0N3ovx1rlQ3UxZlBum3E_7Q-PX/preview' },
        { id: 2, name: 'Business Administration', url: 'https://drive.google.com/file/d/1gycSHrMxJQOMUxukyaHXn-q9mJS7e1bf/preview' },
        { id: 3, name: 'Finance', url: 'https://drive.google.com/file/d/1XlPzPe75QszHsmWxxgCpeyPdzhhcwJI0/preview' },
        { id: 4, name: 'Hospitality & Tourism', url: 'https://drive.google.com/file/d/1oezSfkH877er7EJRCARjY_vTDEVkiu5p/preview' },
        { id: 5, name: 'Marketing', url: 'https://drive.google.com/file/d/1QZH6mnRsMiDND6e68jesAI74wSv4J26L/preview' },
    ];

    const [practiceTests, setPracticeTests] = useState(initialPracticeTests);
    const [selectedFile, setSelectedFile] = useState(initialPracticeTests[0]);
    const [editName, setEditName] = useState(initialPracticeTests[0].name);
    const [editUrl, setEditUrl] = useState(initialPracticeTests[0].url);
    const [statusMessage, setStatusMessage] = useState('');

    let user = null;
    try {
        const rawUser = localStorage.getItem('user');
        user = rawUser && rawUser !== 'undefined' ? JSON.parse(rawUser) : null;
    } catch (error) {
        console.warn('Invalid user in localStorage:', error);
    }

    const isSponsor = user?.role === 'teacher' || user?.privileges === 'teacher_override';

    useEffect(() => {
        if (selectedFile) {
            setEditName(selectedFile.name);
            setEditUrl(selectedFile.url);
        }
    }, [selectedFile]);

    const handleSelectFile = (file) => {
        setSelectedFile(file);
    };

    const handleSaveChanges = (event) => {
        event.preventDefault();

        if (!selectedFile) {
            return;
        }

        const updatedFile = {
            ...selectedFile,
            name: editName.trim() || selectedFile.name,
            url: editUrl.trim() || selectedFile.url,
        };

        setPracticeTests((currentTests) => currentTests.map((file) => (
            file.id === selectedFile.id ? updatedFile : file
        )));
        setSelectedFile(updatedFile);
        setStatusMessage('Practice test updated for students.');
    };

    const handleUploadPracticeTest = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const uploadedUrl = URL.createObjectURL(file);
        const uploadedTest = {
            id: Date.now(),
            name: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Practice Test',
            url: uploadedUrl,
        };

        setPracticeTests((currentTests) => [uploadedTest, ...currentTests]);
        setSelectedFile(uploadedTest);
        setStatusMessage('New practice test uploaded and ready for review.');
        event.target.value = '';
    };

    const handleDeleteTest = () => {
        if (!selectedFile) {
            return;
        }

        if (selectedFile.url?.startsWith('blob:')) {
            URL.revokeObjectURL(selectedFile.url);
        }

        setPracticeTests((currentTests) => {
            const remainingTests = currentTests.filter((file) => file.id !== selectedFile.id);
            const nextSelection = remainingTests[0] || null;
            setSelectedFile(nextSelection);

            if (nextSelection) {
                setEditName(nextSelection.name);
                setEditUrl(nextSelection.url);
            } else {
                setEditName('');
                setEditUrl('');
            }

            return remainingTests;
        });

        setStatusMessage('Practice test deleted.');
    };

    const downloadUrl = selectedFile?.url.includes('/file/d/')
        ? selectedFile.url.replace('/file/d/', '/uc?export=download&id=').replace('/preview', '')
        : selectedFile?.url;

    return (
        <div className="tests-container">
            <h1>Tests</h1>

            {isSponsor && (
                <section className="sponsor-panel">
                    <div>
                        <h2>Sponsor controls</h2>
                        <p>Change the selected test, then upload, edit, or delete practice material for the next season.</p>
                    </div>
                    <label htmlFor="practice-test-upload" className="upload-button">
                        Upload practice test
                    </label>
                    <input
                        id="practice-test-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleUploadPracticeTest}
                        className="hidden-input"
                    />
                </section>
            )}

            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <div className="tests-layout">
                <section className="test-list-panel">
                    <h2>Available practice tests</h2>
                    <div className="files-list">
                        {practiceTests.map((file) => (
                            <button
                                key={file.id}
                                className={`file-item ${selectedFile?.id === file.id ? 'active' : ''}`}
                                onClick={() => handleSelectFile(file)}>
                                {file.name}
                            </button>
                        ))}
                    </div>
                </section>

                {isSponsor && (
                    <section className="editor-panel">
                        <h2>Edit selected test</h2>
                        <form className="edit-form" onSubmit={handleSaveChanges}>
                            <label>
                                Test name
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                />
                            </label>
                            <label>
                                Preview or download URL
                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(event) => setEditUrl(event.target.value)}
                                />
                            </label>
                            <div className="edit-actions">
                                <button type="submit" className="save-button">Save changes</button>
                                <button type="button" className="delete-button" onClick={handleDeleteTest}>
                                    Delete test
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>

            {selectedFile && (
                <section className="file-viewer">
                    <h2>{selectedFile.name}</h2>
                    <iframe
                        src={selectedFile.url}
                        title={selectedFile.name}
                        className="file-embed"
                    />
                    <a href={downloadUrl} download className="download-link">
                        <button className="download-button">Download {selectedFile.name}</button>
                    </a>
                </section>
            )}
        </div>
    );
}
