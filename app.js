import readFile from "./modules/csv-reader.mjs";
import processData from "./modules/data-processor.mjs";
import writeCsv from "./modules/csv-maker.mjs";

window.onload = () => {
    document.querySelector('form').onsubmit = handleSubmit;
    document.querySelector('input[type="submit"]').onclick = handleClick;
}

const handleSubmit = async(event) => {
    event.preventDefault();
    const spinner = document.getElementById('spinner');
    spinner.classList.remove('display-none');
    const [file] = document.getElementById('file-input').files;
    const fileContent = await readFile(file);
    const twoDArray = processData(fileContent);
    spinner.style.display = 'none';
    writeCsv(twoDArray);
    const confirmationDiv = document.getElementById('confirmation');
    if (twoDArray.length > 1) confirmationDiv.removeAttribute('hidden');
    const logsDiv = document.getElementById('logs');
    logsDiv.removeAttribute('hidden');
}

const handleClick = () => {
    console.clear();
    const errorsDiv = document.getElementById('errors');
    while (errorsDiv.firstChild) {
        errorsDiv.removeChild(errorsDiv.firstChild);
    }
    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.setAttribute('hidden', 'false');
}