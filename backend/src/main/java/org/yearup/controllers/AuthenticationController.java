package org.yearup.controllers;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.yearup.models.Profile;
import org.yearup.service.ProfileService;
import org.yearup.service.UserService;
import org.yearup.models.authentication.LoginDto;
import org.yearup.models.authentication.LoginResponseDto;
import org.yearup.models.authentication.RegisterUserDto;
import org.yearup.models.User;
import org.yearup.security.jwt.JWTFilter;
import org.yearup.security.jwt.TokenProvider;

@RestController
@CrossOrigin
@PreAuthorize("permitAll()")
public class AuthenticationController {

    private final TokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private UserService userService;
    private ProfileService profileService;

    public AuthenticationController(TokenProvider tokenProvider, AuthenticationManager authenticationManager, UserService userService, ProfileService profileService) {
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.profileService = profileService;
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginDto loginDto) {
        try
        {
            // 1. Create authentication token
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());
            // 2. Authenticate user
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            // 3. Save authenticated user
            SecurityContextHolder.getContext().setAuthentication(authentication);
            // 4. Generate JWT token
            String jwt = tokenProvider.createToken(authentication, false);
            // 5. Get user from database
            User user = userService.getByUserName(loginDto.getUsername());
            // 6. Add token to headers
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add(JWTFilter.AUTHORIZATION_HEADER, "Bearer " + jwt);
            // 7. Return success response
            return new ResponseEntity<>(new LoginResponseDto(jwt, user), httpHeaders, HttpStatus.OK);
        }
        catch (AuthenticationException e)
        {
            // 8. Return 401 if login fails
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public ResponseEntity<User> register(@Valid @RequestBody RegisterUserDto newUser) {
        // Check if the username already exists
        boolean exists = userService.exists(newUser.getUsername());
        if (exists)
        {
            // If username exists, return 400 Bad Request
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User Already Exists.");
        }

        // create user
        User user = userService.create(new User(0, newUser.getUsername(), newUser.getPassword(), newUser.getRole()));

        // Create an empty profile for the new user
        Profile profile = new Profile();
        // Link the profile to the newly created user
        profile.setUserId(user.getId());
        // Save the profile in the database
        profileService.create(profile);
        // Return the created user with HTTP 201 Created
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

}
