import mongoose, { Schema } from 'mongoose';
import { INotification } from '@/types';

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification sender is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['like', 'comment', 'follow', 'recipe', 'collection'],
      message: 'Notification type must be like, comment, follow, recipe, or collection'
    }
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Notification message cannot exceed 500 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ entityId: 1 });

// Compound index for querying user's unread notifications
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Static method to create notification
NotificationSchema.statics.createNotification = async function(
  recipientId: string,
  senderId: string,
  type: string,
  entityId: string,
  message: string
) {
  // Don't create notification if sender and recipient are the same
  if (recipientId === senderId) {
    return null;
  }

  const notification = new this({
    recipient: recipientId,
    sender: senderId,
    type,
    entityId,
    message
  });

  return await notification.save();
};

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function(notificationIds: string[], userId: string) {
  return await this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId
    },
    { isRead: true }
  );
};

// Static method to mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to get user's notifications with pagination
NotificationSchema.statics.getUserNotifications = function(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  
  return this.find({ recipient: userId })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to clean up old notifications (older than 30 days)
NotificationSchema.statics.cleanupOldNotifications = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return await this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true
  });
};

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema); 