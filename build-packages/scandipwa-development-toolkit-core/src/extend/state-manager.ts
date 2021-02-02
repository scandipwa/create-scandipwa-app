import { ResourceType, FileOpenCallback, StylesOption } from "../types";
import extendableDirMap from './extendable-dir-map';

class ExtendStateManager {
    protected resourceTypeDirectory: string = '';
    protected extendableName: string = '';
    protected chosenStylesOption: StylesOption | undefined;
    protected extendableType: ResourceType;
    protected lastCreatedFilePath: string | undefined;

    chooseThingsToExtend: (exportsNames: string[], fileName: string) => Promise<string[]>;
    openFile: FileOpenCallback;
    showWarning: (message: string) => void;

    /**
     * Initialise instance with corresponding extendable
     * @param extendableType
     */
    constructor(
        extendableType: ResourceType, 
        extendableName: string,
        chooseThingsToExtend: (exportsNames: string[], fileName: string) => Promise<string[]>,
        openFile: FileOpenCallback,
        showWarning: (message: string) => void
    ) {
        this.extendableName = extendableName;
        this.extendableType = extendableType;

        this.resourceTypeDirectory = extendableDirMap[extendableType];

        this.chooseThingsToExtend = chooseThingsToExtend;
        this.openFile = openFile;
        this.showWarning = showWarning;
    }
}