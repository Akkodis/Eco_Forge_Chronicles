import cliProgress from 'cli-progress';

export const progressBar = new cliProgress.SingleBar({
    format: 'Progress |{bar}| {percentage}% || {task}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: false,
}, cliProgress.Presets.shades_classic);

export function printPhaseHeader(phaseTitle: string) {
    const separator = '='.repeat(80);
    progressBar.stop();
    console.log('\n' + separator);
    console.log(`\t\t\t${phaseTitle}`);
    console.log(separator + '\n');
    progressBar.start(100, 0, { task: phaseTitle });
}
