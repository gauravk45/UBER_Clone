const axios = require("axios");
const captainModel = require("../models/captain.model");

// Get Address Coordinates
module.exports.getAddressCoordinate = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      console.error("Geocode API Error:", response.data);
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw error;
  }
};

// Get Distance and Travel Time
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (
      response.data.status === "OK" &&
      response.data.rows.length > 0 &&
      response.data.rows[0].elements.length > 0
    ) {
      const element = response.data.rows[0].elements[0];

      if (element.status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return element; // Contains distance and duration
    } else {
      console.error("Distance Matrix API Error:", response.data);
      throw new Error("Unable to fetch distance and time");
    }
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw error;
  }
};

// Get Autocomplete Suggestions
module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("Input query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === "OK" && response.data.predictions.length > 0) {
      return response.data.predictions.map(
        (prediction) => prediction.description
      );
    } else {
      console.error("Autocomplete API Error:", response.data);
      throw new Error("Unable to fetch suggestions");
    }
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error.message);
    throw error;
  }
};

// Get Captains in a Radius
module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  if (!ltd || !lng || !radius) {
    throw new Error("Latitude, longitude, and radius are required");
  }

  try {
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[ltd, lng], radius / 6371], // Radius in kilometers
        },
      },
    });

    console.log(`Found ${captains.length} captains in the radius`);
    return captains;
  } catch (error) {
    console.error("Error fetching captains in the radius:", error.message);
    throw error;
  }
};
