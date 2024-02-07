import readFile from "./modules/csv-reader.mjs";

window.onload = () => {
    document.querySelector('form').onsubmit = handleSubmit;
}

const handleSubmit = event => {
    event.preventDefault();
    const [file] = document.getElementById('file-input').files;
    const content = readFile(file);
}