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
          flashcards: [...folder.flashcards, {
            question: newFlashcard.question,
            answer: newFlashcard.answer.replace(/\n/g, '<br>')
          }],
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    setNewFlashcard({ question: '', answer: '' });
    setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
  };
  

const handleEditFlashcard = (index, updatedFlashcard) => {
  const { question, answer } = updatedFlashcard;
  const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
  const updatedFolders = folders.map((folder) => {
    const updatedFlashcards = folder.flashcards.map((flashcard, i) => {
      if (i === index) {
        return { ...flashcard, question, answer };
      }
      return flashcard;
    });
    return { ...folder, flashcards: updatedFlashcards };
  });
  setFolders(updatedFolders);
  setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
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
    <textarea
      value={modalContent}
      readOnly
      rows={10} // Imposta il numero di righe desiderato
      wrap="soft" // Imposta il wrapping del testo su "soft"
      style={{ 
        width: '100%', // Imposta la larghezza della textarea al 100% del contenitore
        resize: 'none', // Rendi la textarea non ridimensionabile
        fontSize: '16px', // Imposta il carattere a 16px
        fontFamily: 'Arial, sans-serif', // Imposta il tipo di carattere
        lineHeight: '1.6', // Imposta l'altezza della riga per una migliore leggibilità
        padding: '10px', // Aggiungi spaziatura intorno al testo
        height:"650px",
        boxSizing: 'border-box', // Include il padding nella larghezza totale della textarea
      }} 
    />
    <button className="Modal__CloseButton" onClick={() => setShowModal(false)}>Close</button>
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
  const [editableFlashcard, setEditableFlashcard] = useState(null); // Stato per tenere traccia della flashcard aperta per la modifica

  // Funzione per gestire l'apertura della flashcard per la modifica
  const openEditFlashcard = (index, flashcard) => {
    setEditableFlashcard({ index, ...flashcard });
  };

  // Funzione per gestire la chiusura della modalità di modifica
  const closeEditFlashcard = () => {
    setEditableFlashcard(null);
  };

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
              {editableFlashcard && editableFlashcard.index === index ? ( // Se la flashcard è aperta per la modifica, mostra i campi di input
                <FlashcardEditForm
                  flashcard={editableFlashcard}
                  onCancel={closeEditFlashcard}
                  onSave={(updatedFlashcard) => {
                    handleEditFlashcard(index, updatedFlashcard);
                    closeEditFlashcard();
                  }}
                />
              ) : (
                <> 
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
                  <button className='btnedit' onClick={() => openEditFlashcard(index, flashcard)}>Edit</button>
                  <button className='btndelete' onClick={() => handleDeleteFlashcard(index)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
  function FlashcardEditForm({ flashcard, onCancel, onSave }) {
    const [updatedFlashcard, setUpdatedFlashcard] = useState(flashcard);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setUpdatedFlashcard({ ...updatedFlashcard, [name]: value });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(updatedFlashcard);
    };
  
    return (
      <form onSubmit={handleSubmit} className="flashcard-edit-form">
        <div className="form-group">
          <label htmlFor="question">Question:</label>
          <input
            type="text"
            id="question"
            name="question"
            value={updatedFlashcard.question}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="answer">Answer:</label>
          <textarea
            id="answer"
            name="answer"
            value={updatedFlashcard.answer}
            onChange={handleInputChange}
            required
            rows="4"
            style={{ resize: "vertical" }}
          />
        </div>
        <button type="submit" className="btn btn-secondary">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </form>
    );
  }
}

export default App;

