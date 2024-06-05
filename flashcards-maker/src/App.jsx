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
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '', image: '', status: 0 });
  const [showAnswers, setShowAnswers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(null);

  const handlePassed = () => {
    if (currentFlashcardIndex !== null) {
      updateFlashcardStatus(currentFlashcardIndex, 2);
    }
  };

  const handletoRepet = () => {
    if (currentFlashcardIndex !== null) {
      updateFlashcardStatus(currentFlashcardIndex, 1);
    }
  };

  const updateFlashcardStatus = (index, newStatus) => {
    const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
    const updatedFolders = folders.map((folder) => {
      if (folder.name === targetFolderName) {
        return {
          ...folder,
          flashcards: folder.flashcards.map((flashcard, i) => {
            if (i === index) {
              return { ...flashcard, status: newStatus };
            }
            return flashcard;
          }),
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
    setShowModal(false); // Close the modal after updating the status
  };

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

  const handleFolderSelection = (folder) => {
    setCurrentCategory(folder.name); // Imposta la nuova categoria selezionata
    setSelectedFolder(folder); // Imposta la cartella selezionata
  };

  const handleFlashcardInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFlashcard({ ...newFlashcard, image: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setNewFlashcard({ ...newFlashcard, [name]: value });
    }
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
            answer: newFlashcard.answer.replace(/\n/g, '\n'),
            image:newFlashcard.image,
            status: 0 // Set status to 0 for new flashcards
          }],
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    clearImageInput();
    setNewFlashcard({ question: '', answer: '', image: null, status: 0 });
    setSelectedFolder(updatedFolders.find(folder => folder.name === targetFolderName));
  };

  const clearImageInput = () => {
    const imageInput = document.getElementById('image');
    if (imageInput) {
      imageInput.value = ""; // Resetta il campo di input dell'immagine
    }};

  const [currentCategory, setCurrentCategory] = useState(null);


  const handleEditFlashcard = (index, updatedFlashcard) => {
    const { question, answer, image } = updatedFlashcard;
    const targetFolderName = selectedFolder ? selectedFolder.name : 'Non categorizzate';
  
    const updatedFolders = folders.map((folder) => {
      if (folder.name === targetFolderName) {
        const updatedFlashcards = folder.flashcards.map((flashcard, i) => {
          if (i === index) {
            return { ...flashcard, question, answer, image };
          }
          return flashcard;
        });
        return { ...folder, flashcards: updatedFlashcards };
      }
      return folder;
    });
  
    setFolders(updatedFolders);
  
    if (selectedFolder && selectedFolder.name === targetFolderName) {
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

  const handleDeleteFolder = (folderName) => {
    const confirmation = window.confirm(`Sei sicuro di voler eliminare la cartella "${folderName}" e tutte le sue flashcard?`);
    if (confirmation && selectedFolder.name != 'Non categorizzate') {
      const updatedFolders = folders.filter(folder => folder.name !== folderName);
      setFolders(updatedFolders);
      if (selectedFolder && selectedFolder.name === folderName) {
        setSelectedFolder(updatedFolders.find(folder => folder.name === 'Non categorizzate') || null);
      }
    }
  };

  const currentFolder = selectedFolder || folders.find(folder => folder.name === 'Non categorizzate');

  const toggleShowAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleToggleIndividualAnswers = (content, index) => {
    setModalContent(content);
    setCurrentFlashcardIndex(index);
    setShowModal(true);
  };

  const downloadCSV = () => {
    if (!selectedFolder) return; // If no folder is selected, do nothing
  
    const csvContent = "data:text/csv;charset=utf-8," + selectedFolder.flashcards.map(flashcard => {
      const question = flashcard.question.replace(/"/g, '""');
      const answer = flashcard.answer.replace(/"/g, '""').replace(/\n/g, '\n');
      return `[${question}]\n-------------------------\n${answer}\n-------------------------\n\n\n`;
    }).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedFolder.name}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };
  
  


  return (
    <div className="App">
      <header className="App-header">
        <h1>Flashcards Makers by Matteo Geusa</h1>
      </header>
      <main className="App-main">
        <div className="main-content">
        <button className="btn btn-primary" onClick={downloadCSV}>Download CSV</button>
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
          <div className='foldersss'>
            <FolderForm
              newFolder={newFolder}
              onInputChange={handleFolderInputChange}
              onSubmit={handleAddFolder}
            />
            <FolderList
              folders={folders}
              onSelectFolder={handleFolderSelection}
              onDeleteFolder={handleDeleteFolder}
              selectedFolder={selectedFolder}
            />
            
          </div>
          
        </div>
        
      </main>
      <Modal
        className='modalsize'
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Flashcard Answer"
      >
        <div>
          <h2>Risposta Flashcard</h2>
          <textarea
            className="modaltextarea"
            value={modalContent}
            readOnly
            rows={10}
            wrap="soft"
          />
          {currentFlashcardIndex !== null && selectedFolder.flashcards[currentFlashcardIndex].image && (
            <div className="image-preview">
              <img src={selectedFolder.flashcards[currentFlashcardIndex].image} alt="Flashcard Image" />
            </div>
          )}
          <div className='centered'>
            <button className="Modal__CloseButton" onClick={() => setShowModal(false)}>Chiudi</button>
            <button className="Modal__knowButton" onClick={handlePassed}>👍</button>
            <button className="Modal__dontknowButton" onClick={handletoRepet}>❌</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function FolderForm({ newFolder, onInputChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="folder-form">
      <div className="form-group">
        <label htmlFor="folderName">Crea nuova cartella:</label>
        <input
          type="text"
          id="folderName"
          className='inputnamefolder'
          value={newFolder}
          onChange={onInputChange}
          autoComplete='off'
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Aggiungi Cartella</button>
    </form>
  );
}

function FolderList({ folders, onSelectFolder, selectedFolder, onDeleteFolder }) {
  return (
    <>
      <div className="folder-list">
        <h2>Le tue cartelle:</h2>
        <ul>
          {folders.map((folder, index) => (
            <div className='listfolder' key={index}>
              <li
                onClick={() => onSelectFolder(folder)}
                className={`folder-item ${selectedFolder && selectedFolder.name === folder.name ? 'selected' : ''}`}
              >
                <div className='verticalcenter'>{folder.name}</div>
                <button
                  className='btn btn-delete'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the onClick event of the list item from being triggered
                    onDeleteFolder(folder.name);
                  }}
                >
                  Elimina
                </button>
              </li>
            </div>
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
        <label htmlFor="question">Domanda:</label>
        <input
          type="text"
          id="question"
          name="question"
          value={newFlashcard.question}
          onChange={onInputChange}
          autoComplete='off'
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="answer">Risposta:</label>
        <textarea
          id="answer"
          name="answer"
          value={newFlashcard.answer}
          onChange={onInputChange}
          autoComplete='off'
          required
          rows="4"
          style={{ resize: "vertical" }}
        />
      </div>
      <div className="form-group">
        <label htmlFor="image">Immagine:</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={onInputChange}
        />

        {newFlashcard.image && (
          <div className="image-preview">
            <img src={newFlashcard.image} alt="Preview" />
          </div>
        )}
      </div>
      <button type="submit" className="btn btn-secondary">Aggiungi Flashcard</button>
    </form>
  );
}



function FlashcardList({
  flashcards,
  showAnswers,
  handleToggleIndividualAnswers,
  handleEditFlashcard,
  handleDeleteFlashcard,
}) {
  const [showIndividualAnswers, setShowIndividualAnswers] = useState(true);
  const [editableFlashcard, setEditableFlashcard] = useState(null); // State for tracking the flashcard open for editing

  // States for tracking the collapsed status of each section
  const [studyCollapsed, setStudyCollapsed] = useState(false);
  const [reviewCollapsed, setReviewCollapsed] = useState(false);
  const [doneCollapsed, setDoneCollapsed] = useState(false);

  // Function to handle opening the flashcard for editing
  const openEditFlashcard = (index, flashcard) => {
    setEditableFlashcard({ index, ...flashcard });
  };

  // Function to handle closing the edit mode
  const closeEditFlashcard = () => {
    setEditableFlashcard(null);
  };

  // Separate flashcards based on their status
  const studyFlashcards = flashcards.filter((flashcard) => flashcard.status === 0);
  const reviewFlashcards = flashcards.filter((flashcard) => flashcard.status === 1);
  const doneFlashcards = flashcards.filter((flashcard) => flashcard.status === 2);

  return (
    <>
      <h2>Flashcards</h2>
      <div className="flashcard-list">
        <div className="flashcard-section">
          <h3>
            Domande da studiare{' '}
            <button className='buttontransparent' onClick={() => setStudyCollapsed(!studyCollapsed)}>
              {studyCollapsed ? '⬇️ (Espandi)' : '⬆️ (Chiudi)'}
            </button>
          </h3>
          {!studyCollapsed && renderFlashcards(studyFlashcards)}
        </div>
        <div className="flashcard-section">
          <h3>
            Domande da ripetere{' '}
            <button className='buttontransparent' onClick={() => setReviewCollapsed(!reviewCollapsed)}>
              {reviewCollapsed ? '⬇️ (Espandi)' : '⬆️ (Chiudi)'}
            </button>
          </h3>
          {!reviewCollapsed && renderFlashcards(reviewFlashcards)}
        </div>
        <div className="flashcard-section">
          <h3>
            Domande fatte{' '}
            <button className='buttontransparent' onClick={() => setDoneCollapsed(!doneCollapsed)}>
              {doneCollapsed ? '⬇️ (Espandi)' : '⬆️ (Chiudi)'}
            </button>
          </h3>
          {!doneCollapsed && renderFlashcards(doneFlashcards)}
        </div>
      </div>
    </>
  );

  function renderFlashcards(flashcards) {
    return flashcards.length === 0 ? (
      <div className='container_list'>
      <p>Nessuna flashcard presente.</p>
      </div>
    ) : (
      <div className='container_list'>
      <ul>
        {flashcards.map((flashcard, index) => (
          <li key={index} className="flashcard-item">
            {editableFlashcard && editableFlashcard.index === index ? (
              // If the flashcard is open for editing, show the input fields
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
                <div className="centeredfleshcard">
                  <strong>Domanda:</strong> {flashcard.question} <br />
                  <div className="centered">
                    {!showAnswers && showIndividualAnswers && (
                      <button
                        className="btn btn-flesh"
                        onClick={() => handleToggleIndividualAnswers(flashcard.answer, index)}
                      >
                        Mostra Risposta
                      </button>
                    )}
                    {showAnswers && (
                      <>
                        <br />
                        <strong>Risposta:</strong> {flashcard.answer}
                      </>
                    )}
                    <button className="btnedit" onClick={() => openEditFlashcard(index, flashcard)}>
                      Modifica
                    </button>
                    <button className="btndelete" onClick={() => handleDeleteFlashcard(index)}>
                      Cancella
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      </div>
    );
  }

  function FlashcardEditForm({ flashcard, onCancel, onSave }) {
    const [updatedFlashcard, setUpdatedFlashcard] = useState(flashcard);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setUpdatedFlashcard({ ...updatedFlashcard, [name]: value });
    };
  
    const handleImageChange = (e) => {
      const { files } = e.target;
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUpdatedFlashcard({ ...updatedFlashcard, image: reader.result });
        };
        reader.readAsDataURL(files[0]);
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(updatedFlashcard);
    };

    const handleRemoveImage = () => {
      setUpdatedFlashcard({ ...updatedFlashcard, image: '' }); // Rimuove l'immagine
      onRemoveImage(); // Notifica il componente padre della rimozione dell'immagine
    };
  
    return (
      <form onSubmit={handleSubmit} className="flashcard-edit-form">
        <div className="form-group">
          <label htmlFor="question">Domanda:</label>
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
          <label htmlFor="answer">Risposta:</label>
          <textarea
            id="answer"
            name="answer"
            value={updatedFlashcard.answer}
            onChange={handleInputChange}
            required
            rows="4"
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Immagine:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={(e) => handleImageChange(e)}
          />
          {updatedFlashcard.image && (
            <div className="image-preview">
              <img src={updatedFlashcard.image} alt="Preview" />
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-secondary">
          Salva
        </button>
        <button type="button" className="btn btn-delete" onClick={handleRemoveImage}>
          Rimuovi Immagine
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancella
        </button>
      </form>
    );
  }
}  
  


export default App;
