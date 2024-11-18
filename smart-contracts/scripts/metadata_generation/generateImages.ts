import * as fs from 'fs';
import * as path from 'path';
import { imageConfig, ImageSet } from '../config/imageConfig';

function generateImages() {
    imageConfig.forEach((imageSet: ImageSet) => {
        const { name, sourceImagePath, numberOfCopies } = imageSet;

        console.log(`\nProcessing image set: ${name}`);

        const absoluteSourcePath = path.resolve(__dirname, sourceImagePath);

        if (!fs.existsSync(absoluteSourcePath)) {
            console.error(`Source image not found for "${name}" at path: ${absoluteSourcePath}`);
            return;
        }

        const outputDirName = `${name.toLowerCase()}_images`;
        const absoluteOutputDir = path.resolve(__dirname, 'images', name, outputDirName);

        if (!fs.existsSync(absoluteOutputDir)) {
            fs.mkdirSync(absoluteOutputDir, { recursive: true });
            console.log(`Created output directory: ${absoluteOutputDir}`);
        }

        const extension = path.extname(absoluteSourcePath);

        for (let i = 1; i <= numberOfCopies; i++) {
            const destinationFileName = `${i}${extension}`;
            const destinationPath = path.join(absoluteOutputDir, destinationFileName);

            try {
                fs.copyFileSync(absoluteSourcePath, destinationPath);
                if (i % 100 === 0 || i === numberOfCopies) {
                    console.log(`Copied: ${destinationFileName} (${i}/${numberOfCopies})`);
                }
            } catch (error) {
                console.error(`Error copying from ${absoluteSourcePath} to ${destinationPath}:`, error);
            }
        }

        console.log(`Finished image set: ${name}. Created ${numberOfCopies} copies.\n`);
    });

    console.log('All image copies have been successfully created.');
}

generateImages();
