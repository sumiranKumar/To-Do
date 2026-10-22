/**
 * ATELIER — Application Coordinator & Interactive Controller
 */

import { TaskStore } from './store.js';
import { triggerCelebration } from './confetti.js';

class AtelierApp {
  constructor() {
    this.store = new TaskStore();
    this.currentFilter = 'all'; // 'all' | 'active' | 'completed'
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'created-desc';
    this.deletedTaskBackup = null;
    this.toastTimer = null;

    this.cacheElements();
    this.initTheme();
    this.initClock();
    this.initEventListeners();
    this.render();
  }

  cacheElements() {
    // Header & Meta
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.currentDateEl = document.getElementById('current-date');
    this.currentTimeEl = document.getElementById('current-time');
    this.progressCircle = document.getElementById('progress-circle');
    this.progressPercent = document.getElementById('progress-percent');
    this.completedCount = document.getElementById('completed-count');
    this.totalCount = document.getElementById('total-count');
    this.progressStatusText = document.getElementById('progress-status-text');

    // Composer Form
    this.taskForm = document.getElementById('task-form');
    this.taskTitleInput = document.getElementById('task-title-input');
    this.taskNotesInput = document.getElementById('task-notes-input');
    this.taskCategorySelect = document.getElementById('task-category-select');
    this.taskPrioritySelect = document.getElementById('task-priority-select');
    this.taskDueDateInput = document.getElementById('task-due-date-input');
    this.dateChips = document.querySelectorAll('.date-chip');

    // Toolbar Controls
    this.searchInput = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.sortSelect = document.getElementById('sort-select');
    this.statusTabs = document.querySelectorAll('.status-tab');
    this.categoryPills = document.querySelectorAll('.category-pill');

    // Counts on tabs
    this.tabCountAll = document.getElementById('tab-count-all');
    this.tabCountActive = document.getElementById('tab-count-active');
    this.tabCountCompleted = document.getElementById('tab-count-completed');

    // Task Groups & Lists
    this.pinnedGroup = document.getElementById('pinned-tasks-group');
    this.pinnedList = document.getElementById('pinned-tasks-list');
    this.standardGroup = document.getElementById('standard-tasks-group');
    this.standardHeader = document.getElementById('standard-tasks-header');
    this.standardList = document.getElementById('tasks-list');
    this.completedGroup = document.getElementById('completed-tasks-group');
    this.completedList = document.getElementById('completed-tasks-list');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    this.emptyState = document.getElementById('empty-state');
    this.emptyMessage = document.getElementById('empty-message');

    // Modals
    this.editModal = document.getElementById('edit-modal');
    this.editForm = document.getElementById('edit-task-form');
    this.editId = document.getElementById('edit-task-id');
    this.editTitle = document.getElementById('edit-task-title');
    this.editNotes = document.getElementById('edit-task-notes');
    this.editCategory = document.getElementById('edit-task-category');
    this.editPriority = document.getElementById('edit-task-priority');
    this.editDueDate = document.getElementById('edit-task-due-date');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalCancelBtn = document.getElementById('modal-cancel-btn');

    // Backup & Restore
    this.backupMenuBtn = document.getElementById('backup-menu-btn');
    this.backupModal = document.getElementById('backup-modal');
    this.backupModalCloseBtn = document.getElementById('backup-modal-close-btn');
    this.exportJsonBtn = document.getElementById('export-json-btn');
    this.importJsonFile = document.getElementById('import-json-file');
    this.quickSeedBtn = document.getElementById('quick-seed-btn');

    // Toast
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toast-message');
    this.toastUndoBtn = document.getElementById('toast-undo-btn');
  }

  initTheme() {
    const currentTheme = this.store.getTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);

    this.themeToggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      const nextTheme = active === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      this.store.setTheme(nextTheme);
    });
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      // Formatted Date: "Thursday, Oct 22"
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      // Formatted Time: "2:45 PM"
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });

      if (this.currentDateEl) this.currentDateEl.textContent = dateStr;
      if (this.currentTimeEl) this.currentTimeEl.textContent = timeStr;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  initEventListeners() {
    // Quick Add Form
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.taskTitleInput.value.trim();
      if (!title) return;

      this.store.addTask({
        title,
        notes: this.taskNotesInput.value.trim(),
        category: this.taskCategorySelect.value,
        priority: this.taskPrioritySelect.value,
        dueDate: this.taskDueDateInput.value || null
      });

      this.taskForm.reset();
      this.taskPrioritySelect.value = 'medium';
      this.render();
      this.showToast('Task added to agenda');
    });

    // Quick Date Chips
    this.dateChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const days = parseInt(chip.getAttribute('data-days'), 10);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDate.getDate()).padStart(2, '0');
        this.taskDueDateInput.value = `${yyyy}-${mm}-${dd}`;
      });
    });

    // Search Input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.searchClearBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.render();
    });

    this.searchClearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.searchClearBtn.style.display = 'none';
      this.render();
      this.searchInput.focus();
    });

    // Sort Dropdown
    this.sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.render();
    });

    // Status Tabs (All, Active, Completed)
    this.statusTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.statusTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-status');
        this.render();
      });
    });

    // Category Filter Pills
    this.categoryPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        this.categoryPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentCategory = pill.getAttribute('data-category');
        this.render();
      });
    });

    // Clear All Completed Tasks
    this.clearCompletedBtn.addEventListener('click', () => {
      if (confirm('Clear all completed items from your archive?')) {
        this.store.clearCompleted();
        this.render();
        this.showToast('Completed items cleared');
      }
    });

    // Edit Modal submission
    this.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = this.editId.value;
      const title = this.editTitle.value.trim();
      if (!id || !title) return;

      this.store.updateTask(id, {
        title,
        notes: this.editNotes.value.trim(),
        category: this.editCategory.value,
        priority: this.editPriority.value,
        dueDate: this.editDueDate.value || null
      });

      this.closeModal(this.editModal);
      this.render();
      this.showToast('Task updated');
    });

    this.modalCloseBtn.addEventListener('click', () => this.closeModal(this.editModal));
    this.modalCancelBtn.addEventListener('click', () => this.closeModal(this.editModal));

    // Backup & Export / Import Modals
    this.backupMenuBtn.addEventListener('click', () => this.openModal(this.backupModal));
    this.backupModalCloseBtn.addEventListener('click', () => this.closeModal(this.backupModal));

    this.exportJsonBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.store.exportJSON());
      const downloadAnchor = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `atelier-agenda-${today}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast('Agenda JSON downloaded');
    });

    this.importJsonFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = this.store.importJSON(event.target.result);
        if (success) {
          this.closeModal(this.backupModal);
          this.render();
          this.showToast('Agenda successfully imported');
        } else {
          alert('Could not parse JSON. Please check file format.');
        }
      };
      reader.readAsText(file);
    });

    // Quick Seed sample data reset
    this.quickSeedBtn.addEventListener('click', () => {
      if (confirm('Reset agenda with curated sample editorial tasks?')) {
        this.store.resetToSample();
        this.render();
        this.showToast('Sample agenda restored');
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // '/' to focus search
      if (e.key === '/' && document.activeElement !== this.taskTitleInput && document.activeElement !== this.searchInput && document.activeElement !== this.taskNotesInput) {
        e.preventDefault();
        this.searchInput.focus();
      }
      // 'Escape' to close open modals or blur search
      if (e.key === 'Escape') {
        if (this.editModal.classList.contains('is-open')) {
          this.closeModal(this.editModal);
        } else if (this.backupModal.classList.contains('is-open')) {
          this.closeModal(this.backupModal);
        } else if (document.activeElement === this.searchInput) {
          this.searchInput.blur();
        }
      }
    });

    // Close modal when clicking outside dialog
    [this.editModal, this.backupModal].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Toast Undo Action
    this.toastUndoBtn.addEventListener('click', () => {
      if (this.deletedTaskBackup) {
        this.store.restoreTask(this.deletedTaskBackup.task, this.deletedTaskBackup.index);
        this.deletedTaskBackup = null;
        this.render();
        this.hideToast();
        this.showToast('Task restored');
      }
    });
  }

  openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  showToast(message, allowUndo = false) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.textContent = message;
    this.toastUndoBtn.style.display = allowUndo ? 'inline-block' : 'none';
    this.toast.classList.add('is-visible');

    this.toastTimer = setTimeout(() => {
      this.hideToast();
    }, 4500);
  }

  hideToast() {
    this.toast.classList.remove('is-visible');
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  getFilteredAndSortedTasks() {
    const all = this.store.getAllTasks();

    // Calculate status counts
    const activeCount = all.filter(t => !t.isCompleted).length;
    const completedCount = all.filter(t => t.isCompleted).length;

    this.tabCountAll.textContent = all.length;
    this.tabCountActive.textContent = activeCount;
    this.tabCountCompleted.textContent = completedCount;

    // Filter pipeline
    let filtered = all.filter(task => {
      // Status filter
      if (this.currentFilter === 'active' && task.isCompleted) return false;
      if (this.currentFilter === 'completed' && !task.isCompleted) return false;

      // Category filter
      if (this.currentCategory !== 'all' && task.category !== this.currentCategory) return false;

      // Search Query
      if (this.searchQuery) {
        const query = this.searchQuery;
        const inTitle = task.title.toLowerCase().includes(query);
        const inNotes = task.notes && task.notes.toLowerCase().includes(query);
        const inCategory = task.category.toLowerCase().includes(query);
        if (!inTitle && !inNotes && !inCategory) return false;
      }

      return true;
    });

    // Sorting
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'priority-desc':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);

        case 'due-asc': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }

        case 'alpha-asc':
          return a.title.localeCompare(b.title);

        case 'created-desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return { filtered, total: all.length, active: activeCount, completed: completedCount };
  }

  updateProgressRing(total, completed) {
    const circumference = 2 * Math.PI * 28; // r=28 => ~175.929
    const ratio = total > 0 ? completed / total : 0;
    const percent = Math.round(ratio * 100);

    const offset = circumference - ratio * circumference;
    this.progressCircle.style.strokeDashoffset = offset;
    this.progressPercent.textContent = `${percent}%`;
    this.completedCount.textContent = completed;
    this.totalCount.textContent = total;

    // Editorial status message
    if (total === 0) {
      this.progressStatusText.textContent = 'Awaiting agenda';
    } else if (percent === 100) {
      this.progressStatusText.textContent = 'All intentions fulfilled ✨';
    } else if (percent >= 66) {
      this.progressStatusText.textContent = 'Momentum is strong';
    } else if (percent >= 33) {
      this.progressStatusText.textContent = 'Making steady progress';
    } else {
      this.progressStatusText.textContent = 'Beginning your day';
    }
  }

  render() {
    const { filtered, total, active, completed } = this.getFilteredAndSortedTasks();
    this.updateProgressRing(total, completed);

    // Clear previous lists
    this.pinnedList.innerHTML = '';
    this.standardList.innerHTML = '';
    this.completedList.innerHTML = '';

    if (filtered.length === 0) {
      this.pinnedGroup.style.display = 'none';
      this.standardGroup.style.display = 'none';
      this.completedGroup.style.display = 'none';
      this.emptyState.style.display = 'flex';

      if (this.searchQuery) {
        this.emptyMessage.textContent = `No tasks matching “${this.searchQuery}”.`;
      } else if (this.currentFilter === 'completed') {
        this.emptyMessage.textContent = 'No completed items in your archive yet.';
      } else if (this.currentFilter === 'active') {
        this.emptyMessage.textContent = 'All active items are completed. Enjoy your day!';
      } else {
        this.emptyMessage.textContent = 'Your agenda is pristine. Add a task above to begin.';
      }
      return;
    }

    this.emptyState.style.display = 'none';

    // Partition tasks into:
    // 1. Pinned active tasks
    // 2. Standard active tasks
    // 3. Completed tasks (if filter allows)
    const pinnedTasks = [];
    const standardTasks = [];
    const completedTasks = [];

    filtered.forEach((task) => {
      if (task.isCompleted) {
        completedTasks.push(task);
      } else if (task.isPinned) {
        pinnedTasks.push(task);
      } else {
        standardTasks.push(task);
      }
    });

    // Pinned group
    if (pinnedTasks.length > 0) {
      this.pinnedGroup.style.display = 'flex';
      pinnedTasks.forEach(task => this.pinnedList.appendChild(this.createTaskElement(task)));
    } else {
      this.pinnedGroup.style.display = 'none';
    }

    // Standard group
    if (standardTasks.length > 0) {
      this.standardGroup.style.display = 'flex';
      this.standardHeader.style.display = pinnedTasks.length > 0 ? 'flex' : 'none';
      standardTasks.forEach(task => this.standardList.appendChild(this.createTaskElement(task)));
    } else {
      this.standardGroup.style.display = 'none';
    }

    // Completed group
    if (completedTasks.length > 0) {
      this.completedGroup.style.display = 'flex';
      completedTasks.forEach(task => this.completedList.appendChild(this.createTaskElement(task)));
    } else {
      this.completedGroup.style.display = 'none';
    }
  }

  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-card ${task.isCompleted ? 'is-completed' : ''} ${task.isPinned ? 'is-pinned' : ''}`;
    li.dataset.id = task.id;

    // Priority label mapping
    const prioLabels = {
      urgent: '🔴 Urgent',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🟢 Low'
    };

    // Category class mapping
    const catClasses = {
      Work: 'cat-work',
      Personal: 'cat-personal',
      Creative: 'cat-creative',
      Health: 'cat-health',
      Reading: 'cat-reading'
    };

    // Due date badge formatting
    let dueDateHtml = '';
    if (task.dueDate) {
      const [y, m, d] = task.dueDate.split('-').map(Number);
      const due = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let badgeClass = 'badge-due';
      let label = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (diffDays < 0 && !task.isCompleted) {
        badgeClass += ' is-overdue';
        label = `Overdue (${Math.abs(diffDays)}d)`;
      } else if (diffDays === 0) {
        badgeClass += ' is-today';
        label = 'Today';
      } else if (diffDays === 1) {
        label = 'Tomorrow';
      }

      dueDateHtml = `<span class="badge ${badgeClass}">📅 ${label}</span>`;
    }

    const notesHtml = task.notes ? `<div class="task-notes">${this.escapeHtml(task.notes)}</div>` : '';

    li.innerHTML = `
      <div class="task-checkbox-container">
        <input 
          type="checkbox" 
          class="custom-checkbox" 
          ${task.isCompleted ? 'checked' : ''} 
          aria-label="Mark task as complete"
        >
      </div>

      <div class="task-content">
        <div class="task-headline-row">
          <span class="task-title">${this.escapeHtml(task.title)}</span>
          <div class="task-actions">
            <button type="button" class="action-btn pin-btn ${task.isPinned ? 'pin-active' : ''}" title="${task.isPinned ? 'Unpin task' : 'Pin to top'}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${task.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button type="button" class="action-btn edit-btn" title="Edit task details">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button type="button" class="action-btn delete-btn" title="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        ${notesHtml}

        <div class="task-meta-row">
          <span class="badge badge-category ${catClasses[task.category] || ''}">
            <span class="category-dot"></span>
            ${task.category}
          </span>
          <span class="badge badge-priority prio-${task.priority}">
            ${prioLabels[task.priority] || task.priority}
          </span>
          ${dueDateHtml}
        </div>
      </div>
    `;

    // Bind item events
    const checkbox = li.querySelector('.custom-checkbox');
    checkbox.addEventListener('change', () => {
      const updated = this.store.toggleTask(task.id);
      this.render();

      if (updated && updated.isCompleted) {
        // Check if all active tasks are now finished
        const remaining = this.store.getAllTasks().filter(t => !t.isCompleted);
        if (remaining.length === 0) {
          triggerCelebration();
          this.showToast('All agenda tasks completed! Splendid work. ✨');
        } else {
          this.showToast('Task marked complete');
        }
      }
    });

    const pinBtn = li.querySelector('.pin-btn');
    pinBtn.addEventListener('click', () => {
      this.store.togglePin(task.id);
      this.render();
    });

    const editBtn = li.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
      this.openEditModal(task);
    });

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      const deletedInfo = this.store.deleteTask(task.id);
      if (deletedInfo) {
        this.deletedTaskBackup = deletedInfo;
        this.render();
        this.showToast('Task deleted from agenda', true); // enable undo
      }
    });

    return li;
  }

  openEditModal(task) {
    this.editId.value = task.id;
    this.editTitle.value = task.title;
    this.editNotes.value = task.notes || '';
    this.editCategory.value = task.category || 'Work';
    this.editPriority.value = task.priority || 'medium';
    this.editDueDate.value = task.dueDate || '';

    this.openModal(this.editModal);
    this.editTitle.focus();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate the application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AtelierApp();
});
