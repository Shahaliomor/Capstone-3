package org.yearup.service;

import org.springframework.stereotype.Service;
import org.yearup.models.CartItem;
import org.yearup.models.Product;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;
import org.yearup.repository.ShoppingCartRepository;

import java.util.List;

@Service
public class ShoppingCartService
{
    // a shopping cart is built from cart rows plus a product lookup for each row
    private final ShoppingCartRepository shoppingCartRepository;
    private final ProductService productService;

    public ShoppingCartService(ShoppingCartRepository shoppingCartRepository, ProductService productService)
    {
        this.shoppingCartRepository = shoppingCartRepository;
        this.productService = productService;
    }

    public ShoppingCart getByUserId(int userId)
    {
        //creates an empty cart.
        ShoppingCart cart= new ShoppingCart();
        //gets all saved cart rows for that user
        List<CartItem> cartItems=shoppingCartRepository.findByUserId(userId);
        for(CartItem cartItem: cartItems)
        {
            Product product=productService.getById(cartItem.getProductId());
            if(product!=null)
            {
                ShoppingCartItem shoppingCartItem = new ShoppingCartItem();
                shoppingCartItem.setProduct(product);
                shoppingCartItem.setQuantity(cartItem.getQuantity());
                cart.add(shoppingCartItem);
            }
        }
        return cart;
    }

    public ShoppingCart addProduct(int userId, int productId)
    {
        CartItem item = shoppingCartRepository.findByUserIdAndProductId(userId, productId);
        if (item == null)
        {
            item = new CartItem();
            item.setUserId(userId);
            item.setProductId(productId);
            item.setQuantity(1);
        }
        else
        {
            item.setQuantity(item.getQuantity() + 1);
        }
        shoppingCartRepository.save(item);
        return getByUserId(userId);
    }

    public ShoppingCart clearCart(int userId)
    {
        shoppingCartRepository.deleteByUserId(userId);

        return getByUserId(userId);
    }

    // add additional methods here
}
