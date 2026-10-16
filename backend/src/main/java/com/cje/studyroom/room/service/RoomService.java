package com.cje.studyroom.room.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cje.studyroom.room.dto.RoomResponse;
import com.cje.studyroom.room.repository.RoomRepository;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomResponse> getRooms() {
        return roomRepository.findAllByOrderByIdAsc()
            .stream()
            .map(room -> new RoomResponse(
                room.getId(),
                room.getName(),
                room.getCapacity(),
                room.getImage(),
                room.getDescription(),
                room.getAmenities()
            ))
            .toList();
    }
}