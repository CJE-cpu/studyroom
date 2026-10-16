package com.cje.studyroom.room.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cje.studyroom.room.entity.Room;

public interface RoomRepository extends JpaRepository<Room, String> {

    @EntityGraph(attributePaths = "amenities")
    List<Room> findAllByOrderByIdAsc();
}