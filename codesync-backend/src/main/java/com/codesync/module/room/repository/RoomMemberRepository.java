package com.codesync.module.room.repository;

import com.codesync.module.room.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {

    List<RoomMember> findByUserId(Long userId);

    List<RoomMember> findByRoomId(Long roomId);

    Optional<RoomMember> findByRoomIdAndUserId(Long roomId, Long userId);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    long countByRoomId(Long roomId);

    void deleteByRoomIdAndUserId(Long roomId, Long userId);
}
