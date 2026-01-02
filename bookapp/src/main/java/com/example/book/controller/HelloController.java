package com.example.book.controller;
import org.springframework.web.bind.annotation.*;
@RestController
public class HelloController{
 @GetMapping("/hello")
 public String hi(){ return "Hello!"; }
}
