import child_process from 'node:child_process';
import { log } from './logger';

type RunResponse = {
  code: number;
  stdout: string[];
  stderr: string[];
}

export async function run(command: string, options: string[], cwd?: string): Promise<RunResponse> {
  return new Promise((resolve) => {
    const proc = child_process.spawn(command, options, cwd ? { cwd } : undefined);
    const messages: Pick<RunResponse, 'stdout' | 'stderr'> = {
      stdout: [],
      stderr: []
    };
    proc.stdout.on('data', (data) => {
      messages.stdout.push(`${data}`);
      log('run:stdout', `${data}`);
    });
    proc.stderr.on('data', (data) => {
      messages.stderr.push(`${data}`);
      log('run:stderr', `${data}`);
    });
    proc.on('exit', async (code) => {
      log('run:exit', {
        command: `${command} ${options.join(' ')}`,
        code
      });
      resolve({
        ...messages,
        code
      });
    });
  })
}