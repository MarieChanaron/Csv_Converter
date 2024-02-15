// Show the logs of the json parsing errors to the interface
const addParsingErrorToHtml = (issueKey, error, jsonString) => {
    
    // Create a div to contain the parsing error for a particular issue
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    
    // Add a small title to indicate which issue key is concerned
    const errorTitle = document.createElement('h3');
    errorTitle.innerHTML = `Erreur pour <span>${issueKey}</span> : `;
    
    // Add a small paragraph to inform that the json object cannot be parsed
    const firstParagraph = document.createElement('p');
    firstParagraph.innerText = `Impossible de parser les données JSON de la colonne ${TEST_STEPS_HEADER}`;
    // Add a small paragraph to log the exact error message returned by the browser
    const secondParagraph = document.createElement('p');
    secondParagraph.innerHTML = `Message : <span>${error}</span>`;
    
    // Add a textarea (with an inner scroll) to display the content of the json object that cannot be parsed
    const textarea = document.createElement('textarea');
    textarea.innerText = jsonString;
    
    // Add the error to the DOM
    errorDiv.appendChild(errorTitle);
    errorDiv.appendChild(firstParagraph);
    errorDiv.appendChild(secondParagraph);
    errorDiv.appendChild(textarea);
    const errorsDivElement = document.getElementById('errors');
    errorsDivElement.appendChild(errorDiv);
    
    // Show the logs
    const logsDiv = document.getElementById('logs');
    logsDiv.removeAttribute('hidden');
}


// Convert a json string into a json object
const parseJsonString = jsonString => {
    let jsonObject;
    let error = false;
    let message = '';

    try {
        jsonObject = JSON.parse(jsonString);
    } catch (errorMessage) {
        error = true;
        message = errorMessage;
        jsonObject = [];
    }

    return {
        jsonObject, 
        error: [error, message]
    };
}


// Make the json string compatible with the json format to be able to read it as an object
const formatJsonString = jsonString => {
    const newJsonString = jsonString.replace(/""/g, '"'); // Replace "" by "
    return newJsonString;
}


// Parse the rows array to extract the json string containing the test steps
// Note: Because the 2 dimensions array contains the json string WITHOUT quotes, it's not possible to read the json string.
// It was complicated to add quotes manually in this json string so the solution was to use the function split() that automatically adds quotes.
// So we get the json string from the rowsArray and not from the twoDArray
const parseJsonData = (row, issueKey) => {
    const firstSection = row.split('[{')[1];
    let secondSection;
    if (firstSection) {
        secondSection = firstSection.split('}]')[0];
        if (secondSection[secondSection.length - 1] === ':') secondSection += '""""';
    }
    let jsonString = secondSection ? `[{${formatJsonString(secondSection)}}]` : '[]';
    
    const {jsonObject, error} = parseJsonString(jsonString);
    if (error[0]) {
        // Add errors to the interface
        addParsingErrorToHtml(issueKey, error[1], jsonString);
        // Show errors in the console
        console.log(`Issue ${issueKey}: Cannot parse JSON data (${TEST_STEPS_HEADER})`);
        console.log(error[1]);
        console.log(jsonString);
    }
    return jsonObject;
}


// Parse our columns by COLUMN_SEPARATOR
const parseRowIntoColumns = row => {
    const columnsArray = [];
    let withinQuotes = false;
    let currentColumn = [];

    for (let i = 0; i < row.length; i ++) {
        const char = row[i];

        if (char === '"') {
            withinQuotes = !withinQuotes;
        } else if (withinQuotes || char !== COLUMN_SEPARATOR) {
            currentColumn.push(char);
        } else {
            const cell = currentColumn.join('');
            columnsArray.push(cell);
            currentColumn = [];
        }
    }
    columnsArray.push(currentColumn); // Push the last column
    return columnsArray;
}


const parseData = content => {
    // Create an array where each item is a row in our table
    const rowsArray = content.split(ROW_SEPARATOR);
    const twoDArray = [];
    let testStepsIndex;

    // Parse our rows array more finely to make a two dimensions array where each item in the second level arrays are the columns
    rowsArray.forEach((row, index) => {
        const columnsArray = parseRowIntoColumns(row);
        if (index === 0) {
            testStepsIndex = columnsArray.indexOf(TEST_STEPS_HEADER);
            if (testStepsIndex === -1) logColumnMissingError(TEST_STEPS_HEADER);
        } else if (testStepsIndex > 0) {
            const jsonObject = parseJsonData(row, columnsArray[0]);
            columnsArray[testStepsIndex] = jsonObject;
        }
        twoDArray.push(columnsArray);
    });

    return twoDArray;
}

export default parseData;