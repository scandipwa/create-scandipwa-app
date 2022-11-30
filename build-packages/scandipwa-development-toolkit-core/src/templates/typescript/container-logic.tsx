import { PureComponent } from 'react';

import Placeholder from './Placeholder.component';
import {
    PlaceholderContainerProps,
    PlaceholderContainerFunctions,
    PlaceholderContainerPropsKeys,
    PlaceholderComponentProps
} from './Placeholder.type';

class PlaceholderContainer extends PureComponent<PlaceholderContainerProps> {
    containerFunctions: PlaceholderContainerFunctions = {
        // getData: this.getData.bind(this)
    };

    // Adjust keys for return
    containerProps(): Pick<PlaceholderComponentProps, PlaceholderContainerPropsKeys> {
        return {
            // isDisabled: this._getIsDisabled()
        }
    };

    render() {
        return (
            <Placeholder
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default PlaceholderContainer;
