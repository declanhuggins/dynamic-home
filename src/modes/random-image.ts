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
			img.style.display = 'none';
		});

		const refreshBtn = wrapper.createDiv({ cls: 'dh-refresh-btn' });
		refreshBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
		refreshBtn.addEventListener('click', () => this.loadImage());
	}

	destroy(): void {
		if (this.container) this.container.empty();
		this.container = null;
	}
}
