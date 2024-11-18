export interface ImageSet {
    name: string;
    sourceImagePath: string;
    numberOfCopies: number;
}

export const imageConfig: ImageSet[] = [
    {
        name: 'Arcane_Relics',
        sourceImagePath: './images/Arcane_Relics/1.png',
        numberOfCopies: 250,
    },
];