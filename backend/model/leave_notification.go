package model

import (
	"time"

	"gorm.io/gorm"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeLeaveRequested   NotificationType = "LEAVE_REQUESTED"
	NotificationTypeLeaveApproved    NotificationType = "LEAVE_APPROVED"
	NotificationTypeLeaveRejected    NotificationType = "LEAVE_REJECTED"
	NotificationTypeLeaveCancelled   NotificationType = "LEAVE_CANCELLED"
	NotificationTypeApprovalRequired NotificationType = "APPROVAL_REQUIRED"
	NotificationTypeLeaveReminder    NotificationType = "LEAVE_REMINDER"
	NotificationTypeBalanceLow       NotificationType = "BALANCE_LOW"
	NotificationTypeLeaveExpiring    NotificationType = "LEAVE_EXPIRING"
)

// NotificationStatus represents the status of a notification
type NotificationStatus string

const (
	NotificationStatusUnread NotificationStatus = "UNREAD"
	NotificationStatusRead   NotificationStatus = "READ"
	NotificationStatusSent   NotificationStatus = "SENT"
	NotificationStatusFailed NotificationStatus = "FAILED"
)

// LeaveNotification represents a notification related to leave requests
type LeaveNotification struct {
	ID               uint               `gorm:"primaryKey"`
	UserID           uint               `gorm:"not null"` // User who receives the notification
	LeaveRequestID   *uint              `gorm:"null"`     // Related leave request (if applicable)
	NotificationType NotificationType   `gorm:"not null"`
	Title            string             `gorm:"not null"`
	Message          string             `gorm:"type:text;not null"`
	Status           NotificationStatus `gorm:"default:'UNREAD'"`
	IsRead           bool               `gorm:"default:false"`
	ReadAt           *time.Time
	SentAt           *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt

	// Relationships
	User         User          `gorm:"foreignKey:UserID"`
	LeaveRequest *LeaveRequest `gorm:"foreignKey:LeaveRequestID"`
}

// LeaveNotificationModel handles leave notification database operations
type LeaveNotificationModel struct {
	db *gorm.DB
}

func NewLeaveNotificationModel(db *gorm.DB) *LeaveNotificationModel {
	return &LeaveNotificationModel{
		db: db,
	}
}

// CreateNotification creates a new notification
func (l *LeaveNotificationModel) CreateNotification(notification *LeaveNotification) error {
	return l.db.Create(notification).Error
}

// GetUserNotifications retrieves notifications for a user
func (l *LeaveNotificationModel) GetUserNotifications(userID uint, limit int, offset int) ([]LeaveNotification, error) {
	var notifications []LeaveNotification
	query := l.db.Where("user_id = ?", userID).
		Preload("User").Preload("LeaveRequest").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

// GetUnreadNotifications retrieves unread notifications for a user
func (l *LeaveNotificationModel) GetUnreadNotifications(userID uint) ([]LeaveNotification, error) {
	var notifications []LeaveNotification
	if err := l.db.Where("user_id = ? AND is_read = ?", userID, false).
		Preload("User").Preload("LeaveRequest").
		Order("created_at DESC").
		Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (l *LeaveNotificationModel) MarkAsRead(notificationID uint, userID uint) error {
	now := time.Now()
	return l.db.Model(&LeaveNotification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": &now,
			"status":  NotificationStatusRead,
		}).Error
}

// MarkAllAsRead marks all notifications as read for a user
func (l *LeaveNotificationModel) MarkAllAsRead(userID uint) error {
	now := time.Now()
	return l.db.Model(&LeaveNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": &now,
			"status":  NotificationStatusRead,
		}).Error
}

// GetNotificationCount returns the count of unread notifications for a user
func (l *LeaveNotificationModel) GetNotificationCount(userID uint) (int64, error) {
	var count int64
	if err := l.db.Model(&LeaveNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CreateLeaveRequestNotification creates a notification for a new leave request
func (l *LeaveNotificationModel) CreateLeaveRequestNotification(leaveRequest *LeaveRequest, approverID uint) error {
	notification := &LeaveNotification{
		UserID:           approverID,
		LeaveRequestID:   &leaveRequest.ID,
		NotificationType: NotificationTypeLeaveRequested,
		Title:            "New Leave Request",
		Message:          "A new leave request has been submitted and requires your approval.",
		Status:           NotificationStatusUnread,
		IsRead:           false,
	}
	return l.CreateNotification(notification)
}

// CreateApprovalNotification creates a notification for leave request approval
func (l *LeaveNotificationModel) CreateApprovalNotification(leaveRequest *LeaveRequest, approved bool) error {
	var notificationType NotificationType
	var title, message string

	if approved {
		notificationType = NotificationTypeLeaveApproved
		title = "Leave Request Approved"
		message = "Your leave request has been approved."
	} else {
		notificationType = NotificationTypeLeaveRejected
		title = "Leave Request Rejected"
		message = "Your leave request has been rejected."
	}

	notification := &LeaveNotification{
		UserID:           leaveRequest.UserID,
		LeaveRequestID:   &leaveRequest.ID,
		NotificationType: notificationType,
		Title:            title,
		Message:          message,
		Status:           NotificationStatusUnread,
		IsRead:           false,
	}
	return l.CreateNotification(notification)
}

// CreateCancellationNotification creates a notification for leave request cancellation
func (l *LeaveNotificationModel) CreateCancellationNotification(leaveRequest *LeaveRequest) error {
	notification := &LeaveNotification{
		UserID:           leaveRequest.UserID,
		LeaveRequestID:   &leaveRequest.ID,
		NotificationType: NotificationTypeLeaveCancelled,
		Title:            "Leave Request Cancelled",
		Message:          "Your leave request has been cancelled.",
		Status:           NotificationStatusUnread,
		IsRead:           false,
	}
	return l.CreateNotification(notification)
}

// CreateBalanceLowNotification creates a notification for low leave balance
func (l *LeaveNotificationModel) CreateBalanceLowNotification(userID uint, leaveType LeaveType, remainingDays int) error {
	notification := &LeaveNotification{
		UserID:           userID,
		LeaveRequestID:   nil,
		NotificationType: NotificationTypeBalanceLow,
		Title:            "Low Leave Balance",
		Message:          "Your " + string(leaveType) + " leave balance is low. You have " + string(rune(remainingDays)) + " days remaining.",
		Status:           NotificationStatusUnread,
		IsRead:           false,
	}
	return l.CreateNotification(notification)
}

// CreateReminderNotification creates a reminder notification
func (l *LeaveNotificationModel) CreateReminderNotification(userID uint, leaveRequestID uint, message string) error {
	notification := &LeaveNotification{
		UserID:           userID,
		LeaveRequestID:   &leaveRequestID,
		NotificationType: NotificationTypeLeaveReminder,
		Title:            "Leave Request Reminder",
		Message:          message,
		Status:           NotificationStatusUnread,
		IsRead:           false,
	}
	return l.CreateNotification(notification)
}

// GetNotificationsByType retrieves notifications by type for a user
func (l *LeaveNotificationModel) GetNotificationsByType(userID uint, notificationType NotificationType) ([]LeaveNotification, error) {
	var notifications []LeaveNotification
	if err := l.db.Where("user_id = ? AND notification_type = ?", userID, notificationType).
		Preload("User").Preload("LeaveRequest").
		Order("created_at DESC").
		Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

// DeleteOldNotifications deletes notifications older than specified days
func (l *LeaveNotificationModel) DeleteOldNotifications(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	return l.db.Where("created_at < ? AND is_read = ?", cutoffDate, true).Delete(&LeaveNotification{}).Error
}

// GetNotificationStats returns notification statistics
func (l *LeaveNotificationModel) GetNotificationStats(userID uint) (map[string]int64, error) {
	stats := make(map[string]int64)

	// Total notifications
	var totalCount int64
	if err := l.db.Model(&LeaveNotification{}).Where("user_id = ?", userID).Count(&totalCount).Error; err != nil {
		return nil, err
	}
	stats["total"] = totalCount

	// Unread notifications
	var unreadCount int64
	if err := l.db.Model(&LeaveNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount).Error; err != nil {
		return nil, err
	}
	stats["unread"] = unreadCount

	// Notifications by type
	notificationTypes := []NotificationType{
		NotificationTypeLeaveRequested,
		NotificationTypeLeaveApproved,
		NotificationTypeLeaveRejected,
		NotificationTypeLeaveCancelled,
		NotificationTypeApprovalRequired,
		NotificationTypeLeaveReminder,
		NotificationTypeBalanceLow,
		NotificationTypeLeaveExpiring,
	}

	for _, notificationType := range notificationTypes {
		var count int64
		if err := l.db.Model(&LeaveNotification{}).
			Where("user_id = ? AND notification_type = ?", userID, notificationType).
			Count(&count).Error; err != nil {
			return nil, err
		}
		stats[string(notificationType)] = count
	}

	return stats, nil
}

// BulkCreateNotifications creates multiple notifications at once
func (l *LeaveNotificationModel) BulkCreateNotifications(notifications []LeaveNotification) error {
	if len(notifications) == 0 {
		return nil
	}
	return l.db.Create(&notifications).Error
}
