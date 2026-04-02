export enum VisualMode {
	RandomImage = 'random-image',
	ImageGallery = 'image-gallery',
	MatrixRain = 'matrix-rain',
	ClockGreeting = 'clock-greeting',
	AmbientParticles = 'ambient-particles',
}

export interface QuickLink {
	name: string;
	path: string;
}

export interface ModeOverlaySettings {
	showClock: boolean;
	showGreeting: boolean;
	showSearch: boolean;
	showRecentFiles: boolean;
	showQuickLinks: boolean;
	dimBackground: boolean;
}

export interface DynamicHomeSettings {
	visualMode: VisualMode;
	greetingName: string;
	quickLinks: QuickLink[];
	recentFilesCount: number;
	accentColor: string;
	openOnStartup: boolean;
	// Per-mode overlay settings
	modeOverlay: Record<string, ModeOverlaySettings>;
	// Mode-specific visual settings
	randomImageUrl: string;
	galleryUrls: string[];
	particleColor: string;
	particleCount: number;
}

export const MODE_OVERLAY_DEFAULTS: Record<string, ModeOverlaySettings> = {
	[VisualMode.ClockGreeting]: {
		showClock: true,
		showGreeting: true,
		showSearch: true,
		showRecentFiles: true,
		showQuickLinks: true,
		dimBackground: false,
	},
	[VisualMode.RandomImage]: {
		showClock: false,
		showGreeting: false,
		showSearch: true,
		showRecentFiles: false,
		showQuickLinks: false,
		dimBackground: false,
	},
	[VisualMode.ImageGallery]: {
		showClock: false,
		showGreeting: false,
		showSearch: false,
		showRecentFiles: false,
		showQuickLinks: false,
		dimBackground: false,
	},
	[VisualMode.MatrixRain]: {
		showClock: false,
		showGreeting: false,
		showSearch: false,
		showRecentFiles: false,
		showQuickLinks: false,
		dimBackground: false,
	},
	[VisualMode.AmbientParticles]: {
		showClock: true,
		showGreeting: true,
		showSearch: true,
		showRecentFiles: false,
		showQuickLinks: true,
		dimBackground: false,
	},
};

export const DEFAULT_SETTINGS: DynamicHomeSettings = {
	visualMode: VisualMode.ClockGreeting,
	greetingName: 'Friend',
	quickLinks: [],
	recentFilesCount: 5,
	accentColor: '#7c3aed',
	openOnStartup: false,
	modeOverlay: {},
	randomImageUrl: 'https://picsum.photos/1920/1080',
	galleryUrls: [],
	particleColor: '#4fc3f7',
	particleCount: 80,
};

export function getOverlayForMode(settings: DynamicHomeSettings, mode: VisualMode): ModeOverlaySettings {
	if (settings.modeOverlay[mode]) {
		return settings.modeOverlay[mode];
	}
	return MODE_OVERLAY_DEFAULTS[mode];
}

export interface ModeRenderer {
	render(container: HTMLElement): void;
	destroy(): void;
}
