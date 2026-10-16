package com.cje.studyroom.room.dto;

import java.util.List;

public record RoomResponse(
    String id,
    String name,
    int capacity,
    String image,
    String description,
    List<String> amenities
) {}