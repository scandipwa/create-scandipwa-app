import * as fs from 'fs-extra';
import * as path from 'path';
import { ILogger } from '../types';

// const RECURSION_LIMIT = 5;

// const getTargetScandipwaModulePath = (cwd: string, recursionLevel = 1): string | null => {
//     const packageJsonPath = path.join(cwd, 'package.json');

//     if (fs.existsSync(packageJsonPath)) {
//         const { scandipwa } = require(packageJsonPath);
//         if (scandipwa) {
//             return cwd;
//         }
//     }

//     if (recursionLevel > RECURSION_LIMIT) {
//         // TODO throw
//         return null;
//     }

//     const parentDirectory = path.resolve(cwd, '..');
//     return getTargetScandipwaModulePath(parentDirectory, --recursionLevel);
// }

export const createNewFileFromTemplate = (
    src: string, 
    dest: string, 
    pattern: RegExp, 
    name: string,
    logger: ILogger
) : boolean => {
    if (!src || !dest || !name) {
        return false;
    }
    const data = fs.readFileSync(src, 'utf8');
    const content = data.replace(pattern, name);

    if (fs.existsSync(dest)) {
        logger.warn(
            `File ${logger?.style?.file(dest) || dest} exists and will not be overwritten\n`
        );
        return false;
    }

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
