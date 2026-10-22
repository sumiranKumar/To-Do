/**
 * ATELIER Store — LocalStorage Data Repository & State Manager
 */

const STORAGE_KEY = 'atelier_tasks_data';
const THEME_KEY = 'atelier_theme_preference';

/**
 * Curated initial sample tasks that match the editorial aesthetic
 */
export const SAMPLE_TASKS = [
  {
    id: 'sample-task-1',
    title: 'Review Q4 architectural design tokens & contrast ratios',
    notes: 'Verify 4.5:1 WCAG compliance on dark editorial mode palette and typography hierarchy.',
    category: 'Work',
    priority: 'urgent',
    dueDate: getRelativeDateString(0), // Today
    isCompleted: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: null
  },
  {
    id: 'sample-task-2',
    title: 'Curate typography pairings for upcoming editorial release',
    notes: 'Examine pairings between Newsreader display weights and clean Plus Jakarta Sans body copy.',
    category: 'Creative',
    priority: 'high',
    dueDate: getRelativeDateString(1), // Tomorrow
    isCompleted: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    completedAt: null
  },
  {
    id: 'sample-task-3',
    title: 'Read chapter 4 of “The Beauty of Everyday Things” by Yanagi',
    notes: 'Note down thoughts on craftsmanship and minimalist design restraint.',
    category: 'Reading',
    priority: 'low',
    dueDate: getRelativeDateString(3),
    isCompleted: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    completedAt: null
  },
  {
    id: 'sample-task-4',
    title: 'Morning 20-minute silent meditation and green tea ritual',
    notes: 'Unplugged from screens before diving into deep focus session.',
    category: 'Health',
    priority: 'medium',
    dueDate: getRelativeDateString(-1),
    isCompleted: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

function getRelativeDateString(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export class TaskStore {
  constructor() {
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved tasks, falling back to sample data.', e);
    }
    // First time visitor: seed sample tasks
    this.saveTasks(SAMPLE_TASKS);
    return [...SAMPLE_TASKS];
  }

  saveTasks(tasks) {
    this.tasks = tasks;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }

  addTask({ title, notes = '', category = 'Work', priority = 'medium', dueDate = '' }) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: title.trim(),
      notes: notes.trim(),
      category: category || 'Work',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      isCompleted: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    const updated = [newTask, ...this.tasks];
    this.saveTasks(updated);
    return newTask;
  }

  updateTask(id, updates) {
    const updated = this.tasks.map(t => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated.find(t => t.id === id);
  }

  toggleTask(id) {
    let target = null;
    const updated = this.tasks.map(t => {
      if (t.id === id) {
        const isCompleted = !t.isCompleted;
        target = {
          ...t,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null
        };
        return target;
      }
      return t;
    });
    this.saveTasks(updated);
    return target;
  }

  togglePin(id) {
    const updated = this.tasks.map(t => {
      if (t.id === id) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated.find(t => t.id === id);
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    const [deleted] = this.tasks.splice(index, 1);
    this.saveTasks(this.tasks);
    return { task: deleted, index };
  }

  restoreTask(task, index = 0) {
    if (!task) return;
    const updated = [...this.tasks];
    updated.splice(Math.min(index, updated.length), 0, task);
    this.saveTasks(updated);
  }

  clearCompleted() {
    const remaining = this.tasks.filter(t => !t.isCompleted);
    this.saveTasks(remaining);
  }

  resetToSample() {
    this.saveTasks([...SAMPLE_TASKS]);
    return this.tasks;
  }

  exportJSON() {
    return JSON.stringify(this.tasks, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.saveTasks(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON file format', e);
    }
    return false;
  }

  // Theme Preference
  getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    // Default system preference check
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }
}
