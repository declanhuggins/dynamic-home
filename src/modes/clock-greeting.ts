import { ModeRenderer } from '../types';

export class ClockGreetingRenderer implements ModeRenderer {
	private container: HTMLElement | null = null;

	render(container: HTMLElement): void {
		this.container = container;
		container.empty();
		container.createDiv({ cls: 'dh-clock-mode-bg' });
	}

	destroy(): void {
		if (this.container) this.container.empty();
		this.container = null;
	}
}
