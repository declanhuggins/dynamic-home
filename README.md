# Dynamic Home

A visually rich, dynamic homepage plugin for Obsidian with multiple visual modes.

## Visual Modes

- **Clock & Greeting** — Large clock with time-of-day greeting on a gradient background
- **Random Image** — Full-bleed photo from any image URL (configurable, supports localhost)
- **Image Gallery** — Scrolling masonry grid of images
- **Matrix Rain** — Classic falling characters animation (katakana + latin)
- **Ambient Particles** — Floating connected particle network with customizable colors

## Features

- **Per-mode overlay settings** — Each mode has independent toggles for clock, greeting, search bar, recent files, quick links, and background dimming
- **Vault search** — Search bar that filters your vault files with live results
- **Quick links** — Configurable shortcut buttons to your favorite notes
- **Recent files** — Shows your most recently opened files
- **`.home` file extension** — Appears in the file explorer like any other file, works with the [Homepage](https://github.com/mirnovov/obsidian-homepage) plugin

## Installation

### From Community Plugins (pending approval)

1. Open **Settings → Community Plugins → Browse**
2. Search for "Dynamic Home"
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/declanhuggins/dynamic-home/releases/latest)
2. Create a folder called `dynamic-home` in your vault's `.obsidian/plugins/` directory
3. Place the three files inside it
4. Enable the plugin in **Settings → Community Plugins**

## Usage

1. Click the home icon in the ribbon, or run **"Dynamic Home: Open Dynamic Home"** from the command palette
2. To create a `.home` file (for Homepage plugin integration), run **"Dynamic Home: Create Home file"**
3. Configure visual modes and overlay settings in **Settings → Dynamic Home**

## Homepage Plugin Integration

1. Run the command **"Dynamic Home: Create Home file"** to create `Home.home` in your vault
2. In the Homepage plugin settings, set the filename to `Home`
3. Obsidian will now open your Dynamic Home on startup
