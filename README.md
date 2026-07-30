# ♟️ TrainerDB Enhanced Experience

A Chrome extension that supercharges [TrainerDB.com](https://trainerdb.com) with four productivity features — helping users compare chess coaches faster, smarter, and more efficiently.

---

## 📌 What This Extension Does

TrainerDB Enhanced Experience adds **4 core features** directly into the TrainerDB interface:

---

### 1. 📊 Trainer Comparison
Save multiple chess coaches with a single click and view them side-by-side in a clean comparison table.

- A **"+ Compare"** button is injected on every trainer card automatically
- Click it to save a trainer to your comparison list
- Click **"Compare All"** inside the popup to open a full-screen comparison modal on the page
- Compares: **Name, Title, Rating, ELO, Students, Specialization**

**Problem it solves:** Users currently open 10+ browser tabs and manually track coach details. This feature reduces that to a few clicks.

---

### 2. ✨ Smart Summary (AI-style Analysis)
Once you've saved trainers, the Smart Summary tab automatically analyzes them and generates insights — no external API required.

- **Overview stats:** Total trainers, Average Rating, Average ELO, Total Students across all saved coaches
- **Key Insights:** Highlights the best-rated, highest ELO, and most experienced trainer
- **Smart Recommendation:** Suggests which trainer to consider based on available data
- **Refresh button:** Re-analyze anytime

**Why no external AI API?** Pure JavaScript analysis means it's instant, completely free, private, and always works — no API keys, no rate limits, no cost.

---

### 3. 📝 Personal Notes
Add private notes to each trainer you're evaluating. Notes are auto-saved and included in all exports.

- Each trainer in your list gets a dedicated notes text area
- Notes save automatically after a 500ms typing pause (debounced)
- Notes persist across sessions using Chrome local storage
- Included in **all export formats** (CSV, JSON, Text)
- Examples: *"Great for beginners"*, *"Expensive but highly rated"*, *"Available weekends only"*

**Problem it solves:** Users forget their impressions of trainers they browsed days earlier. Notes keep those thoughts attached to the right coach.

---

### 4. 📥 Multi-Format Export
Export your full comparison — including notes — in three formats with one click.

| Format | Use Case |
|--------|----------|
| **CSV** | Open in Excel or Google Sheets, sort and filter |
| **JSON** | Structured data for developers or tools |
| **Text** | Simple, readable report to share via email |

All formats include: Name, Title, Rating, ELO, Students, and your personal Notes.

---

## 💡 Why I Built This

### The Real Problem
When a chess academy or parent browses TrainerDB to hire a coach, the typical flow is:

1. Open trainer profile → remember a few things
2. Open another profile → start forgetting the first
3. Eventually have 8–10 tabs open
4. Manually create a spreadsheet or just make a guess

There is **no built-in comparison tool** on TrainerDB. The extension fills that gap entirely.

### Why These 4 Features Specifically

The challenge brief listed example ideas including:
- *"Notes or bookmarks"* → Built as **Personal Notes**
- *"Copy/export visible data"* → Built as **Multi-Format Export**
- *"AI page summarizer"* → Built as **Smart Summary**
- *"Productivity toolbar"* → Built as the **Compare button system**

Rather than implementing one feature, I combined all four into a single cohesive workflow:

> **Browse → Save → Annotate → Analyze → Export → Decide**

### Why No External APIs

I chose not to use OpenAI or similar services because:
- It would require an API key from the user
- It adds latency and potential failure points
- It raises privacy concerns (sending user data externally)
- It costs money

The Smart Summary does 80% of what an AI would — identifying best performers, calculating averages, generating recommendations — using pure JavaScript.

### Why Not Just "Fix Bugs"

Many bugs on TrainerDB (broken login, missing backend routes, broken API endpoints) require server-side fixes. A Chrome extension can only modify what's on the client. Instead of faking fixes, I focused on what I could genuinely deliver: **user productivity features that work 100% client-side**.

---

## 🔧 Installation Steps

### Prerequisites
- Google Chrome (version 88 or later)
- ~10 minutes total

---

### Step 1: Download the Code

**Option A — Clone via Git:**
```bash
git clone https://github.com/shreyabj/Chesslang-Plugin.git
cd Chesslang-Plugin
```

**Option B — Download ZIP (No Git needed):**
1. Go to **https://github.com/shreyabj/Chesslang-Plugin**
2. Click the green **Code** button
3. Click **Download ZIP**
4. Extract the folder to your Desktop

---

### Step 2: Create the Extension Icons

The extension requires three icon files. Follow one of these methods:

**Method A — Favicon Generator (Recommended, ~3 minutes):**
1. Visit [https://favicon.io/favicon-generator/](https://favicon.io/favicon-generator/)
2. Set Text: `♟️`, Background: Gradient, Colors: `#667eea` → `#764ba2`
3. Click **Download**
4. From the downloaded ZIP, rename and move:
   - `android-chrome-192x192.png` → `icons/icon128.png`
   - `favicon-32x32.png` → `icons/icon48.png`
   - `favicon-16x16.png` → `icons/icon16.png`

**Method B — Use Any 3 PNG Images:**
- Any PNG files named `icon16.png`, `icon48.png`, `icon128.png`
- Place them inside the `icons/` folder in the project

---

### Step 3: Load the Extension in Chrome

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** using the toggle in the top-right corner

3. Click **Load unpacked**

4. Select the `Chesslang-Plugin` folder

5. The extension card should appear with no errors and the icon should show in your Chrome toolbar

---

### Step 4: Use It on TrainerDB

1. Visit [https://trainerdb.com](https://trainerdb.com)
2. Browse trainer profiles — you'll see purple **"+ Compare"** buttons injected on trainer cards
3. Click the extension icon in your toolbar to open the popup
4. Use the four tabs: **Compare**, **Summary**, **Notes**, **Export**

---

### Step 5: If You Edit the Code

After any code change:
1. Go to `chrome://extensions/`
2. Find **TrainerDB Enhanced Experience**
3. Click the **reload icon (🔄)**
4. Refresh the TrainerDB tab

---

## 🗂️ Project Structure

```
Chesslang-Plugin/
├── manifest.json       # Extension config (Manifest V3)
├── background.js       # Service worker for message passing
├── content.js          # Injected into TrainerDB pages
├── content.css         # Styles for injected buttons and modals
├── popup.html          # Extension popup UI (4 tabs)
├── popup.js            # Popup logic (render, export, summary)
├── popup.css           # Popup styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 📐 Technical Overview

| Detail | Value |
|--------|-------|
| Manifest Version | V3 (latest Chrome standard) |
| Language | Vanilla JavaScript (ES6+) |
| External Dependencies | **None** |
| Storage | Chrome Local Storage API |
| Bundle Size | ~50KB total |
| Permissions Required | `storage`, `activeTab`, `scripting`, `tabs`, `webNavigation` |

**Architecture decisions:**
- **No framework** — keeps the extension lightweight and fast
- **ES6 Classes** — `TrainerDBEnhancer` class in `content.js` keeps logic modular
- **MutationObserver** — handles dynamically loaded content (React/Vue SPAs)
- **Debounced saves** — notes auto-save after 500ms pause to avoid excessive storage writes
- **XSS protection** — all user-visible strings are escaped via `escapeHtml()`

---

## ⚠️ Assumptions & Limitations

### Assumptions

1. **Trainer cards contain identifiable text patterns** such as "ELO", "students", "Master", or a star rating. The extension uses these patterns to detect and inject compare buttons.

2. **Users browse multiple trainers** before deciding. The comparison feature only adds value if at least 2–3 trainers are saved.

3. **Chrome browser** — the extension is built for Chrome specifically. It may work in Chromium-based browsers (Edge, Brave) but is not tested on them.

### Limitations

1. **Client-side only** — The extension cannot fix server-side issues such as broken API endpoints, missing backend routes, or authentication failures. Those require changes to TrainerDB's codebase.

2. **Data extraction depends on page structure** — Trainer data (ELO, rating, students) is extracted by parsing visible text. If TrainerDB changes their HTML structure or class names, some data fields may stop populating correctly.

3. **No cloud sync** — Saved trainers and notes are stored in Chrome's local storage on your device only. They won't sync across different computers or browser profiles.

4. **Trainer cards must be visible** — The compare buttons only appear on pages that display trainer cards (e.g. homepage, listings). They won't appear on individual profile pages that have a completely different layout.

5. **Export filenames include a timestamp** — Files are named like `trainerdb-comparison-1722340000000.csv`. Custom naming is not yet supported.

6. **Smart Summary requires at least 2 trainers** for meaningful insights. With 1 trainer saved, the stats section will show but comparisons won't have much to say.

---

## 🔮 Possible Future Improvements

- **Keyboard shortcut** — Press `Ctrl+Shift+C` to save the trainer on the current page directly
- **Cloud sync** — Use `chrome.storage.sync` to share comparisons across devices
- **Advanced filters** — Filter saved trainers by ELO range, rating threshold, or availability
- **Price tracking** — Alert users when a trainer updates their hourly rate
- **Real AI integration** — Optional OpenAI/Gemini integration for richer natural-language summaries

---

## 🙏 Acknowledgements

- [TrainerDB](https://trainerdb.com) for building the platform this extension enhances
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/) for Manifest V3 guidance
- The chess community for the inspiration

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built for the TrainerDB Internship Technical Challenge — July 2026*
