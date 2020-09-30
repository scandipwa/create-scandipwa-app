import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Placeholder from './Placeholder.component';

class Container-logic extends PureComponent {
    static propTypes = {
        // TODO: implement prop-types
    };

    containerFunctions = {
        // getData: this.getData.bind(this)
    };

    containerProps = () => {
        // isDisabled: this._getIsDisabled()
    };

    render() {
        return (
            <Placeholder
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default PlaceholderContainer;
