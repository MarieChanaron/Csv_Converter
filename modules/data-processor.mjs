let rowsArray = [];
let twoDArray = [];
let convertedData = [];
let columnsCount = {};


/*
Matching between the input file and the output file.
On the left (key): input file
On the right (value): output file
*/
const headers = {
    "Issue Key": "Issue key",
    "Type": "Issue Type",
    "Test Type": "Custom field (Test Type)",
    "Status": "Status",
    "TCID": undefined,
    "Summary": "Summary",
    "Description": "Description",
    "Action": undefined,
    "Data": undefined,
    "Result": undefined,
    "Priority": "Priority",
    "Components": "Component/s",
    "Test Repository Path": "Custom field (Test Repository Path)",
    "Link \"Tests\"": "Outward issue link (Tests)",
    "Link \"Defect\"": "Outward issue link (Defect)",
    "Link \"Blocks\"": "Outward issue link (Blocks)",
    "Link \"Relates\"": "Outward issue link (Relates)",
    "Link \"Cloners\"": "Outward issue link (Cloners)",
    "Reporter": "Reporter",
    "Assignee": "Assignee",
    "Label": "Labels",
    "Custom field (Test Level)": "Custom field (Test Level)",
    "Custom field (Steps Count)": "Custom field (Steps Count)",
    "Environment": "Environment",
    "Created": "Created"
}


const countHeaders = () => {
    let headersCount = twoDArray[0].reduce((accumulator, currentValue) => {
        return accumulator[currentValue] ? ++accumulator[currentValue] :
                                            accumulator[currentValue] = 1,
                                            accumulator
    }, {});
    return headersCount;
}


const convertData = ({rows, columns}) => {
    rowsArray = rows;
    twoDArray = columns;
    columnsCount = countHeaders();

    for (let i = 0; i < twoDArray.length; i ++) {
        convertedData[i] = [];
    }

    for (const header in headers) {
        copyPasteValues(headers[header], header);
    }

    addManualTestSteps();
    return convertedData;
}


const copyPasteValues = (inputHeader, outputHeader) => {
    let indexCol = getColumnIndex(inputHeader);
    if (inputHeader && indexCol === -1) {
        console.log(`La colonne ${inputHeader} n'existe pas dans le fichier d'origine.`);
    }
    let count = columnsCount[inputHeader];
    
    for (let i = 0; (count && i < columnsCount[inputHeader]) || (!count && i < 1); i ++) {
        const length = convertedData[0].length; // To place the new column just after the previous one
        convertedData[0][length] = outputHeader;

        for (let indexLine = 1; indexLine < twoDArray.length; indexLine ++) {
            let value = twoDArray[indexLine][indexCol];
            if (typeof value === 'string') value = doNotParse(value);
            convertedData[indexLine][length] = value ? value : ''; // Add an empty string if there is no value (to avoid bugs later on when adding test steps)
        }
        indexCol ++;
    }
}


// Make the json string compatible with the json format to be able to read it as an object
const formatJsonString = jsonString => {
    const newJsonString = jsonString.replace(/""/g, '"'); // Replace "" by "
    return newJsonString;
}


// Do not parse \n, \r and semicolons inside of a single cell
const doNotParse = string => {
    string = string.replace(/"/g, '""');
    return `"${string}"`;
}


// Find the position of the issue (the number of the line) in the new table
const getIssueLineInNewTable = issueKey => {
    for (let i = 0; i < convertedData.length; i++) {
        if (convertedData[i][0] === `"${issueKey}"`) {
            return i;
        }
    }
    return -1;
}


// Insert new lines inside of an array
// linesArray: Array containing all of the lines to add in the table
// Position: index of the new line
const insertNewLines = (linesArray, position) => {
    const firstPart = convertedData.slice(0, position);
    const secondPart = convertedData.slice(position);
    convertedData = firstPart.concat(linesArray).concat(secondPart);
}


// Show the logs of the json parsing errors to the interface
const addParsingErrorToHtml = (issueKey, error, jsonString) => {
    const errorsDivElement = document.getElementById('errors');
    
    // Create a div to contain the parsing error for a particular issue
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';

    // Add a small title to indicate which issue key is concerned
    const errorTitle = document.createElement('h3');
    errorTitle.innerHTML = `Erreur pour <span>${issueKey}</span> : `;

    // Add a small paragraph to inform that the json object cannot be parsed
    const firstParagraph = document.createElement('p');
    firstParagraph.innerText = 'Impossible de parser les données JSON de la colonne "Custom field (Manual Test Steps)"';
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


const addManualTestSteps = () => {
    // Retrieval of the column positions of Action, Data, Result and TCID columns (in the new table)
    const actionIndex = getColumnIndex("Action", convertedData);
    const dataIndex = getColumnIndex("Data", convertedData);
    const resultIndex = getColumnIndex("Result", convertedData);
    const tcidIndex = getColumnIndex("TCID", convertedData);
    
    for (let i = 1; i < twoDArray.length; i ++) {

        const newLines = [];
        let issueKey = twoDArray[i][0];
        let issueIndex = getIssueLineInNewTable(issueKey);

        // Add the TCID
        if (issueKey.length > 0 && convertedData[issueIndex]) {
            convertedData[issueIndex][tcidIndex] = `"${i}"`;
        }

        // Parse the rows array to extract the json string containing the test steps
        // Note: Because the 2 dimensions array contains the json string WITHOUT quotes, it's not possible to read the json string.
        // It was complicated to add quotes manually in this json string so the solution was to use the function split() that automatically adds quotes.
        // So we get the json string from the rowsArray and not from the twoDArray
        const firstSection = rowsArray[i] && rowsArray[i].split('[{')[1];
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
            console.log(`Issue ${issueKey}: Cannot parse JSON data (Custom field (Manual Test Steps))`);
            console.log(error[1]);
            console.log(jsonString);
        }

        // Add test steps data (columns: Action, Data, Result) to the final array
        jsonObject.forEach((testStep, pos) => {
            const fields = testStep.fields;
            const action = doNotParse(fields['Action']);
            const data = doNotParse(fields['Data']);
            const result = doNotParse(fields['Expected Result']);
            if (pos === 0) { // Add the first test step directly in the issue line
                convertedData[issueIndex][actionIndex] = action;
                convertedData[issueIndex][dataIndex] = data;
                convertedData[issueIndex][resultIndex] = result;
            } else { // For the additional test steps: make new lines
                const newLine = new Array(convertedData[0].length);
                newLine.fill('');
                newLine[actionIndex] = action;
                newLine[dataIndex] = data;
                newLine[resultIndex] = result;
                newLine[tcidIndex] = `"${i}"`; // Add the TCID in the new line
                newLines.push(newLine);
            }
        });

        // Add the new lines to the convertedData array
        insertNewLines(newLines, issueIndex + 1);
    }
}


const getColumnIndex = (columnName, tableName = twoDArray) => {
    const header = tableName[0];
    return header.indexOf(columnName);
}


export default convertData;