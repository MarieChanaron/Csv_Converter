import readFile from "./modules/csv-reader.mjs";
import processData from "./modules/data-processor.mjs";
import writeCsv from "./modules/csv-maker.mjs";

window.onload = () => {
    document.querySelector('form').onsubmit = handleSubmit;
}

const handleSubmit = async(event) => {
    event.preventDefault();
    const [file] = document.getElementById('file-input').files;
    const fileContent = await readFile(file);
    const twoDArray = processData(fileContent);
    writeCsv(twoDArray);
}