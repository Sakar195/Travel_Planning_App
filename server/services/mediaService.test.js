const mongoose = require('mongoose');
const Image = require('../models/Image');
const mediaService = require('./mediaService');

// Mock the Image model
jest.mock('../models/Image');

describe('MediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMedia', () => {
    it('should create a new media entry', async () => {
      // Arrange
      const mediaData = {
        userId: new mongoose.Types.ObjectId(),
        rideId: new mongoose.Types.ObjectId(),
        mediaType: 'Photo',
        mediaUrl: '/uploads/test-image.jpg',
        description: 'Test description'
      };

      const savedMedia = { 
        ...mediaData,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      };
      
      Image.create.mockResolvedValue(savedMedia);

      // Act
      const result = await mediaService.saveMedia(mediaData);

      // Assert
      expect(Image.create).toHaveBeenCalledWith(mediaData);
      expect(result).toEqual(savedMedia);
    });

    it('should throw an error if media creation fails', async () => {
      // Arrange
      const mediaData = {
        userId: new mongoose.Types.ObjectId(),
        // Missing required fields
      };
      
      const error = new Error('Validation failed');
      Image.create.mockRejectedValue(error);

      // Act & Assert
      await expect(mediaService.saveMedia(mediaData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getUserMedia', () => {
    it('should return media for a user', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId();
      const media = [
        { _id: new mongoose.Types.ObjectId(), userId, mediaType: 'Photo' },
        { _id: new mongoose.Types.ObjectId(), userId, mediaType: 'Video' }
      ];
      
      const query = Image.find.mockReturnThis();
      query.sort = jest.fn().mockReturnThis();
      query.populate = jest.fn().mockReturnThis();
      query.exec = jest.fn().mockResolvedValue(media);

      // Act
      const result = await mediaService.getUserMedia(userId);

      // Assert
      expect(Image.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(media);
    });
  });

  describe('getRideMedia', () => {
    it('should return media for a ride', async () => {
      // Arrange
      const rideId = new mongoose.Types.ObjectId();
      const media = [
        { _id: new mongoose.Types.ObjectId(), rideId, mediaType: 'Photo' },
        { _id: new mongoose.Types.ObjectId(), rideId, mediaType: 'Photo' }
      ];
      
      const query = Image.find.mockReturnThis();
      query.sort = jest.fn().mockReturnThis();
      query.populate = jest.fn().mockReturnThis();
      query.exec = jest.fn().mockResolvedValue(media);

      // Act
      const result = await mediaService.getRideMedia(rideId);

      // Assert
      expect(Image.find).toHaveBeenCalledWith({ rideId });
      expect(result).toEqual(media);
    });
  });

  describe('getMediaById', () => {
    it('should return a media by ID', async () => {
      // Arrange
      const mediaId = new mongoose.Types.ObjectId();
      const media = { 
        _id: mediaId, 
        userId: new mongoose.Types.ObjectId(),
        mediaType: 'Photo' 
      };
      
      const query = Image.findById.mockReturnThis();
      query.populate = jest.fn().mockReturnThis();
      query.exec = jest.fn().mockResolvedValue(media);

      // Act
      const result = await mediaService.getMediaById(mediaId);

      // Assert
      expect(Image.findById).toHaveBeenCalledWith(mediaId);
      expect(result).toEqual(media);
    });

 