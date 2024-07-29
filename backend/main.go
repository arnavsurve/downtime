package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan Message)
	upgrader  = websocket.Upgrader{}
	content   string
	version   int
	mu        sync.Mutex
)

type Message struct {
	Content string `json:"content"`
	Version int    `json:"version"`
	// ClientID string `json:"clientID"`
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	log.Println("http server started on ws://localhost:8000/ws")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("Upgrade: ", err)
	}
	defer ws.Close()

	clients[ws] = true

	// Send current content to new client
	mu.Lock()
	err = ws.WriteJSON(Message{Content: content, Version: version})
	mu.Unlock()
	if err != nil {
		log.Printf("WriteJSON: %v", err)
		delete(clients, ws)
		return
	}

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("ReadJSON: %v", err)
			delete(clients, ws)
			break
		}
		mu.Lock()
		if msg.Version > version {
			content = msg.Content
			version = msg.Version
			broadcast <- msg
		}
		mu.Unlock()
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
