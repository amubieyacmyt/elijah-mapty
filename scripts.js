document.addEventListener('DOMContentLoaded', () => {
    const continentButtons = document.querySelectorAll('.continent-button');
    const infoBox = document.getElementById('country-info');
    const worldMapContainer = document.getElementById('world-map');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('country-search');
    const spinner = document.getElementById('spinner');

    const continents = {
        africa: 'Africa',
        asia: 'Asia',
        europe: 'Europe',
        'north-america': 'North America',
        'south-america': 'South America',
        australia: 'Oceania',
      
    };

    let map;
    let marker; // To keep track of the current marker
    const countryCache = {};
    //console.log(countryCache)

    async function fetchCountries() {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/all`);
           // console.log(response)
            if (!response.ok) {
                throw new Error(`Error fetching country data: ${response.statusText}`);
            }
            const data = await response.json();
            //console.log(data)
            return data;
        } catch (error) {
            console.error('Failed to fetch country data', error);
            return [];
        }
    }

    function groupCountriesByContinent(countries) {
        const groupedCountries = {
            africa: [],
            asia: [],
            europe: [],
            'north-america': [],
            'south-america': [],
            australia: [],
           // antarctica: []
        };

        countries.forEach(country => {
            const continent = country.continents[0];
            //console.log(continent)
            for (const key in continents) {
                if (continents[key] === continent) {
                    groupedCountries[key].push(country);
                    break;
                }
            }
        });
        return groupedCountries;
    }

    async function displayCountries(continentId) {
        showSpinner();
        infoBox.innerHTML = '<p class="load"></p>';
        worldMapContainer.innerHTML = ''; // Clear the map container

        let countries;
        if (countryCache[continentId]) {
            countries = countryCache[continentId];
        } else {
            const allCountries = await fetchCountries();
            const groupedCountries = groupCountriesByContinent(allCountries);
            countryCache[continentId] = groupedCountries[continentId];
            countries = countryCache[continentId];
        }

        infoBox.innerHTML = '';

        for (const country of countries) {
            const countryCard = document.createElement('div');
            countryCard.classList.add('country-card');

            const currencyNames = country.currencies
                ? Object.values(country.currencies).map(currency => currency.symbol).join(', ')
                : 'N/A';

            countryCard.innerHTML = `
                <img src="${country.flags.svg}" alt="${country.name.common} Flag">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
                <p><strong>Currency:</strong> ${currencyNames}</p>
                <button class="view-map-button" data-latlng="${country.latlng}">View on Map</button>
            `;

            infoBox.appendChild(countryCard);
        }

        document.querySelectorAll('.view-map-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const latlng = event.target.getAttribute('data-latlng').split(',').map(Number);
                infoBox.innerHTML = ''; // Clear all country cards
                displayMap(latlng);
            });
        });

        hideSpinner();
        infoBox.scrollIntoView({ behavior: 'smooth' }); // Scroll to infoBox
    }

    continentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const continentId = button.getAttribute('data-continent');
            await displayCountries(continentId);
        });
    });

    async function searchCountry(countryName) {
        showSpinner();
        const allCountries = await fetchCountries();
        const country = allCountries.find(c => c.name.common.toLowerCase() === countryName.toLowerCase());

        if (country) {
            infoBox.innerHTML = ''; // Clear any existing country cards
            worldMapContainer.innerHTML = ''; // Clear the map container

            const countryCard = document.createElement('div');
            countryCard.classList.add('country-card');

            const currencyNames = country.currencies
                ? Object.values(country.currencies).map(currency => currency.symbol).join(', ')
                : 'N/A';

            countryCard.innerHTML = `
                <img src="${country.flags.svg}" alt="${country.name.common} Flag">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
                <p><strong>Currency:</strong> ${currencyNames}</p>
                <button class="view-map-button" data-latlng="${country.latlng}">View on Map</button>
            `;

            infoBox.appendChild(countryCard);

            document.querySelector('.view-map-button').addEventListener('click', (event) => {
                const latlng = event.target.getAttribute('data-latlng').split(',').map(Number);
                infoBox.innerHTML = ''; // Clear all country cards
                displayMap(latlng);
            });
        } else {
            infoBox.innerHTML = '<p>Country not found</p>';
        }

        hideSpinner();
        infoBox.scrollIntoView({ behavior: 'smooth' }); // Scroll to infoBox
    }
    

    searchButton.addEventListener('click', () => {
        const countryName = searchInput.value.trim();
        if (countryName) {
            searchCountry(countryName);
            searchInput.value = ''; // Clear the search input
        }
    });

    // Example of how to use the groupCountriesByContinent function
    fetchCountries().then(countries => {
        const grouped = groupCountriesByContinent(countries);
        // displayCountries(countries); // This line seems incorrect
        // Consider displaying a default continent's countries or removing this call
    });

    // Function to display map given latitude and longitude
    function displayMap(latlng) {
        showSpinner();
        if (map) {
            map.remove(); // Remove existing map if any
        }

        // Make the container visible before initializing the map
        worldMapContainer.classList.remove('hidden');

        // Scroll to the map container
        worldMapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        map = L.map(worldMapContainer).setView(latlng, 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        if (marker) {
            marker.remove(); // Remove existing marker if any
        }

        marker = L.marker(latlng).addTo(map);
        hideSpinner();
    }

    // Show spinner
    function showSpinner() {
        spinner.classList.remove('hidden');
    }

    // Hide spinner
    function hideSpinner() {
        spinner.classList.add('hidden');
    }
});
