import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";

function App() {
  const selectedPlace = useRef();

  // We use these 3 states as "standard" when we work with http requests
  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  //if some error happens during the update request
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    setIsFetching(true);
    async function fetchPlaces() {
      //if fetching the user places fails, we do not want to break the app
      try{
        const userPlaces = await fetchUserPlaces();
        setUserPlaces(userPlaces);
        setIsFetching(false);
      } catch (error) {
        setError({
          message: error.message || 'Failed to fetch user places. Please try again later.'
        });
        setIsFetching(false);

      }

    }

    fetchPlaces();
    },[]);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      //we update the state back to the previous state
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message:
          error.message || "Failed to update places. Please try again later.",
      });
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try{
      await updateUserPlaces(
      userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error){
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: error.message || 'Failed to update places. Please try again later.'});
    }


    setModalIsOpen(false);
  }, [userPlaces]);

  function clearError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={!!errorUpdatingPlaces} onClose={clearError}>
        {errorUpdatingPlaces && (
          <ErrorMessage
            title="An error occurred!"
            message={errorUpdatingPlaces?.message}
            onConfirm={clearError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <ErrorMessage title="An error occured!" message={error.message} />}
        {!error && (<Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          isLoading={isFetching}
          loadingText="Loading user places..."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
