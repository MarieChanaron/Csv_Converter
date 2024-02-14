import readFile from "./modules/csv-reader.js";
import writeCsv from "./modules/csv-maker.js";
import parseData from "./modules/csv-parser.js";
import convertData from "./modules/data-processor.js";


const showSpinner= () => {
    const spinner = document.getElementById('spinner');
    spinner.classList.remove('display-none');
}


const hideSpinner = () => {
    const spinner = document.getElementById('spinner');
    spinner.classList.add('display-none');
}


const hideLogs = () => {
    const logsDiv = document.getElementById('logs');
    logsDiv.setAttribute('hidden', 'true');

    // Remove all the DOM elements containing errors (otherwise some errors can be added to the previous errors)
    const errorsDiv = document.getElementById('errors');
    while (errorsDiv.firstChild) {
        errorsDiv.removeChild(errorsDiv.firstChild);
    }
}


const showLogs = (data) => {
    const logsDiv = document.getElementById('logs');
    logsDiv.removeAttribute('hidden');
    if (data.length > 0) {
        confirmation.innerHTML = 'Le fichier a bien été généré. <img src="/images/checked.png" alt="icon" class="icon">';
    } else {
        confirmation.innerHTML = "Le fichier n'a pas pu être généré.";
    }
}


window.onload = () => {
    document.querySelector('form').onsubmit = handleSubmit;
    // document.querySelector('input[type="submit"]').onclick = handleSubmit;
}


const handleSubmit = async(event) => {
    // document.querySelector('form').preventDefault();
    event.preventDefault();
    const [file] = document.getElementById('file-input').files;
    if (!file) {
        alert('Merci de choisir un fichier.');
    } else {
        console.clear();
        showSpinner();
        hideLogs();

        const fileContent = await readFile(file);
        const parsedData = parseData(fileContent);
        const convertedData = convertData(parsedData);
        writeCsv(convertedData);

        hideSpinner();
        showLogs(convertedData);
    }
}