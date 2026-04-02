import { ModeRenderer } from '../types';

export class ImageGalleryRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;
	private animFrameId: number | null = null;
	private urls: string[];

	constructor(urls: string[]) {
		this.urls = urls.length > 0
			? urls
			: Array.from({ length: 20 }, (_, i) =>
				`https://picsum.photos/seed/dh${i}/${400 + (i % 3) * 100}/${300 + ((i * 7) % 5) * 80}`
			);
	}

	render(container: HTMLElement): void {
		this.container = container;
		container.empty();

		const wrapper = container.createDiv({ cls: 'dh-gallery-wall' });

		// Use CSS columns masonry — fill with images
		const masonry = wrapper.createDiv({ cls: 'dh-gallery-masonry' });

		// Duplicate images to ensure the grid is always full
		const allUrls = [...this.urls, ...this.urls];

		for (const url of allUrls) {
			const cell = masonry.createDiv({ cls: 'dh-gallery-cell' });
			const img = cell.createEl('img');
			img.src = url;
			img.alt = '';
			img.crossOrigin = 'anonymous';
			img.loading = 'lazy';
			img.draggable = false;
		}

		// Gentle continuous scroll
		let scrollY = 0;
		const speed = 0.15;

		const animate = () => {
			scrollY += speed;
			if (scrollY >= masonry.scrollHeight / 2) {
				scrollY = 0;
			}
			masonry.style.transform = `translateY(-${scrollY}px)`;
			this.animFrameId = requestAnimationFrame(animate);
		};
		this.animFrameId = requestAnimationFrame(animate);

		// Pause scroll on hover
		wrapper.addEventListener('mouseenter', () => {
			if (this.animFrameId !== null) {
				cancelAnimationFrame(this.animFrameId);
				this.animFrameId = null;
			}
		});
		wrapper.addEventListener('mouseleave', () => {
			if (this.animFrameId === null) {
				this.animFrameId = requestAnimationFrame(animate);
			}
		});
	}

	destroy(): void {
		if (this.animFrameId !== null) {
			cancelAnimationFrame(this.animFrameId);
			this.animFrameId = null;
		}
		if (this.container) this.container.empty();
		this.container = null;
	}
}
