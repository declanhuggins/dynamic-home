import { ModeRenderer } from '../types';

export class MatrixRainRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private animFrameId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private drops: number[] = [];
	private columns = 0;

	private readonly chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	private readonly fontSize = 14;

	render(container: HTMLElement): void {
		this.container = container;
		container.empty();

		this.canvas = container.createEl('canvas', { cls: 'dh-matrix-canvas' });
		this.ctx = this.canvas.getContext('2d');

		this.resizeObserver = new ResizeObserver(() => this.handleResize());
		this.resizeObserver.observe(container);

		this.handleResize();
		this.animate();
	}

	private handleResize(): void {
		if (!this.canvas || !this.container) return;

		const w = this.container.clientWidth;
		const h = this.container.clientHeight;
		this.canvas.width = w;
		this.canvas.height = h;

		const newColumns = Math.floor(w / this.fontSize);
		if (newColumns > this.columns) {
			for (let i = this.columns; i < newColumns; i++) {
				this.drops[i] = Math.random() * -100;
			}
		}
		this.columns = newColumns;
		this.drops.length = this.columns;
	}

	private animate = (): void => {
		if (!this.ctx || !this.canvas) return;

		this.ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.font = `${this.fontSize}px monospace`;

		for (let i = 0; i < this.columns; i++) {
			const char = this.chars[Math.floor(Math.random() * this.chars.length)];
			const x = i * this.fontSize;
			const y = this.drops[i] * this.fontSize;

			// Lead character is bright white-green
			if (y > 0) {
				this.ctx.fillStyle = '#ffffff';
				this.ctx.fillText(char, x, y);

				// Trail characters
				this.ctx.fillStyle = '#00ff41';
				const trailChar = this.chars[Math.floor(Math.random() * this.chars.length)];
				this.ctx.fillText(trailChar, x, y - this.fontSize);
			}

			this.ctx.fillStyle = `rgba(0, 255, 65, ${0.3 + Math.random() * 0.5})`;
			this.ctx.fillText(char, x, y);

			this.drops[i]++;

			if (y > this.canvas.height && Math.random() > 0.975) {
				this.drops[i] = 0;
			}
		}

		this.animFrameId = requestAnimationFrame(this.animate);
	};

	destroy(): void {
		if (this.animFrameId !== null) {
			cancelAnimationFrame(this.animFrameId);
			this.animFrameId = null;
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		if (this.container) this.container.empty();
		this.canvas = null;
		this.ctx = null;
		this.container = null;
	}
}
