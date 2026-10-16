package com.cje.studyroom.room.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, length = 500)
    private String image;

    @Column(nullable = false, length = 1000)
    private String description;

    @ElementCollection
    @CollectionTable(
        name = "room_amenities",
        joinColumns = @JoinColumn(name = "room_id")
    )
    @OrderColumn(name = "sort_order")
    @Column(name = "amenity", nullable = false, length = 100)
    private List<String> amenities = new ArrayList<>();

    protected Room() {
        // JPA가 객체를 생성할 때 사용합니다.
    }

    public Room(
        String id,
        String name,
        int capacity,
        String image,
        String description,
        List<String> amenities
    ) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.image = image;
        this.description = description;
        this.amenities = new ArrayList<>(amenities);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getCapacity() {
        return capacity;
    }

    public String getImage() {
        return image;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getAmenities() {
        return List.copyOf(amenities);
    }
}