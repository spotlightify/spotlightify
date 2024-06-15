const baseUrl = 'http://localhost:5000/auth/';

async function storeClientSecret(clientSecret, clientId) {
  try {
    const response = await fetch(`${baseUrl}post-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Use the appropriate content type
      },
      body: JSON.stringify({
        client_secret: clientSecret,
        client_id: clientId,
      }), // Convert the JavaScript object to a JSON string
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the JSON response
    console.log(data); // Handle success
  } catch (error) {
    console.error('Error:', error); // Handle errors
  }
}

document
  .getElementById('auth_form')
  .addEventListener('submit', async function authenticate(e) {
    // Prevent the default form submission
    e.preventDefault();

    // Base URL for Spotify authorization
    const authUrl = 'https://accounts.spotify.com/authorize';

    // Gather form data
    const formData = new FormData(this);

    // Send client secret to the backend
    await storeClientSecret(
      formData.get('client_secret'),
      formData.get('client_id'),
    );

    // Construct the query parameters from form data
    const queryParams = new URLSearchParams();
    formData.forEach((value, key) => {
      queryParams.append(key, value);
    });

    // Optional: Append additional parameters as needed for Spotify authorization
    queryParams.append('redirect_uri', `${baseUrl}callback`); // TODO Make this update dynamically, and all other hardcoded URLs
    queryParams.append('response_type', 'code');
    queryParams.append(
      'scope',
      'streaming user-library-read user-modify-playback-state user-read-playback-state user-library-modify user-follow-read playlist-read-private playlist-read-collaborative user-follow-read playlist-modify-public playlist-modify-private',
    );
    queryParams.append('state', 'spotlightify-state');

    // Redirect to the Spotify authorization URL with query parameters
    window.location = `${authUrl}?${queryParams.toString()}`;
  });
