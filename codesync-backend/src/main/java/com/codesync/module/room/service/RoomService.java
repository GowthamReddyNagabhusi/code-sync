package com.codesync.module.room.service;

import com.codesync.common.exception.ApiException;
import com.codesync.module.room.dto.*;
import com.codesync.module.room.entity.Room;
import com.codesync.module.room.entity.RoomMember;
import com.codesync.module.room.repository.RoomMemberRepository;
import com.codesync.module.room.repository.RoomRepository;
import com.codesync.module.room.util.RoomCodeGenerator;
import com.codesync.module.user.entity.User;
import com.codesync.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final RoomCodeGenerator codeGenerator;

    @Transactional
    public RoomResponse createRoom(String email, CreateRoomRequest request) {
        User owner = findUser(email);

        Room room = Room.builder()
                .name(request.getName())
                .roomCode(codeGenerator.generate())
                .language(request.getLanguage() != null ? request.getLanguage() : "java")
                .owner(owner)
                .maxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 5)
                .build();

        roomRepository.save(room);

        // Auto-add owner as member
        RoomMember ownerMember = RoomMember.builder()
                .room(room)
                .user(owner)
                .role(RoomMember.MemberRole.OWNER)
                .build();
        roomMemberRepository.save(ownerMember);

        log.info("Room '{}' created with code {} by {}", room.getName(), room.getRoomCode(), email);

        return mapToResponse(room);
    }

    public List<RoomResponse> getMyRooms(String email) {
        User user = findUser(email);

        List<RoomMember> memberships = roomMemberRepository.findByUserId(user.getId());

        return memberships.stream()
                .map(membership -> mapToResponse(membership.getRoom()))
                .toList();
    }

    public RoomResponse getRoomByCode(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Room not found with code: " + roomCode));

        return mapToResponse(room);
    }

    @Transactional
    public RoomResponse joinRoom(String email, String roomCode) {
        User user = findUser(email);

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Room not found with code: " + roomCode));

        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            throw ApiException.conflict("You are already a member of this room");
        }

        long currentMembers = roomMemberRepository.countByRoomId(room.getId());
        if (currentMembers >= room.getMaxMembers()) {
            throw ApiException.badRequest("Room is full (max " + room.getMaxMembers() + " members)");
        }

        RoomMember member = RoomMember.builder()
                .room(room)
                .user(user)
                .role(RoomMember.MemberRole.EDITOR)
                .build();
        roomMemberRepository.save(member);

        log.info("User {} joined room {}", email, roomCode);

        return mapToResponse(room);
    }

    @Transactional
    public void leaveRoom(String email, String roomCode) {
        User user = findUser(email);

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Room not found"));

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(room.getId(), user.getId())
                .orElseThrow(() -> ApiException.badRequest("You are not a member of this room"));

        if (member.getRole() == RoomMember.MemberRole.OWNER) {
            throw ApiException.badRequest("Room owner cannot leave. Delete the room instead.");
        }

        roomMemberRepository.delete(member);
        log.info("User {} left room {}", email, roomCode);
    }

    @Transactional
    public void deleteRoom(String email, String roomCode) {
        User user = findUser(email);

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Room not found"));

        if (!room.getOwner().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the room owner can delete this room");
        }

        roomRepository.delete(room);
        log.info("Room {} deleted by {}", roomCode, email);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private RoomResponse mapToResponse(Room room) {
        List<RoomMember> members = roomMemberRepository.findByRoomId(room.getId());

        List<RoomMemberResponse> memberResponses = members.stream()
                .map(m -> RoomMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .email(m.getUser().getEmail())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .toList();

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .roomCode(room.getRoomCode())
                .language(room.getLanguage())
                .maxMembers(room.getMaxMembers())
                .currentMembers(members.size())
                .ownerUsername(room.getOwner().getUsername())
                .createdAt(room.getCreatedAt())
                .members(memberResponses)
                .build();
    }
}
