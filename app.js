// Get elements from the DOM

const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesContainer = document.getElementById("notesContainer");

// Load notes from local storage on page load
document.addEventListener("DOMContentLoaded", loadNotes);

// Add a new note
addNoteBtn.addEventListener("click", () => {
    const noteText = noteInput.value.trim();

    if (noteText === "") {
        alert("Please enter a note!");
        return;
    }

    createNoteElement(noteText);
    saveNoteToLocal(noteText);
    noteInput.value = ""; // Clear the input field
});

// Create a note element
function createNoteElement(noteText) {
    const note = document.createElement("div");
    note.className = "note";

    const noteContent = document.createElement("div");
    noteContent.className = "note-content";
    noteContent.textContent = noteText;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "note-buttons";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    editBtn.addEventListener("click", () => {
        const newText = prompt("Edit your note:", noteContent.textContent);
        if (newText !== null && newText.trim() !== "") {
            updateNoteInLocal(noteContent.textContent, newText);
            noteContent.textContent = newText;
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
        note.remove();
        deleteNoteFromLocal(noteContent.textContent);
    });

    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(deleteBtn);
    note.appendChild(noteContent);
    note.appendChild(buttonsContainer);
    notesContainer.appendChild(note);
}

// Save a note to local storage
function saveNoteToLocal(noteText) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push(noteText);
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Load notes from local storage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.forEach((note) => {
        createNoteElement(note);
    });
}

// Delete a note from local storage
function deleteNoteFromLocal(noteText) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const updatedNotes = notes.filter((note) => note !== noteText);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
}

// Update a note in local storage
function updateNoteInLocal(oldText, newText) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteIndex = notes.indexOf(oldText);
    if (noteIndex !== -1) {
        notes[noteIndex] = newText;
        localStorage.setItem("notes", JSON.stringify(notes));
    }
}
// Get the "Get Suggestion" button
const getSuggestionBtn = document.getElementById("getSuggestionBtn");

// Add event listener to the suggestion button
getSuggestionBtn.addEventListener("click", async () => {
    const noteText = noteInput.value.trim();
    if (noteText === "") {
        alert("Please write something in the note before getting a suggestion!");
        return;
    }

    try {
        // Call the LLM API for suggestions
        const suggestion = await getLLMSuggestion(noteText);
        noteInput.value += `\n\nSuggestion: ${suggestion}`;
    } catch (error) {
        console.error("Error getting suggestion:", error);
        alert("Failed to fetch suggestion. Please try again.");
    }
});
async function getLLMSuggestion(promptText) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    const API_KEY = "AIzaSyB_lnlab_oeImXFr31Vtcqlm7I6jCb3jP4"; // Replace with your actual API key

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: {
                    text: promptText, // The prompt for the model
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Log the full response to inspect its structure
        console.log("API Response:", data);

        // Check if the response contains the expected 'candidates' array and 'output'
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].output; // Extract the response text
        } else {
            console.error("No candidates found in the response.");
            return null;
        }
    } catch (error) {
        console.error("Error generating text:", error);
        return null;
    }
}
