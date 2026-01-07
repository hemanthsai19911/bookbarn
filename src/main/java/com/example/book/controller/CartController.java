package com.example.book.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.book.model.CartItem;
import com.example.book.service.CartService;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService svc;

    public CartController(CartService svc) {
        this.svc = svc;
    }
    
    @GetMapping
    public List<CartItem> all(){
    	return svc.findAll();
    }
    
    @PostMapping("/update")
    public CartItem updateQuantity(@RequestBody CartItem item) {
        return svc.updateQuantity(item);
    }

    @PostMapping
    public CartItem addItem(@RequestBody CartItem item) {
        return svc.add(item);
    }
    @GetMapping("/order/{orderId}")
    public List<CartItem> getItemsByOrder(@PathVariable Long orderId) {
        return svc.getItemsByOrder(orderId);
    }

    
    @DeleteMapping("/{itemId}")
    public String  deleteItem(@PathVariable Long itemId) {
         svc.deleteItem(itemId);
         
         return  "Item"+itemId+" deleted successfully";
        
    }
    

    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Long userId) {
    	
        return svc.getUserCart(userId);
    }
}