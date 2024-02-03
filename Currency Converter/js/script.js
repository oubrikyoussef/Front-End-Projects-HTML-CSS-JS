run();

async function run() {
    const selectElements = Array.from(document.querySelectorAll('select'));
    const exchangeRate = document.querySelector('.form__exchange-rate');
    const input = document.querySelector('input');

    let fetchedData = JSON.parse(window.localStorage.getItem("fetchedData"));
    await checkLocalStorage();
    const currencies = fetchedData.rates;

    initialize();
    getLatestUpdate();
    calcExchangeRateOnSubmit();
    setFlagOnInput();
    iconsAlternation();

    async function checkLocalStorage() {
        if (fetchedData) {
            let currentTime = new Date();
            const elapsedTime = currentTime.getTime(); // Ms Elapsed Since Epoch Time (In Local Time Zone)
            const timezoneOffset = currentTime.getTimezoneOffset() * 60 * 1000;
            currentTime = elapsedTime - timezoneOffset;
            const latestUpdate = new Date(fetchedData.date).getTime();
            const dayInMs = 86400000;

            if (currentTime - latestUpdate >= dayInMs) {
                fetchedData = await fetchData("0c0dd52befec42fa8223a44d63ebb1ba", "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=");
            }
        } else {
            fetchedData = await fetchData("0c0dd52befec42fa8223a44d63ebb1ba", "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=");
        }
    }

    function initialize() {
        for (let i = 0; i < selectElements.length; i++) {
            for (const currency in country_list) {
                const option = document.createElement('option');
                option.innerText = currency;
                selectElements[i].append(option);
                if (i === 0 && currency === "USD" || i === 1 && currency === "MAD") {
                    const selected = document.createAttribute("selected");
                    option.setAttributeNode(selected);
                    getFlags(selectElements[i], false)
                }
            }
        }
    }

    function getLatestUpdate() {
        const date = document.querySelector('.form__latest-update span');
        const time = fetchedData.date.split(" ")[1];
        const day = fetchedData.date.split(" ")[0];
        date.innerText = day + " at " + time;
    }

    function calcExchangeRateOnSubmit() {
        const form = document.querySelector('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calcExchangeRate();
        });
    }

    function setFlagOnInput() {
        selectElements.forEach((selectElement) => selectElement.addEventListener("input", () => { getFlags(selectElement, true) }));
    }

    function iconsAlternation() {
        const alternateIcon = document.querySelector('i');
        alternateIcon.addEventListener("click", () => {
            [selectElements[0].value, selectElements[1].value] = [selectElements[1].value, selectElements[0].value];

            selectElements.forEach((selectElement) => {
                getFlags(selectElement, true);
            });
        });
    }

    function calcExchangeRate() {
        let amount = input.value.trim();
        if (!isNaN(+amount)) {
            amount = amount !== "" ? +amount : 1;
            const fromCurrency = selectElements[0].value;
            const toCurrency = selectElements[1].value;
            const fromValue = currencies[fromCurrency];
            const toValue = currencies[toCurrency];
            const converted = (toValue / fromValue) * amount;
            exchangeRate.innerText = `${amount} ${fromCurrency} = ${converted !== 0 ? converted.toFixed(5) : converted} ${toCurrency}`;
        } else {
            exchangeRate.innerText = `Please Enter A Valid Non-Negative Number`;
        }
    }

    function getFlags(selectElement, calculate) {
        const countryName = country_list[selectElement.value].toLowerCase();
        const img = selectElement.previousElementSibling;
        img.src = `https://flagcdn.com/w20/${countryName}.png`;
        if (calculate)
            calcExchangeRate();
    }

    async function fetchData(apiKey, apiUrl) {
        try {
            exchangeRate.innerText = `Loading Data ...`;
            const response = await fetch(apiUrl + apiKey);
            const fetchedData = await response.json();
            window.localStorage.setItem("fetchedData", JSON.stringify(fetchedData));
            exchangeRate.innerText = `Here you'll be able to see the exchange rate`;
            return fetchedData;
        } catch (error) {
            console.error(`Failed because of ${error}, Please try again later`);
        }
    }
}
