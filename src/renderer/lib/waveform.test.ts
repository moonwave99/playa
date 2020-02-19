import { Waveform } from './waveform';

describe('Waveform', () => {
	it('should generate the svg amplitude path of a given track', async () => {
		const peaksCount = 100;
		const waveform = new Waveform({
			path: '/path/to/track',
			peaksCount
		});
		await waveform.load();
		const path = waveform.getSVGPath();
		expect(path.indexOf(`M${peaksCount - 1}`)).toBeGreaterThan(0);
		expect(path.indexOf(`L${peaksCount - 1}`)).toBeGreaterThan(0);
	});
});
