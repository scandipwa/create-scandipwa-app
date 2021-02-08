import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_MAX_LEVEL = 5;

var bubbleUp = (dir: string, maxLevel: number, level: number) => {
    const parentDir = path.resolve(dir, '..');

    return locateScandipwaModule(parentDir, maxLevel, ++level);

}

var locateScandipwaModule = (
    dir: string, 
    maxLevel = DEFAULT_MAX_LEVEL,
    level = 1
): string | null => {
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        // Handle max recursion depth
        if (level === maxLevel) {
            return null;
        }

        // Handle no package.json -> look above
        return bubbleUp(dir, maxLevel, level);
    }

    // Read the package's package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Any scandipwa package apart from CMA -> valid
    if (packageJson.scandipwa && packageJson.scandipwa.type !== 'magento') {
        return dir;
    }

    // Handle non-scandipwa package inside of scandipwa package
    return bubbleUp(dir, maxLevel, level);
};

export default locateScandipwaModule;