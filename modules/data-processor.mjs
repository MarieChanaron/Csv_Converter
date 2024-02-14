let initialData = [];
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


// This function returns an object where:
// Each key is the name of each column in the first table (all the columns and not only the ones needed)
// Values are integers representing the number of times this column is found in the first table
const countHeaders = () => {
    let headersCount = initialData[0].reduce((accumulator, currentValue) => {
        return accumulator[currentValue] ? ++accumulator[currentValue] :
                                            accumulator[currentValue] = 1,
                                            accumulator
    }, {});
    return headersCount;
}


// Indicate to the user that a column is missing in the first table
const addMissingColumnToHtml = header => {
    const p = document.createElement('p');
    p.innerText = `La colonne ${header} n'existe pas dans le fichier d'origine.`;
    const errorsDivElement = document.getElementById('errors');
    errorsDivElement.appendChild(p);
}


// This function copies the values of the first table into the new table.
const copyPasteValues = (inputHeader, outputHeader) => {
    let indexCol = getColumnIndex(inputHeader);
    if (inputHeader && indexCol === -1) {
        console.log(`La colonne ${inputHeader} n'existe pas dans le fichier d'origine.`);
        addMissingColumnToHtml(inputHeader);
    }
    let count = columnsCount[inputHeader];
    
    for (let i = 0; (count && i < columnsCount[inputHeader]) || (!count && i < 1); i ++) {
        const length = convertedData[0].length; // To place the new column just after the previous one
        convertedData[0][length] = outputHeader;

        for (let indexLine = 1; indexCol !== -1 && indexLine < initialData.length; indexLine ++) {
            let value = initialData[indexLine][indexCol];
            if (typeof value === 'string') value = doNotParse(value);
            convertedData[indexLine][length] = value ? value : ''; // Add an empty string if there is no value (to avoid bugs later on when adding test steps)
        }
        indexCol ++;
    }
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


const addManualTestSteps = testStepsIndex => {
    // Retrieval of the column positions of Action, Data, Result and TCID columns (in the new table)
    const actionIndex = getColumnIndex('Action', convertedData);
    const dataIndex = getColumnIndex('Data', convertedData);
    const resultIndex = getColumnIndex('Result', convertedData);
    const tcidIndex = getColumnIndex('TCID', convertedData);
    
    for (let i = 1; i < initialData.length; i ++) {

        const newLines = [];
        let issueKey = initialData[i][0];
        let issueIndex = getIssueLineInNewTable(issueKey);

        // Add the TCID
        if (issueKey.length > 0 && convertedData[issueIndex]) {
            convertedData[issueIndex][tcidIndex] = `"${i}"`;
        }

        const jsonObject = initialData[i][testStepsIndex];

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


// Return the index of the column in the table (by default the first table if there is only one argument)
// Returns -1 if the column has not been found
const getColumnIndex = (columnName, tableName = initialData) => {
    const header = tableName[0];
    return header.indexOf(columnName);
}


// The default function
const convertData = parsedData => {
    // Initialize global variables used throughout our functions
    initialData = parsedData; // Contains all the data parsed in the CSV
    columnsCount = countHeaders();

    for (let i = 0; i < initialData.length; i ++) {
        convertedData[i] = []; // Fill convertedData with empty arrays to indicate the browser that convertedData is going to be a 2 dimensions array (to avoid some bugs linked to data types later on)
    }

    for (const header in headers) {
        copyPasteValues(headers[header], header);
    }

    const testStepsIndex = getColumnIndex('Custom field (Manual Test Steps)');
    addManualTestSteps(testStepsIndex);

    return convertedData;
}


export default convertData;