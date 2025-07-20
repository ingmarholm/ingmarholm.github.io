document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const MANIFEST_FILE = 'images.json';

    // --- DOM ELEMENTS (The parts of the HTML we need to control) ---
    const numSelector = document.getElementById('num-selector');
    const letterSelector = document.getElementById('letter-selector');
    const plotImage = document.getElementById('plot-image');
    const imagePlaceholder = document.getElementById('image-placeholder');

    // --- THE STATE OBJECT (Single Source of Truth) ---
    // All important data for our app lives here.
    const state = {
        imageManifest: {},
        availableNums: [],
        availableLetters: [],
        selectedNum: null,
        selectedLetter: null,
    };

    // --- THE RENDER FUNCTION (Makes the HTML match the State) ---
    // This function runs every time we need to update what the user sees.
    const render = () => {
        // 1. Render the Number Buttons
        // Update the class of each button based on the current state.
        numSelector.querySelectorAll('button').forEach(button => {
            button.classList.toggle('selected', button.dataset.value === state.selectedNum);
        });

        // 2. Render the Letter Buttons
        letterSelector.querySelectorAll('button').forEach(button => {
            button.classList.toggle('selected', button.dataset.value === state.selectedLetter);
        });

        // 3. Render the Image
        // Only try to show an image if both a number and letter are selected.
        if (state.selectedNum && state.selectedLetter) {
            const plotId = `${state.selectedNum}${state.selectedLetter}`;
            const imagePath = state.imageManifest[plotId];

            if (imagePath) {
                plotImage.src = imagePath;
                plotImage.style.display = 'block'; // Show the image tag
                imagePlaceholder.style.display = 'none'; // Hide the placeholder text
            } else {
                // This handles an unlikely case where the image is missing from the manifest
                plotImage.style.display = 'none';
                imagePlaceholder.style.display = 'block';
                imagePlaceholder.textContent = `Image for ${plotId} not found.`;
            }
        } else {
            // If a selection is missing, show the placeholder
            plotImage.style.display = 'none';
            imagePlaceholder.style.display = 'block';
            imagePlaceholder.textContent = 'Please select a Group and a Type to view a plot.';
        }
    };

    // --- EVENT HANDLERS (Update state and then call render) ---
    const setupEventListeners = () => {
        // Use event delegation: listen for clicks on the parent container.
        // This is more efficient than adding a listener to every single button.
        numSelector.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                state.selectedNum = event.target.dataset.value; // Update state
                render(); // Re-render the entire UI
            }
        });

        letterSelector.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                state.selectedLetter = event.target.dataset.value; // Update state
                render(); // Re-render the entire UI
            }
        });
    };

    // --- INITIALIZATION (Fetches data and starts the app) ---
    const initialize = async () => {
        try {
            // Fetch the manifest. Add a cache-buster to ensure we get the latest version.
            const response = await fetch(`${MANIFEST_FILE}?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            state.imageManifest = await response.json();

            // Dynamically figure out what buttons to create from the manifest keys
            const plotIds = Object.keys(state.imageManifest);
            const nums = new Set(plotIds.map(id => id.charAt(0)));
            const letters = new Set(plotIds.map(id => id.charAt(1)));

            state.availableNums = [...nums].sort();
            state.availableLetters = [...letters].sort();

            // Create the button HTML
            numSelector.innerHTML = state.availableNums.map(num => `<button data-value="${num}">${num}</button>`).join('');
            letterSelector.innerHTML = state.availableLetters.map(letter => `<button data-value="${letter}">${letter}</button>`).join('');
            
            // Set up the click handlers
            setupEventListeners();
            
            // Set the initial default selection
            if (state.availableNums.length > 0) {
                state.selectedNum = state.availableNums[0];
            }
            if (state.availableLetters.length > 0) {
                state.selectedLetter = state.availableLetters[0];
            }

            // Perform the first render to show the default state on page load
            render();

        } catch (error) {
            console.error("Failed to initialize application:", error);
            imagePlaceholder.textContent = "Error: Could not load plot data. Please check the console.";
        }
    };

    // Start the application!
    initialize();
});