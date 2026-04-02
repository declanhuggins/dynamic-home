import { Plugin, TFile } from 'obsidian';
import { DynamicHomeSettings, DEFAULT_SETTINGS } from './src/types';
import { DynamicHomeView, VIEW_TYPE_DYNAMIC_HOME, DYNAMIC_HOME_EXTENSION } from './src/view';
import { DynamicHomeSettingTab } from './src/settings';

export default class DynamicHomePlugin extends Plugin {
	settings: DynamicHomeSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_DYNAMIC_HOME, (leaf) => new DynamicHomeView(leaf, this));
		this.registerExtensions([DYNAMIC_HOME_EXTENSION], VIEW_TYPE_DYNAMIC_HOME);

		this.addRibbonIcon('home', 'Dynamic Home', () => {
			this.openHome();
		});

		this.addCommand({
			id: 'open-dynamic-home',
			name: 'Open Dynamic Home',
			callback: () => this.openHome(),
		});

		this.addCommand({
			id: 'open-dynamic-home-new-tab',
			name: 'Open Dynamic Home in new tab',
			callback: () => this.openHome(true),
		});

		this.addCommand({
			id: 'create-home-file',
			name: 'Create Home file',
			callback: () => this.createHomeFile(),
		});

		this.addSettingTab(new DynamicHomeSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			if (this.settings.openOnStartup) {
				this.openHome();
			}
		});
	}

	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_DYNAMIC_HOME);
	}

	async openHome(newTab = false): Promise<void> {
		const homeFile = this.findHomeFile();
		if (homeFile) {
			const leaf = this.app.workspace.getLeaf(newTab ? 'tab' : false);
			await leaf.openFile(homeFile);
			return;
		}
		const file = await this.createHomeFile();
		if (file) {
			const leaf = this.app.workspace.getLeaf(newTab ? 'tab' : false);
			await leaf.openFile(file);
		}
	}

	async createHomeFile(): Promise<TFile | null> {
		const existing = this.findHomeFile();
		if (existing) {
			// Open the existing file instead of creating a duplicate
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(existing);
			return existing;
		}

		const filePath = `Home.${DYNAMIC_HOME_EXTENSION}`;
		const file = await this.app.vault.create(filePath, '');
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
		return file;
	}

	private findHomeFile(): TFile | null {
		const files = this.app.vault.getFiles();
		return files.find((f) => f.extension === DYNAMIC_HOME_EXTENSION) ?? null;
	}

	refreshViews(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DYNAMIC_HOME);
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof DynamicHomeView) {
				view.refresh();
			}
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshViews();
	}
}
