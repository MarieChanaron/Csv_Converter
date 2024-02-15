let initialData; // 2 dimensional array containing the data received
let convertedData; // 2 dimensional array containing the converted data
// 2 dimensional array : 1st dimension = rows - 2nd dimension = columns

let columnsCount = {}; // Value initialized by the function countHeaders()

let tcidIndex, actionIndex, dataIndex, resultIndex; // The positions of the columns TCID, Action, Data and Result in the table of destination (starting from zero)
let testStepsIndex; // The position of the column Custom field (Manual Test Steps) in the table of origin (starting from zero). This column matches the columns Action, Data and Result in the new table


// This function copies the values of the first table into the new table.
const copyPasteValues = (inputHeader, outputHeader) => {
    let indexCol = getColumnIndex(inputHeader, initialData); // Position of the column
    let count = columnsCount[inputHeader]; // Number of times a column should be added

    if (inputHeader && !count) {
        logColumnMissingError(inputHeader);
    }
    
    for (let i = 0; (count && i < columnsCount[inputHeader]) || (!count && i < 1); i ++) {
        const length = convertedData[0].length; // To place the new column just after the previous one
        convertedData[0][length] = outputHeader;

        for (let rowIndex = 1; count && rowIndex < initialData.length; rowIndex ++) {
            let value = initialData[rowIndex][indexCol];
            if (typeof value === 'string') value = formatAsCellContent(value);
            if (!convertedData[rowIndex]) convertedData[rowIndex] = [];
            convertedData[rowIndex][length] = value ? value : ''; // Add an empty string if there is no value (to avoid bugs later on when adding test steps)
        }
        indexCol ++;
    }
}


// Insert new entries inside of an array
// rowsArray: Array containing all of the rows to add in the table
// Position: index of the row where we want to start to insert the new rows
const insertNewRows = (rowsArray, position) => {
    const firstPart = convertedData.slice(0, position);
    const secondPart = convertedData.slice(position);
    convertedData = firstPart.concat(rowsArray).concat(secondPart);
}


// Fill the columns TCID, Action, Data and Result
// Return the number of rows inserted
const copyPasteTestSteps = (indexOrigin, indexDestination) => {
    // Add The TCID. The TCID is added outside of the foreach loop below because some issues may not have some test steps
    if (initialData[indexOrigin][0].length && convertedData[indexDestination]) {
        convertedData[indexDestination][tcidIndex] = `"${indexOrigin}"`;
    }
    
    // Add test steps data (columns: Action, Data, Result) to the final array
    const newRows = [];
    let jsonObject = initialData[indexOrigin][testStepsIndex];
    if (!jsonObject) return newRows.length; // To fix bugs in different browsers in case jsonObject is undefined (can happen if the column did not exist in the file of origin)
    
    jsonObject.forEach((testStep, pos) => {
        const {fields} = testStep;
        const action = formatAsCellContent(fields[ACTION_JSON_PROPERTY]);
        const data = formatAsCellContent(fields[DATA_JSON_PROPERTY]);
        const result = formatAsCellContent(fields[RESULT_JSON_PROPERTY]);

        if (pos === 0) { // Add the first test step directly in the issue row
            convertedData[indexDestination][actionIndex] = action;
            convertedData[indexDestination][dataIndex] = data;
            convertedData[indexDestination][resultIndex] = result;
        } else { // For the additional test steps: make new rows
            const newRow = new Array(convertedData[0].length);
            newRow.fill('');
            newRow[actionIndex] = action;
            newRow[dataIndex] = data;
            newRow[resultIndex] = result;
            newRow[tcidIndex] = `"${indexOrigin}"`; // Add the TCID in the new row
            newRows.push(newRow);
        }
    });
    
    insertNewRows(newRows, indexDestination + 1); // Add the new rows to the convertedData array
    return newRows.length; // Returns the numbers of rows added
}


const addManualTestSteps = () => {
    // Retrieval of the column positions of Action, Data, Result and TCID columns (in the new table)
    tcidIndex = getColumnIndex(TCID_HEADER, convertedData);
    actionIndex = getColumnIndex(ACTION_HEADER, convertedData);
    dataIndex = getColumnIndex(DATA_HEADER, convertedData);
    resultIndex = getColumnIndex(RESULT_HEADER, convertedData);
    // Get index of the column in the table of origin
    testStepsIndex = getColumnIndex(TEST_STEPS_HEADER, initialData);

    let issueIndex = 1;
    
    for (let i = 1; i < initialData.length; i ++) {
        const nrOfNewRows = copyPasteTestSteps(i, issueIndex);
        issueIndex += nrOfNewRows ? nrOfNewRows + 1 : 1;
    }
}


// The default function
const convertData = parsedData => {
    // Initialize global variables used throughout our functions
    convertedData = [[]]; // Reinitialize the value in case the form is resubmitted (avoid keeping old data in cache)
    initialData = parsedData;
    columnsCount = countHeaders(initialData[0]); 

    for (const header in HEADERS) {
        copyPasteValues(HEADERS[header], header);
    }

    addManualTestSteps();

    return convertedData;
}


export default convertData;