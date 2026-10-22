# ATELIER — Editorial Task & Agenda

> **Live Demo**: [https://sumirankumar.github.io/To-Do/](https://sumirankumar.github.io/To-Do/)

A luxurious, minimalist, editorial-style To-Do web application inspired by high-end independent publications (*Kinfolk*, *Cereal*) and modern design tools (*Notion*, *Linear*). Built with pure Vanilla web technologies (HTML5, Modern CSS3, and ES6+ Modules) for zero-dependency, ultra-fast performance.

---

## ✨ Features & Design Highlights

- **Editorial Aesthetic & Modern Typography**:
  - Balanced pairing of **Newsreader** (high-editorial display serif) and **Plus Jakarta Sans** (crisp geometric sans-serif for UI legibility).
  - Subtle noise paper grain background overlay for an authentic print-editorial feel.
  - Bespoke color palette: Warm Alabaster (`#F8F7F4`) in Day mode and Deep Basalt (`#0E0F12`) in Night mode.
  - Clean `1px` borders, elegant micro-shadows, and smooth micro-interactions.

- **Dual Editorial Theme (Light & Dark)**:
  - Instant theme switcher in the masthead.
  - Automatically respects OS preference and persists your preference across sessions.

- **Comprehensive Productivity Suite**:
  - **Quick Task Capture**: Title, optional rich notes, category tags, priority levels, and due dates.
  - **Quick Date Chips**: One-click shortcuts for "Today", "Tomorrow", and "Next Week".
  - **Categories / Tags**: Work, Personal, Creative, Wellness, and Reading with distinct editorial accent dots.
  - **Priority System**: Urgent (🔴 Terracotta), High (🟠 Amber), Medium (🟡 Ochre), Low (🟢 Sage).
  - **Due Date Tracker**: Intelligent date calculations highlighting "Today", "Tomorrow", and "Overdue" status.
  - **Pinned Priorities**: Pin critical tasks to a dedicated top section.
  - **Progress Radial Meter**: Live SVG circular progress ring indicating real-time completion percentage and motivational editorial status.
  - **Instant Live Search & Filters**: Search across titles, notes, and tags in real time (`/` key shortcut). Filter by status (`All`, `Active`, `Completed`) and category pills.
  - **Dynamic Sorting**: Sort by Priority (High to Low), Due Date (Earliest first), Recently Added, or Alphabetical.
  - **Celebration Particle System**: Subtle fluttering paper confetti appears when you complete all active intentions.
  - **Undo Action**: Deleting a task presents a sleek floating toast with an instant "Undo" button.
  - **Backup & Portability**: Export your entire agenda as a pristine JSON file or restore from a backup file anytime.
  - **Curated Starter Data**: Comes pre-populated with aesthetic sample tasks, plus a one-click "Reset Sample Data" option.

---

## 🚀 How to Run

### Method 1: Instant Local Server (Recommended)
You can launch the included lightweight server using Node.js:
```bash
npm start
```
or
```bash
node serve.js
```
Then open your browser at:
```
http://localhost:3000
```

### Method 2: Direct File Open
You can also directly open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Enter` | Submit / Add new task from title field |
| `/` | Instant focus on search input |
| `Esc` | Close open modal dialog or blur search |

---

## 📁 Project Structure

```
To-Do/
├── index.html            # Accessible semantic layout & structure
├── css/
│   └── style.css         # Complete editorial design system & responsive styling
├── js/
│   ├── app.js            # Main application coordinator & interaction controller
│   ├── store.js          # State management & LocalStorage persistence repository
│   └── confetti.js       # Minimalist canvas paper-flutter celebration particles
├── assets/
│   └── favicon.svg       # Minimalist monochrome SVG favicon
├── serve.js              # Lightweight ES module static server
├── package.json          # Project metadata & npm start script
└── README.md             # Documentation & guide
```
