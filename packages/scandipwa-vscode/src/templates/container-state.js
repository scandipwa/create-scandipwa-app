import { connect } from 'react-redux';

import Placeholder from './Placeholder.component';

export const mapStateToProps = (state) => ({
    // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (dispatch) => ({
    // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export default connect(mapStateToProps, mapDispatchToProps)(Placeholder);
