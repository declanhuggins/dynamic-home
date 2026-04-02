import { ModeRenderer } from '../types';

export class ClockGreetingRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;

	render(container: HTMLElement): void {
		this.container = container;
		container.empty();
		// Just renders the background gradient — the clock/greeting
		// content is handled by the overlay in view.ts
		const bg = container.createDiv({ cls: 'dh-clock-mode-bg' });
	}

	destroy(): void {
		if (this.container) this.container.empty();
		this.container = null;
	}
}
