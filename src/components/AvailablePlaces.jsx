import { useEffect, useState } from "react";
import Places from "./Places.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  //these 3 states are "standard" when we work with http requests

  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    //Promise version
    // fetch('http://localhost:3000/places').then((response) => {
    //     return response.json();
    //   }).then((resData) => {
    //     setAvailablePlaces(resData.places);
    //   });

    //Async/Await version
    async function fetchPlaces() {
      //we start fetching the data
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces();

        // we do not get the position instantly
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces);
          //we finished fetching the data
          setIsFetching(false);
        });
      } catch (error) {
        setError({
          message: error.message || "Failed to fetch please try again later",
        });
        //we finished fetching the data
        setIsFetching(false);
      }
    }

    //call the function
    fetchPlaces();
  }, []);

  if (error) {
    return <ErrorMessage title="An error occured!" message={error.message} />;
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Loading places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
