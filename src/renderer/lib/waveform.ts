// #SEE: https://github.com/antonkalinin/audio-waveform-svg-path
type WaveformParams = {
	path: string;
	peaksCount: number;
}

export class Waveform {
	path: string;
	context: AudioContext;
	audioBuffer: AudioBuffer;
	peaksCount: number;
	constructor({
		path,
		peaksCount
	}: WaveformParams) {
		this.path = path;
		this.peaksCount = peaksCount;
		this.context = new AudioContext();
	}

	_getPeaks(channelData: Float32Array, peaks: number[], channelNumber: number | number[]): number[] {
		const sampleSize = this.audioBuffer.length / this.peaksCount;
		const sampleStep = ~~(sampleSize / 10) || 1;
		const mergedPeaks = Array.isArray(peaks) ? peaks : [];

		for (let peakNumber = 0; peakNumber < this.peaksCount; peakNumber++) {
			const start = ~~(peakNumber * sampleSize);
			const end = ~~(start + sampleSize);
			let min = channelData[0];
			let max = channelData[0];

			for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) {
				const value = channelData[sampleIndex];

				if (value > max) {
					max = value;
				}
				if (value < min) {
					min = value;
				}
			}

			if (channelNumber === 0 || max > mergedPeaks[2 * peakNumber]) {
				mergedPeaks[2 * peakNumber] = max;
			}

			if (channelNumber === 0 || min < mergedPeaks[2 * peakNumber + 1]) {
				mergedPeaks[2 * peakNumber + 1] = min;
			}
		}

		return mergedPeaks;
	}

	_svgPath(peaks: number[]): string {
		const totalPeaks = peaks.length;

		let d = '';
		for (let peakNumber = 0; peakNumber < totalPeaks; peakNumber++) {
			if (peakNumber % 2 === 0) {
				d += ` M${~~(peakNumber / 2)}, ${peaks.shift()}`;
			} else {
				d += ` L${~~(peakNumber / 2)}, ${peaks.shift()}`;
			}
		}
		return d;
	}

	async load(): Promise<void> {
		const response = await fetch(this.path);
		this.audioBuffer = await this.context.decodeAudioData(await response.arrayBuffer());
	}

	getPath(): string {
		if (!this.audioBuffer) {
			console.log('[Waveform] No audio buffer to proccess');
			return null;
		}

		const numberOfChannels = this.audioBuffer.numberOfChannels;
		const channels = [];

		for (let channelNumber = 0; channelNumber < numberOfChannels; channelNumber++) {
			channels.push(this.audioBuffer.getChannelData(channelNumber));
		}

		const peaks = channels.reduce(
			(mergedPeaks, channelData, channelNumber) => this._getPeaks(channelData, mergedPeaks, channelNumber), []
		);

		return this._svgPath(peaks);
	}
}
