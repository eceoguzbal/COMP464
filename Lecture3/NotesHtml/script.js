// script.js

class NotesApp {
  constructor() {
    this.notes = this.loadNotes();
    this.currentNoteId = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showHomePage();
    this.renderNotes();
  }

  // Local Storage
  loadNotes() {
    const savedNotes = localStorage.getItem('thinkboard-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  }

  saveNotes() {
    localStorage.setItem('thinkboard-notes', JSON.stringify(this.notes));
  }

  // Utility functions
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Toast Notifications
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

    toast.innerHTML = `
      <div class="toast-content">
        <i class="toast-icon ${icon}"></i>
        <span class="toast-message">${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // CRUD Operations
  createNote(title, content) {
    const newNote = {
      id: this.generateId(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    this.saveNotes();
    this.showToast("Note created successfully!");
    this.showHomePage();
  }

  updateNote(noteId, title, content) {
    const noteIndex = this.notes.findIndex(n => n.id === noteId);

    if (noteIndex !== -1) {
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date().toISOString()
      };

      this.saveNotes();
      this.showToast("Note updated successfully!");
      this.showHomePage();
    }
  }

  deleteNote(noteId) {
    if (confirm("Are you sure you want to delete this note?")) {
      this.notes = this.notes.filter(n => n.id !== noteId);
      this.saveNotes();
      this.showToast("Note deleted successfully!");
      this.showHomePage();
    }
  }

  // Page Navigation
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
  }

  showHomePage() {
    this.showPage('homePage');
    this.renderNotes();
  }

  showCreatePage() {
    this.showPage('createPage');
    this.clearCreateForm();
  }

  showNoteDetailPage(noteId) {
    this.currentNoteId = noteId;
    const note = this.notes.find(n => n.id === noteId);

    if (note) {
      document.getElementById('editNoteTitle').value = note.title;
      document.getElementById('editNoteContent').value = note.content;
      this.showPage('noteDetailPage');
    }
  }

  // Form Handling
  clearCreateForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
  }

  // Event Listeners
  renderNotes() {
    const notesGrid = document.getElementById('notesGrid');
    const notesNotFound = document.getElementById('notesNotFound');
    const loadingMessage = document.getElementById('loadingMessage');

    // Show loading
    loadingMessage.style.display = 'block';
    notesGrid.style.display = 'none';
    notesNotFound.style.display = 'none';

    setTimeout(() => {
      loadingMessage.style.display = 'none';

      if (this.notes.length === 0) {
        notesNotFound.style.display = 'flex';
      } else {
        notesGrid.style.display = 'grid';
        this.renderNotesGrid();
      }
    }, 500);
  }

  renderNotesGrid() {
    const notesGrid = document.getElementById('notesGrid');

    notesGrid.innerHTML = this.notes.map(note => `
      <div class="note-card" onclick="app.showNoteDetailPage('${note.id}')">
        <h3 class="note-card-title">${this.escapeHtml(note.title)}</h3>
        <p class="note-card-content">${this.escapeHtml(note.content)}</p>
        <div class="note-card-footer">
          <span class="note-date">${this.formatDate(note.createdAt)}</span>
          <div class="note-actions">
            <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation(); app.showNoteDetailPage('${note.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-ghost btn-xs text-error" onclick="event.stopPropagation(); app.deleteNote('${note.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Helpers
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Events
  setupEventListeners() {
    document.getElementById('createNoteForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateNote();
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
      this.handleSaveNote();
    });
  }

  // Handlers
  handleCreateNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    if (!title.trim() || !content.trim()) {
      this.showToast("Please fill in all fields!", "error");
      return;
    }
    this.createNote(title, content);
  }

  handleSaveNote() {
    if (!this.currentNoteId) return;
    const title = document.getElementById('editNoteTitle').value;
    const content = document.getElementById('editNoteContent').value;
    if (!title.trim() || !content.trim()) {
      this.showToast("Please provide both title and content!", "error");
      return;
    }
    this.updateNote(this.currentNoteId, title, content);
  }

  deleteCurrentNote() {
    if (this.currentNoteId) {
      this.deleteNote(this.currentNoteId);
    }
  }
}

// Global functions
function showHomePage() {
  app.showHomePage();
}

function showCreatePage() {
  app.showCreatePage();
}

function deleteCurrentNote() {
  app.deleteCurrentNote();
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new NotesApp();

  // Add sample notes (for first launch)
  const savedNotes = localStorage.getItem('thinkboard-notes');
  if (!savedNotes || JSON.parse(savedNotes).length === 0) {
    const sampleNotes = [
      {
        id: 'sample1',
        title: 'Welcome!',
        content: 'Welcome to ThinkBoard note-taking app. You can delete or edit this sample note.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sample2',
        title: 'How to use?',
        content: 'Click the "New Note" button to create a new note. Click on existing notes to edit them. Use the trash icon to delete.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem('thinkboard-notes', JSON.stringify(sampleNotes));
    app.notes = sampleNotes;
    app.renderNotes();
  }
});
