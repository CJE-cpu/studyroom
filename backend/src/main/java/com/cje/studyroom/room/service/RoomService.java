package com.cje.studyroom.room.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cje.studyroom.room.dto.RoomResponse;

@Service
public class RoomService {

    public List<RoomResponse> getRooms() {
        return List.of(
            new RoomResponse(
                "focus",
                "포커스 룸",
                4,
                "/images/room-four-person.png",
                "팀 스터디와 작은 회의를 위한 공간입니다.",
                List.of("화이트보드", "Wi-Fi", "콘센트")
            ),
            new RoomResponse(
                "lounge",
                "오픈 라운지",
                8,
                "/images/hero-studyroom.png",
                "자연광과 넓은 테이블이 있는 열린 공간입니다.",
                List.of("데스크 램프", "Wi-Fi", "공용 테이블")
            )
        );
    }
}