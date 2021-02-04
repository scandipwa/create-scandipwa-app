import * as fs from 'fs-extra';
import * as path from 'path';
import { ILogger, ReplacementInstruction } from '../types';

export const createNewFileFromTemplate = (
    src: string, 
    dest: string,
    replace: ReplacementInstruction[],
    logger: ILogger
) : boolean => {
    if (!src || !dest) {
        return false;
    }

    // Read the template
    const template = fs.readFileSync(src, 'utf8');

    // Replace all the necessary patterns
    const content = replace.reduce(
        (data, { pattern, replacement }) => data.replace(pattern, replacement), 
        template
    );

    // Prevent overwriting existing files
    if (fs.existsSync(dest)) {
        logger.warn(
            `File ${logger?.style?.file(dest) || dest} exists and will not be overwritten\n`
        );
        return false;
    }

    // Create the file
    fs.writeFileSync(dest, content);
    return true;
};

/**
 * Create a new file and fill it with given contents
 * @param newFilePath
 * @param contents
 */
export const createNewFileWithContents = async (newFilePath: string, contents: string) => {
    // Make sure parent dir exists
    const parentDirectory = path.dirname(newFilePath);
    fs.ensureDirSync(parentDirectory);

    // Prevent overwrites
    if (fs.existsSync(newFilePath)) {
        return;
    }

    // Create the file
    fs.writeFile(
        newFilePath,
        contents,
        console.error
    );
};
