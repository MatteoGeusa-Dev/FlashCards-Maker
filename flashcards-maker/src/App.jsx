import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './App.css';

function App() {
  const [folders, setFolders] = useState(() => {
    const savedFolders = localStorage.getItem('folders');
    return savedFolders ? JSON.parse(savedFolders) : [{ name: 'Non categorizzate', flashcards: [] }];
  });
  const [newFolder, setNewFolder] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(() => {
    const savedSelectedFolder = localStorage.getItem('selectedFolder');
    return savedSelectedFolder ? JSON.parse(savedSelectedFolder) : folders.find(folder => folder.name === 'Non categorizzate');
  });
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '' });
  const [showAnswers, setShowAnswers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('selectedFolder', JSON.stringify(selectedFolder));
  }, [selectedFolder]);

  Modal.setAppElement('#root');

  const handleFolderInputChange = (e) => {
    setNewFolder(e.target.value);
  };

  const handleFlashcardInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlashcard({ ...newFlashcard, [name]: value });
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    setFolders([...folders, { name: newFolder, flashcards: [] }]);
    setNewFolder('');
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
    const updatedFolders = folders.map((folder) => {
      if (folder.name === targetFolderName) {
        return {
          ...folder,
          flashcards: [...folder.flashcards, newFlashcard],
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    setNewFlashcard({ question: '', answer: '' });
    setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
  };

  const handleEditFlashcard = (index) => {
    const updatedFlashcard = prompt("Inserisci la modifica selezionata e dividi la domanda e la risposta con una virgola (es., 'Nuova Domanda, Nuova Risposta'):");
    if (updatedFlashcard) {
      const [updatedQuestion, updatedAnswer] = updatedFlashcard.split(',').map(item => item.trim());
      const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
      const updatedFolders = folders.map((folder) => {
        const updatedFlashcards = folder.flashcards.map((flashcard, i) => {
          if (i === index) {
            return { ...flashcard, question: updatedQuestion, answer: updatedAnswer };
          }
          return flashcard;
        });
        return { ...folder, flashcards: updatedFlashcards };
      });
      setFolders(updatedFolders);
      setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
    }
  };
  
  
  const handleDeleteFlashcard = (index) => {
    const confirmation = window.confirm("Sei sicuro di voler eliminare questa Fleshcard?");
    if (confirmation) {
      const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
      const updatedFolders = folders.map((folder) => {
        const updatedFlashcards = folder.flashcards.filter((flashcard, i) => i !== index);
        return { ...folder, flashcards: updatedFlashcards };
      });
      setFolders(updatedFolders); 
      setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
    }
  };

  const currentFolder = selectedFolder || folders.find(folder => folder.name === 'Non categorizzate');

  const toggleShowAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleToggleIndividualAnswers = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Flashcards Makers by Matteo Geusa</h1>
      </header>
      <main className="App-main">
        <div className="main-content">
          
          <FlashcardList
            flashcards={currentFolder.flashcards}
            showAnswers={showAnswers}
            toggleShowAnswers={toggleShowAnswers}
            handleToggleIndividualAnswers={handleToggleIndividualAnswers}
            handleEditFlashcard={handleEditFlashcard}
            handleDeleteFlashcard={handleDeleteFlashcard}
          />
        </div>
        <div className="sidebar">
          <FlashcardForm
            newFlashcard={newFlashcard}
            onInputChange={handleFlashcardInputChange}
            onSubmit={handleAddFlashcard}
          />
          
          <hr></hr>
          <br></br>
          <br></br>
          <FolderForm
            newFolder={newFolder}
            onInputChange={handleFolderInputChange}
            onSubmit={handleAddFolder}
          />
          <FolderList
            folders={folders}
            onSelectFolder={setSelectedFolder}
            selectedFolder={selectedFolder}
          />
        </div>
      </main>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Flashcard Answer"
      >
        <div>
          <h2>Flashcard Answer</h2>
          <p>{modalContent}</p>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}

function FolderForm({ newFolder, onInputChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="folder-form">
      <div className="form-group">
        <label htmlFor="folderName">Folder Name:</label>
        <input
          type="text"
          id="folderName"
          value={newFolder}
          onChange={onInputChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Folder</button>
    </form>
  );
}

function FolderList({ folders, onSelectFolder, selectedFolder }) {
  return (
    <>
      <h2>Folders</h2>
      <div className="folder-list">
        <ul>
          {folders.map((folder, index) => (
            <li
              key={index}
              onClick={() => onSelectFolder(folder)}
              className={`folder-item ${selectedFolder && selectedFolder.name === folder.name ? 'selected' : ''}`}
            >
              {folder.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function FlashcardForm({ newFlashcard, onInputChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flashcard-form">
      <div className="form-group">
        <label htmlFor="question">Question:</label>
        <input
          type="text"
          id="question"
          name="question"
          value={newFlashcard.question}
          onChange={onInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="answer">Answer:</label>
        <textarea
          id="answer"
          name="answer"
          value={newFlashcard.answer}
          onChange={onInputChange}
          required
          rows="4"
          style={{ resize: "vertical" }}
        />
      </div>
      <button type="submit" className="btn btn-secondary">Add Flashcard</button>
    </form>
  );
}

function FlashcardList({ flashcards, showAnswers, toggleShowAnswers, handleToggleIndividualAnswers, handleEditFlashcard, handleDeleteFlashcard }) {
  const [showIndividualAnswers, setShowIndividualAnswers] = useState(true);
  
  return (
    <>
      <h2>Flashcards</h2>
      <button className='btn btn-primary' onClick={toggleShowAnswers}>
        {showAnswers ? "Hide Answers" : "Show Answers"}
      </button>
      <div className="flashcard-list">
        <ul>
          {flashcards.map((flashcard, index) => (
            <li key={index} className="flashcard-item">
              <strong>Question:</strong> {flashcard.question} <br />
              {!showAnswers && showIndividualAnswers && (
                <button
                  className='btn btn-flesh'
                  onClick={() => handleToggleIndividualAnswers(flashcard.answer)}
                >
                  Show Answer
                </button>
              )}
              {showAnswers && <><br /><strong>Answer:</strong> {flashcard.answer}</>}
              <button className='btnedit' onClick={() => handleEditFlashcard(index)}>Edit</button>
              <button className='btndelete' onClick={() => handleDeleteFlashcard(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;

