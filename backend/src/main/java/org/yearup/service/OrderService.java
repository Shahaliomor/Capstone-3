package org.yearup.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.models.*;
import org.yearup.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService
{
    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final ProfileService profileService;
    private final ShoppingCartService shoppingCartService;

    public OrderService(OrderRepository orderRepository,
                        ProfileService profileService,
                        ShoppingCartService shoppingCartService,
                        ProductService productService)
    {
        this.orderRepository = orderRepository;
        this.profileService = profileService;
        this.shoppingCartService = shoppingCartService;
        this.productService = productService;
    }
    public Order createOrder(int userId)
    {
        ShoppingCart cart = shoppingCartService.getByUserId(userId);

        if(cart.getItems().isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        // NEW: Check stock and reduce stock
        for(ShoppingCartItem item : cart.getItems().values())
        {
            Product product = productService.getById(item.getProductId());

            // NEW: Not enough stock
            if(product.getStock() < item.getQuantity())
            {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Not enough stock."
                );
            }

            // NEW: Reduce stock
            product.setStock(product.getStock() - item.getQuantity());
            productService.update(product.getProductId(), product);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setDate(LocalDateTime.now());

        Profile profile = profileService.getByUserId(userId);
        order.setAddress(profile.getAddress());
        order.setCity(profile.getCity());
        order.setState(profile.getState());
        order.setZip(profile.getZip());
        order.setShippingAmount(BigDecimal.valueOf(cart.getTotal()));

        Order savedOrder = orderRepository.save(order);

        shoppingCartService.clearCart(userId);

        return savedOrder;
    }
    public List<Order> getAllOrders()
    {
        return orderRepository.findAll();
    }
}