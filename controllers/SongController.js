require('dotenv').config();
const mongoose = require('mongoose');
const path = require("path");
const fs = require("fs").promises;
const Song = require("../models/Song");


const createSong = async (req, res) => {
  try {
    console.log("fileee", req.file);
    console.log("req.user", req.user);
    req.body.userId = req.user.id;
    const artworkFile = req.file
   
    const songData = req.body;
    const newSong = new Song(songData);
    
    filePath = path.join(
      __dirname,
      "..",
      "/public/storage/artworks",
      artworkFile.originalname
    );
    
    await fs.writeFile(filePath, artworkFile.buffer);
    newSong.artwork = process.env.STATIC_FILE_BASE_PATH + artworkFile.originalname;
    await newSong.save();
    return res.status(201).json({
      success: true,
      message: "Song created successfully!",
      data: newSong,
    });
  } catch (error) {
    console.error(`error creating a song: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Failed to create a Song." + error.message,
      data: null,
    });
  }
};

const fetchSongById = async (req, res) => {
  try {
    const songId = req.params.songId;
    const userId = req.user.id;
    const song = await Song.find({_id:songId, userId: userId});
    if (song) {
      return res.status(200).json({
        success: true,
        message: "Song found!",
        data: song,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Song not found.",
        data: null,
      });
    }
  } catch (error) {
    console.error(`error fetching a song: ${error}`);
    return res.status(500).json({
      success: false,
      message: "error fetching a song:" + error.message,
      data: null,
    });
  }
};

const fetchAllSongs = async (req, res) => {
  try {
    const userId = req.user.id;
    const songs = await Song.find({userId: userId});
    if (songs) {
      return res.status(200).json({
        success: true,
        message: "Song found!",
        data: songs,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Songs not found.",
        data: null,
      });
    }
  } catch (error) {
    console.error(`error fetching a songs: ${error}`);
    return res.status(500).json({
      success: false,
      message: "error fetching a songs:" + error.message,
      data: null,
    });
  }
};

const updateSong = async (req, res) => {
  try {
    console.log("fileee", req.file);
    const userId = req.user.id;
    const artworkFile = req.file
    const songId = req.params.songId;
    if(artworkFile){
      filePath = path.join(
        __dirname,
        "..",
        "/public/storage/artworks",
        artworkFile.originalname
      );
      await fs.writeFile(filePath, artworkFile.buffer);
      req.body.artwork = process.env.STATIC_FILE_BASE_PATH + artworkFile.originalname
    }
    const updatedSong = await Song.findOneAndUpdate(
      { _id: songId, userId: userId },
      { $set: req.body },
      { new: true }
    );
    
    
    if (updatedSong) {
      
      return res.status(200).json({
        success: true,
        message: "Song updated",
        data: updatedSong,
      });
    } else {
      throw new Error("error updating song with id " + songId);
    }
  } catch (error) {
    console.error(`error updating a song: ${error}`);
    return res.status(500).json({
      success: false,
      message: "error updating a song:" + error.message,
      data: null,
    });
  }
};

const deleteSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    const song = await Song.findOneAndDelete({_id:songId, userId: userId});
    if (song) {
      return res.status(204).json({
        success: true,
        message: "song deleted",
        data: null,
      });
    } else {
      throw new Error("Could not delete song with id " + songId);
    }
  } catch (error) {
    console.error(`error deleting a song: ${error}`);

    return res.status(500).json({
      success: false,
      message: "error deleting a song:" + error.message,
      data: null,
    });
  }
};
const fetchStats = async (req, res) => {


  try {
    let userId = null;

    if ( mongoose.Types.ObjectId.isValid(req.user.id)) {
      userId = new mongoose.Types.ObjectId(req.user.id);
    }

     // Fetch the total number of songs for the user
     const totalSongs = await Song.countDocuments({ userId });

     // Fetch the total number of unique artists for the user's songs
     const totalArtists = (await Song.distinct('artist', { userId })).length;
 
     // Fetch the total number of unique albums for the user's songs
     const totalAlbums = (await Song.distinct('album', { userId })).length;
 
     // Fetch the total number of unique genres for the user's songs
     const totalGenres = (await Song.distinct('genre', { userId })).length;

    // Fetch the number of songs in each genre for the user's songs
    const songsPerGenre = await Song.aggregate([
      { $match: { userId } },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
    ]);

    // Fetch the number of songs and albums each artist has for the user's songs
    const songsAndAlbumsPerArtist = await Song.aggregate([
      { $match: { userId } },
      { $group: { _id: "$artist", songs: { $sum: 1 }, albums: { $addToSet: "$album" } } },
      { $project: { _id: 1, songs: 1, albumCount: { $size: "$albums" } } },
    ]);

    // Fetch the number of songs in each album for the user's songs
    const songsPerAlbum = await Song.aggregate([
      { $match: { userId } },
      { $group: { _id: "$album", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched song statistics successfully",
      data: {
        totalSongs,
        totalArtists,
        totalAlbums,
        totalGenres,
        songsPerGenre,
        songsAndAlbumsPerArtist,
        songsPerAlbum,
      },
    });
  } catch (error) {
    console.error(`Error fetching stats: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching stats.",
    });
  }
};


module.exports = {
  createSong,
  fetchSongById,
  fetchAllSongs,
  updateSong,
  deleteSong,
  fetchStats
};
