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
    let jsonString = secondSection ? `[{${formatAsJsonString(secondSection)}}]` : '[]';
    
    const {jsonObject, error} = parseJsonString(jsonString);
    if (error[0]) {
        logParsingError(issueKey, error[1], jsonString, TEST_STEPS_HEADER);
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
            testStepsIndex = getColumnIndex(TEST_STEPS_HEADER, columnsArray);
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