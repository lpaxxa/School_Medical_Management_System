package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    //send to nurses
    public void sendToAllNurses(NotificationDTO notification) {
        messagingTemplate.convertAndSend("/topic/nurses", notification);
    }
    
    //send to parents
    public void sendToParent(String parentAccountId, NotificationDTO notification) {
        messagingTemplate.convertAndSendToUser(
            parentAccountId, 
            "/queue/notifications", 
            notification
        );
    }
    
   // send to specific nurse, using accont id
    public void sendToSpecificNurse(String nurseAccountId, NotificationDTO notification) {
        messagingTemplate.convertAndSendToUser(
            nurseAccountId, 
            "/queue/notifications", 
            notification
        );
    }
    
    // send to all users
    public void broadcastToAll(NotificationDTO notification) {
        messagingTemplate.convertAndSend("/topic/all", notification);
    }
    
  // send to all users with a specific role
    public void sendToRole(String role, NotificationDTO notification) {
        messagingTemplate.convertAndSend("/topic/" + role.toLowerCase(), notification);
    }
} 