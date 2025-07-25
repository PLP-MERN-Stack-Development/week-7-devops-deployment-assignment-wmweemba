/ Registers the service worker for offline capabilities and caching.
export function registerServiceWorker() {
  // Check if the browser supports service workers.
  if ('serviceWorker' in navigator) {
    // Add an event listener to register the service worker once the window has loaded.
    window.addEventListener('load', () => {
      // Register the service worker located at '/sw.js'.
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Log successful service worker registration.
          console.log('Service Worker registered: ', registration);
        })
        .catch((registrationError) => {
          // Log any errors encountered during service worker registration.
          console.log('Service Worker registration failed: ', registrationError);
        });
    });
  }
}

// Manages the display and handling of the browser's "Add to Home Screen" prompt.
export function showInstallPrompt() {
  let deferredPrompt: Event | null; // Use Event type for 'e' and allow null

  // Listen for the 'beforeinstallprompt' event, which fires when the browser is ready to show the prompt.
  window.addEventListener('beforeinstallprompt', (_e: Event) => { // Renamed 'e' to '_e' to suppress TS6133
    // Prevent Chrome 67 and earlier from automatically showing the prompt.
    _e.preventDefault();
    // Stash the event so it can be triggered later by user interaction.
    deferredPrompt = _e;

    // Get the custom install button from the DOM.
    const installButton = document.getElementById('install-button');
    if (installButton) {
      // Make the install button visible.
      installButton.style.display = 'block';
      // Add a click listener to the install button.
      installButton.addEventListener('click', () => { // Removed 'e' parameter as it's not used here
        // Hide the app-provided install promotion button.
        if (installButton) { // Check if installButton exists before accessing style
          installButton.style.display = 'none';
        }

        // Show the browser's native install prompt.
        if (deferredPrompt) { // Ensure deferredPrompt is not null before calling prompt
          (deferredPrompt as any).prompt(); // Cast to any to access prompt() method

          // Wait for the user to respond to the prompt.
          (deferredPrompt as any).userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
            // Clear the deferred prompt reference after user choice.
            deferredPrompt = null;
          });
        }
      });
    }
  });
}

// Checks and updates the application's online/offline status.
export function checkOnlineStatus() {
  // Function to update the DOM and log connection status.
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    // Set a data attribute on the body to reflect the connection status.
    document.body.setAttribute('data-connection', status);

    // Show notification when going offline/online.
    if (status === 'offline') {
      // Log offline status.
      console.log('App is now offline');
    } else {
      // Log online status.
      console.log('App is back online');
    }
  };

  // Add event listeners for online and offline events.
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  // Call immediately to set initial status.
  updateOnlineStatus();
}
