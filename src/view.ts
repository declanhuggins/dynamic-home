import { TextFileView, WorkspaceLeaf, TFile } from 'obsidian';
import type DynamicHomePlugin from '../main';
import { ModeRenderer, VisualMode, getOverlayForMode } from './types';
import { RandomImageRenderer } from './modes/random-image';
import { ImageGalleryRenderer } from './modes/image-gallery';
import { MatrixRainRenderer } from './modes/matrix-rain';
import { ClockGreetingRenderer } from './modes/clock-greeting';
import { AmbientParticlesRenderer } from './modes/ambient-particles';

export const VIEW_TYPE_DYNAMIC_HOME = 'dynamic-home-view';
export const DYNAMIC_HOME_EXTENSION = 'home';

export class DynamicHomeView extends TextFileView {
	plugin: DynamicHomePlugin;
	private currentRenderer: ModeRenderer | null = null;
	private clockIntervalId: number | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: DynamicHomePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_DYNAMIC_HOME;
	}

	getDisplayText(): string {
		if (this.file) {
			return this.file.basename;
		}
		return 'Home';
	}

	getIcon(): string {
		return 'home';
	}

	getViewData(): string {
		return '';
	}

	setViewData(data: string, clear: boolean): void {
		if (clear) {
			this.clear();
		}
		this.buildView();
	}

	clear(): void {
		this.destroyCurrentMode();
		if (this.clockIntervalId !== null) {
			window.clearInterval(this.clockIntervalId);
			this.clockIntervalId = null;
		}
		this.contentEl.empty();
	}

	async onClose(): Promise<void> {
		this.destroyCurrentMode();
		if (this.clockIntervalId !== null) {
			window.clearInterval(this.clockIntervalId);
			this.clockIntervalId = null;
		}
	}

	refresh(): void {
		this.clear();
		this.buildView();
	}

	private buildView(): void {
		const contentEl = this.contentEl;
		contentEl.empty();
		contentEl.addClass('dh-root');

		const settings = this.plugin.settings;
		const overlay = getOverlayForMode(settings, settings.visualMode);
		const isClockMode = settings.visualMode === VisualMode.ClockGreeting;

		const container = contentEl.createDiv({ cls: 'dh-container' });
		container.style.setProperty('--dh-accent', settings.accentColor);

		if (isClockMode) {
			container.addClass('dh-mode-clock');
		}

		// Background layer for mode renderer
		const bgEl = container.createDiv({ cls: 'dh-background' });
		if (overlay.dimBackground) {
			bgEl.addClass('dh-background-dim');
		}

		// Determine if we need an overlay at all
		const hasOverlayContent = overlay.showClock || overlay.showGreeting ||
			overlay.showSearch || overlay.showRecentFiles ||
			(overlay.showQuickLinks && settings.quickLinks.length > 0);

		if (hasOverlayContent) {
			const overlayEl = container.createDiv({ cls: 'dh-overlay' });
			const overlayContent = overlayEl.createDiv({ cls: 'dh-overlay-content' });
			this.buildOverlay(overlayContent, settings, overlay, isClockMode);
		}

		// Initialize background mode renderer
		this.initMode(bgEl);
	}

	private buildOverlay(
		parent: HTMLElement,
		settings: typeof this.plugin.settings,
		overlay: ReturnType<typeof getOverlayForMode>,
		isClockMode: boolean,
	): void {
		// Clock & Greeting
		if (overlay.showClock || overlay.showGreeting) {
			const clockSection = parent.createDiv({ cls: 'dh-overlay-clock' });

			const timeEl = overlay.showClock
				? clockSection.createDiv({
					cls: isClockMode ? 'dh-overlay-time dh-overlay-time-large' : 'dh-overlay-time',
				})
				: null;

			const secondsEl = overlay.showClock && isClockMode
				? clockSection.createDiv({ cls: 'dh-overlay-seconds' })
				: null;

			const greetingEl = overlay.showGreeting
				? clockSection.createDiv({
					cls: isClockMode ? 'dh-overlay-greeting-text dh-overlay-greeting-large' : 'dh-overlay-greeting-text',
				})
				: null;

			const dateEl = (overlay.showClock || overlay.showGreeting)
				? clockSection.createDiv({ cls: 'dh-overlay-date' })
				: null;

			const updateClock = () => {
				const now = new Date();

				if (timeEl) {
					const hours = now.getHours().toString().padStart(2, '0');
					const minutes = now.getMinutes().toString().padStart(2, '0');
					timeEl.textContent = `${hours}:${minutes}`;
				}

				if (secondsEl) {
					secondsEl.textContent = now.getSeconds().toString().padStart(2, '0');
				}

				if (dateEl) {
					dateEl.textContent = now.toLocaleDateString('en-US', {
						weekday: 'long',
						month: 'long',
						day: 'numeric',
						year: isClockMode ? 'numeric' : undefined,
					});
				}

				if (greetingEl) {
					const hour = now.getHours();
					let greeting: string;
					if (hour < 5) greeting = 'Good night';
					else if (hour < 12) greeting = 'Good morning';
					else if (hour < 17) greeting = 'Good afternoon';
					else if (hour < 21) greeting = 'Good evening';
					else greeting = 'Good night';
					greetingEl.textContent = `${greeting}, ${settings.greetingName}`;
				}
			};
			updateClock();
			this.clockIntervalId = window.setInterval(updateClock, 1000);
		}

		// Search bar
		if (overlay.showSearch) {
			const searchSection = parent.createDiv({ cls: 'dh-search-section' });
			const searchWrapper = searchSection.createDiv({ cls: 'dh-search-wrapper' });

			const searchIcon = searchWrapper.createDiv({ cls: 'dh-search-icon' });
			searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

			const searchInput = searchWrapper.createEl('input', {
				cls: 'dh-search-input',
				attr: { type: 'text', placeholder: 'Search your vault...', spellcheck: 'false' },
			});

			const resultsEl = searchSection.createDiv({ cls: 'dh-search-results' });

			searchInput.addEventListener('input', () => {
				const query = searchInput.value.trim().toLowerCase();
				resultsEl.empty();
				if (query.length < 2) return;

				const files = this.app.vault.getMarkdownFiles();
				const matches = files
					.filter((f: TFile) => f.basename.toLowerCase().includes(query))
					.slice(0, 8);

				for (const file of matches) {
					const item = resultsEl.createDiv({ cls: 'dh-search-result-item' });
					item.textContent = file.basename;
					item.addEventListener('click', () => {
						this.app.workspace.openLinkText(file.path, '', false);
					});
				}
			});

			searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					const firstResult = resultsEl.querySelector('.dh-search-result-item') as HTMLElement;
					if (firstResult) firstResult.click();
				}
				if (e.key === 'Escape') {
					searchInput.value = '';
					resultsEl.empty();
					searchInput.blur();
				}
			});
		}

		// Quick links
		if (overlay.showQuickLinks && settings.quickLinks.length > 0) {
			const linksSection = parent.createDiv({ cls: 'dh-quick-links' });
			for (const link of settings.quickLinks) {
				const btn = linksSection.createDiv({ cls: 'dh-quick-link' });
				btn.textContent = link.name;
				btn.addEventListener('click', () => {
					this.app.workspace.openLinkText(link.path, '', false);
				});
			}
		}

		// Recent files
		if (overlay.showRecentFiles) {
			const recentSection = parent.createDiv({ cls: 'dh-recent-section' });
			recentSection.createDiv({ cls: 'dh-recent-title', text: 'Recent Files' });
			const recentList = recentSection.createDiv({ cls: 'dh-recent-list' });

			const recentPaths = (this.app.workspace as any).getLastOpenFiles?.() as string[] | undefined;
			if (recentPaths) {
				const displayed = recentPaths.slice(0, settings.recentFilesCount);
				for (const path of displayed) {
					const file = this.app.vault.getAbstractFileByPath(path);
					if (file && file instanceof TFile) {
						const item = recentList.createDiv({ cls: 'dh-recent-item' });
						item.textContent = file.basename;
						item.addEventListener('click', () => {
							this.app.workspace.openLinkText(path, '', false);
						});
					}
				}
			}
		}
	}

	private initMode(bgEl: HTMLElement): void {
		const s = this.plugin.settings;

		switch (s.visualMode) {
			case VisualMode.RandomImage:
				this.currentRenderer = new RandomImageRenderer(s.randomImageUrl);
				break;
			case VisualMode.ImageGallery:
				this.currentRenderer = new ImageGalleryRenderer(s.galleryUrls);
				break;
			case VisualMode.MatrixRain:
				this.currentRenderer = new MatrixRainRenderer();
				break;
			case VisualMode.ClockGreeting:
				this.currentRenderer = new ClockGreetingRenderer();
				break;
			case VisualMode.AmbientParticles:
				this.currentRenderer = new AmbientParticlesRenderer(s.particleColor, s.particleCount);
				break;
		}

		if (this.currentRenderer) {
			this.currentRenderer.render(bgEl);
		}
	}

	private destroyCurrentMode(): void {
		if (this.currentRenderer) {
			this.currentRenderer.destroy();
			this.currentRenderer = null;
		}
	}
}
