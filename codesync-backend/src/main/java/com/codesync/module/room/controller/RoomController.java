package com.codesync.module.room.controller;

import com.codesync.module.room.dto.CreateRoomRequest;
import com.codesync.module.room.dto.RoomResponse;
import com.codesync.module.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.createRoom(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getMyRooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(roomService.getMyRooms(userDetails.getUsername()));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomResponse> getRoomByCode(
            @PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoomByCode(roomCode));
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.joinRoom(userDetails.getUsername(), roomCode));
    }

    @DeleteMapping("/{roomCode}/leave")
    public ResponseEntity<Void> leaveRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String roomCode) {
        roomService.leaveRoom(userDetails.getUsername(), roomCode);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roomCode}")
    public ResponseEntity<Void> deleteRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String roomCode) {
        roomService.deleteRoom(userDetails.getUsername(), roomCode);
        return ResponseEntity.noContent().build();
    }
}
