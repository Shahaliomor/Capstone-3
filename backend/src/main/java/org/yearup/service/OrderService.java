package org.yearup.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.models.Order;
import org.yearup.models.Profile;
import org.yearup.models.ShoppingCart;
import org.yearup.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class OrderService
{
    private final OrderRepository orderRepository;
    private final ProfileService profileService;
    private final ShoppingCartService shoppingCartService;

    public OrderService(OrderRepository orderRepository, ProfileService profileService, ShoppingCartService shoppingCartService)
    {
        this.orderRepository = orderRepository;
        this.profileService = profileService;
        this.shoppingCartService = shoppingCartService;
    }
    public Order createOrder(int userId)
    {
        ShoppingCart cart = shoppingCartService.getByUserId(userId);

        if(cart.getItems().isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }
        Order order = new Order();
        order.setUserId(userId);
        order.setDate(LocalDateTime.now());
        Profile profile = profileService.getByUserId(userId);
        order.setAddress(profile.getAddress());
        order.setCity(profile.getCity());
        order.setState(profile.getState());
        order.setZip(profile.getZip());
        order.setShippingAmount(BigDecimal.ZERO);

        Order savedOrder = orderRepository.save(order);

        shoppingCartService.clearCart(userId);

        return savedOrder;
    }
}