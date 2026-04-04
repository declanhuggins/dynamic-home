import { App, PluginSettingTab, Setting } from 'obsidian';
import type DynamicHomePlugin from '../main';
import { VisualMode, ModeOverlaySettings, MODE_OVERLAY_DEFAULTS, getOverlayForMode } from './types';

const MODE_LABELS: Record<string, string> = {
	[VisualMode.ClockGreeting]: 'Clock & greeting',
	[VisualMode.RandomImage]: 'Random image',
	[VisualMode.ImageGallery]: 'Image gallery',
	[VisualMode.MatrixRain]: 'Matrix rain',
	[VisualMode.AmbientParticles]: 'Ambient particles',
};

export class DynamicHomeSettingTab extends PluginSettingTab {
	plugin: DynamicHomePlugin;

	constructor(app: App, plugin: DynamicHomePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const mode = this.plugin.settings.visualMode;

		new Setting(containerEl)
			.setName('Visual mode')
			.setDesc('Choose the background visual for your home page')
			.addDropdown((dropdown) =>
				dropdown
					.addOption(VisualMode.ClockGreeting, 'Clock & greeting')
					.addOption(VisualMode.RandomImage, 'Random image')
					.addOption(VisualMode.ImageGallery, 'Image gallery')
					.addOption(VisualMode.MatrixRain, 'Matrix rain')
					.addOption(VisualMode.AmbientParticles, 'Ambient particles')
					.setValue(mode)
					.onChange(async (value) => {
						this.plugin.settings.visualMode = value as VisualMode;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl).setName('Configuration').setHeading();

		new Setting(containerEl)
			.setName('Greeting name')
			.setDesc('Name displayed in the greeting message')
			.addText((text) =>
				text
					.setPlaceholder('Friend')
					.setValue(this.plugin.settings.greetingName)
					.onChange(async (value) => {
						this.plugin.settings.greetingName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Accent color')
			.setDesc('Color used for highlights and accents')
			.addText((text) =>
				text
					.setPlaceholder('#7c3aed')
					.setValue(this.plugin.settings.accentColor)
					.onChange(async (value) => {
						this.plugin.settings.accentColor = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Open on startup')
			.setDesc('Automatically open home when Obsidian starts')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.openOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName(`${MODE_LABELS[mode]} — overlay`).setHeading();

		const overlaySettings = getOverlayForMode(this.plugin.settings, mode);

		const setOverlay = async (key: keyof ModeOverlaySettings, value: boolean) => {
			if (!this.plugin.settings.modeOverlay[mode]) {
				this.plugin.settings.modeOverlay[mode] = { ...MODE_OVERLAY_DEFAULTS[mode] };
			}
			this.plugin.settings.modeOverlay[mode][key] = value;
			await this.plugin.saveSettings();
		};

		new Setting(containerEl)
			.setName('Show clock')
			.setDesc('Display the time')
			.addToggle((t) => t.setValue(overlaySettings.showClock).onChange((v) => setOverlay('showClock', v)));

		new Setting(containerEl)
			.setName('Show greeting')
			.setDesc('Display the greeting message')
			.addToggle((t) => t.setValue(overlaySettings.showGreeting).onChange((v) => setOverlay('showGreeting', v)));

		new Setting(containerEl)
			.setName('Show search')
			.setDesc('Display a vault search bar')
			.addToggle((t) => t.setValue(overlaySettings.showSearch).onChange((v) => setOverlay('showSearch', v)));

		new Setting(containerEl)
			.setName('Show recent files')
			.setDesc('Display a list of recently opened files')
			.addToggle((t) => t.setValue(overlaySettings.showRecentFiles).onChange((v) => setOverlay('showRecentFiles', v)));

		new Setting(containerEl)
			.setName('Show quick links')
			.setDesc('Display quick link buttons')
			.addToggle((t) => t.setValue(overlaySettings.showQuickLinks).onChange((v) => setOverlay('showQuickLinks', v)));

		new Setting(containerEl)
			.setName('Dim background')
			.setDesc('Add a dark overlay to the background for better text readability')
			.addToggle((t) => t.setValue(overlaySettings.dimBackground).onChange((v) => setOverlay('dimBackground', v)));

		new Setting(containerEl)
			.addButton((btn) =>
				btn
					.setButtonText('Reset to defaults')
					.onClick(async () => {
						delete this.plugin.settings.modeOverlay[mode];
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName('Recent files count')
			.setDesc('Number of recent files to display')
			.addSlider((slider) =>
				slider
					.setLimits(1, 15, 1)
					.setValue(this.plugin.settings.recentFilesCount)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.recentFilesCount = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName('Quick links').setHeading();

		for (let i = 0; i < this.plugin.settings.quickLinks.length; i++) {
			const link = this.plugin.settings.quickLinks[i];
			new Setting(containerEl)
				.setName(`Link ${i + 1}`)
				.addText((text) =>
					text
						.setPlaceholder('Display name')
						.setValue(link.name)
						.onChange(async (value) => {
							this.plugin.settings.quickLinks[i].name = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text) =>
					text
						.setPlaceholder('Note path (e.g. Folder/Note.md)')
						.setValue(link.path)
						.onChange(async (value) => {
							this.plugin.settings.quickLinks[i].path = value;
							await this.plugin.saveSettings();
						})
				)
				.addButton((btn) =>
					btn
						.setIcon('trash')
						.setTooltip('Remove')
						.onClick(async () => {
							this.plugin.settings.quickLinks.splice(i, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		}

		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText('Add quick link')
				.setCta()
				.onClick(async () => {
					this.plugin.settings.quickLinks.push({ name: '', path: '' });
					await this.plugin.saveSettings();
					this.display();
				})
		);

		if (mode === VisualMode.RandomImage) {
			new Setting(containerEl).setName('Random image').setHeading();
			new Setting(containerEl)
				.setName('Image URL')
				.setDesc('URL to fetch a random image. A cache-buster is appended automatically.')
				.addText((text) =>
					text
						.setValue(this.plugin.settings.randomImageUrl)
						.onChange(async (value) => {
							this.plugin.settings.randomImageUrl = value;
							await this.plugin.saveSettings();
						})
				);
		}

		if (mode === VisualMode.ImageGallery) {
			new Setting(containerEl).setName('Image gallery').setHeading();
			new Setting(containerEl)
				.setName('Image urls')
				.setDesc('One URL per line. If empty, demo images will be used.')
				.addTextArea((text) =>
					text
						.setPlaceholder('https://example.com/image1.jpg\nhttps://example.com/image2.jpg')
						.setValue(this.plugin.settings.galleryUrls.join('\n'))
						.onChange(async (value) => {
							this.plugin.settings.galleryUrls = value
								.split('\n')
								.map((s) => s.trim())
								.filter((s) => s.length > 0);
							await this.plugin.saveSettings();
						})
				);
		}

		if (mode === VisualMode.AmbientParticles) {
			new Setting(containerEl).setName('Ambient particles').setHeading();
			new Setting(containerEl)
				.setName('Particle color')
				.setDesc('Hex color for particles and connections')
				.addText((text) =>
					text
						.setPlaceholder('#4fc3f7')
						.setValue(this.plugin.settings.particleColor)
						.onChange(async (value) => {
							this.plugin.settings.particleColor = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName('Particle count')
				.setDesc('Number of particles (higher = more CPU)')
				.addSlider((slider) =>
					slider
						.setLimits(20, 200, 10)
						.setValue(this.plugin.settings.particleCount)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.particleCount = value;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}
