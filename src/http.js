export async function fetchAvailablePlaces(){
    const response = await fetch('http://localhost:3000/places');
    const resData = await response.json();

    if (!response.ok){
        throw new Error('failed to fetch places');
    }

    return resData.places;
}


export async function updateUserPlaces(places){
    const response = await fetch('http://localhost:3000/user-places', {
        method: 'PUT',

        //JS array are not valid,so we need to convert it to JSON
        body: JSON.stringify({places: places}),

        //this is important to let the backend know what kind of data we are sending
        headers: {
            'Content-Type': 'application/json'

        }
    });

    const resData = await response.json();
    if (!response.ok){
        throw new Error('failed to update places');

    }

    return resData.message;
}
export async function fetchUserPlaces(){
    const response = await fetch('http://localhost:3000/user-places');
    const resData = await response.json();

    if (!response.ok){
        throw new Error('failed to fetch user places');
    }

    return resData.places;
}



