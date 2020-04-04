import { Waveform } from './waveform';

describe('Waveform', () => {
	it('should generate the svg amplitude path of a given track', async () => {
		const resolution = 100;
		const waveform = new Waveform({
			path: '/path/to/track',
			resolution,
			precision: 2
		});
		await waveform.load();
		const path = waveform.getSVGPath();
		expect(path.indexOf(`M${resolution - 1}`)).toBeGreaterThan(0);
		expect(path.indexOf(`L${resolution - 1}`)).toBeGreaterThan(0);
	});
});
