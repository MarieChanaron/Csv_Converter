let initialData; // 2 dimensional array containing the data received
let convertedData; // 2 dimensional array containing the converted data
// 2 dimensional array : 1st dimension = rows - 2nd dimension = columns

let tcidIndex, actionIndex, dataIndex, resultIndex; // The positions of the columns TCID, Action, Data and Result in the table of destination (starting from zero)
let testStepsIndex; // The position of the column Custom field (Manual Test Steps) in the table of origin (starting from zero). This column matches the columns Action, Data and Result in the new table


// Insert new entries inside of an array
// rowsArray: Array containing all of the rows to add in the table
// Position: index of the row where we want to start to insert the new rows
const insertNewRows = (rowsArray, position) => {
    const firstPart = convertedData.slice(0, position);
    const secondPart = convertedData.slice(position);
    convertedData = firstPart.concat(rowsArray).concat(secondPart);
}


// This function writes the test steps in the new table
// Ths first test step is added to the issue line
// Further test steps are added to new lines that are inserted to the final table
const insertTestSteps = (jsonObject, rowIndex, tcid) => {
    let newRows = [];

    jsonObject.forEach((testStep, pos) => {
        const {fields} = testStep;
        const action = formatAsCellContent(fields[ACTION_JSON_PROPERTY]);
        const data = formatAsCellContent(fields[DATA_JSON_PROPERTY]);
        const result = formatAsCellContent(fields[RESULT_JSON_PROPERTY]);

        if (pos === 0) { // Add the first test step directly in the issue row
            convertedData[rowIndex][actionIndex] = action;
            convertedData[rowIndex][dataIndex] = data;
            convertedData[rowIndex][resultIndex] = result;
        } else { // For the additional test steps: make new rows
            const newRow = new Array(convertedData[0].length).fill('');
            newRow[tcidIndex] = `"${tcid}"`; // Add the TCID in the new row
            newRow[actionIndex] = action;
            newRow[dataIndex] = data;
            newRow[resultIndex] = result;
            newRows.push(newRow);
        }
    });
    
    if (newRows.length) insertNewRows(newRows, rowIndex + 1); // Add the new rows to the convertedData array
    return newRows.length;
}


// Fill the columns TCID, Action, Data and Result
// Return the number of rows inserted
// originIndex: index of the row of the issue in initialData
// destinationIndex: index of the row of the issue in convertedData
const copyPasteTestSteps = (originIndex, destinationIndex) => {
    // Add The TCID. The TCID is added outside of the foreach loop below because some issues may not have some test steps
    const tcid = originIndex;
    if (initialData[originIndex][0].length && convertedData[destinationIndex]) {
        convertedData[destinationIndex][tcidIndex] = `"${tcid}"`;
    }
    
    // Add test steps data (columns: Action, Data, Result) to the final array
    let jsonObject = initialData[originIndex][testStepsIndex]; // Get test steps
    const newRowsNr = jsonObject ? insertTestSteps(jsonObject, destinationIndex, tcid) : 0; // Insert test steps only if jsonObject exists, and if so assign the number of rows inserted, or zero if jsonObject does not exist.

    return newRowsNr; // Returns the numbers of rows added
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


// This function copies the values of the first table into the new table.
const copyPasteValues = (inputHeader, outputHeader, count) => {
    let indexCol = getColumnIndex(inputHeader, initialData); // Position of the column in the initialData array

    if (inputHeader && !count) { // If the inputHeader matches with a required outputHeader, but the column containing this inputHeader doesn't exist in initialData
        logColumnMissingError(inputHeader);
    }
    
    for (let i = 0; (count && i < count) || (!count && i < 1); i ++) {
        const length = convertedData[0].length; // To place the new column just after the previous one
        convertedData[0][length] = outputHeader; // Always add a column with at least a header in convertedData

        for (let rowIndex = 1; count && rowIndex < initialData.length; rowIndex ++) {
            let value = initialData[rowIndex][indexCol];
            if (typeof value === 'string') value = formatAsCellContent(value);
            if (!convertedData[rowIndex]) convertedData[rowIndex] = [];
            convertedData[rowIndex][length] = value ? value : ''; // Add an empty string if there is no value (to avoid bugs later on when adding test steps)
        }
        indexCol ++;
    }
}



// The default function
const convertData = parsedData => {
    // Initialize global variables used throughout our functions
    convertedData = [[]]; // Reinitialize the value in case the form is resubmitted (avoid keeping old data in cache)
    initialData = parsedData;
    const columnsCount = countHeaders(initialData[0]);

    for (const columnName in HEADERS) {
        const inputColumnName = HEADERS[columnName];
        const outputColumnName = columnName;
        const count = columnsCount[inputColumnName]; // Number of times a particular column (header) should be added
        copyPasteValues(inputColumnName, outputColumnName, count);
    }

    addManualTestSteps();

    return convertedData;
}


export default convertData;