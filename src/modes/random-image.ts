import { setIcon } from 'obsidian';
import { ModeRenderer } from '../types';

export class RandomImageRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;
	private url: string;

	constructor(url: string) {
		this.url = url;
	}

	render(container: HTMLElement): void {
		this.container = container;
		this.loadImage();
	}

	private loadImage(): void {
		if (!this.container) return;
		this.container.empty();

		const wrapper = this.container.createDiv({ cls: 'dh-random-image' });

		const img = wrapper.createEl('img', { cls: 'dh-bg-image' });

		// Append cache-buster to get a fresh image each time
		const separator = this.url.includes('?') ? '&' : '?';
		img.src = this.url + separator + '_t=' + Date.now();
		img.alt = '';

		img.addEventListener('error', () => {
			wrapper.addClass('dh-bg-fallback');
			img.addClass('dh-hidden');
		});

		const refreshBtn = wrapper.createDiv({ cls: 'dh-refresh-btn' });
		setIcon(refreshBtn, 'refresh-cw');
		refreshBtn.addEventListener('click', () => this.loadImage());
	}

	destroy(): void {
		if (this.container) this.container.empty();
		this.container = null;
	}
}
