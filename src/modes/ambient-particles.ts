import { ModeRenderer } from '../types';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
}

export class AmbientParticlesRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private animFrameId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private particles: Particle[] = [];
	private particleCount: number;
	private color: string;
	private r: number;
	private g: number;
	private b: number;

	constructor(color: string, count: number) {
		this.color = color;
		this.particleCount = count;

		// Parse hex color to RGB
		const hex = color.replace('#', '');
		this.r = parseInt(hex.substring(0, 2), 16) || 79;
		this.g = parseInt(hex.substring(2, 4), 16) || 195;
		this.b = parseInt(hex.substring(4, 6), 16) || 247;
	}

	render(container: HTMLElement): void {
		this.container = container;
		container.empty();

		this.canvas = container.createEl('canvas', { cls: 'dh-particles-canvas' });
		this.ctx = this.canvas.getContext('2d');

		this.resizeObserver = new ResizeObserver(() => this.handleResize());
		this.resizeObserver.observe(container);

		this.handleResize();
		this.initParticles();
		this.animate();
	}

	private handleResize(): void {
		if (!this.canvas || !this.container) return;
		this.canvas.width = this.container.clientWidth;
		this.canvas.height = this.container.clientHeight;
	}

	private initParticles(): void {
		if (!this.canvas) return;
		this.particles = [];
		for (let i = 0; i < this.particleCount; i++) {
			this.particles.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				vx: (Math.random() - 0.5) * 0.8,
				vy: (Math.random() - 0.5) * 0.8,
				size: Math.random() * 2 + 1,
			});
		}
	}

	private animate = (): void => {
		if (!this.ctx || !this.canvas) return;
		const w = this.canvas.width;
		const h = this.canvas.height;

		this.ctx.fillStyle = '#0d1117';
		this.ctx.fillRect(0, 0, w, h);

		const connectionDistance = 120;

		// Update and draw particles
		for (const p of this.particles) {
			p.x += p.vx;
			p.y += p.vy;

			if (p.x < 0) p.x = w;
			if (p.x > w) p.x = 0;
			if (p.y < 0) p.y = h;
			if (p.y > h) p.y = 0;

			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			this.ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, 0.8)`;
			this.ctx.fill();
		}

		// Draw connections
		for (let i = 0; i < this.particles.length; i++) {
			for (let j = i + 1; j < this.particles.length; j++) {
				const dx = this.particles[i].x - this.particles[j].x;
				const dy = this.particles[i].y - this.particles[j].y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < connectionDistance) {
					const alpha = (1 - dist / connectionDistance) * 0.3;
					this.ctx.beginPath();
					this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
					this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
					this.ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
					this.ctx.lineWidth = 0.5;
					this.ctx.stroke();
				}
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
