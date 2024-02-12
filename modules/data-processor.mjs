let rowsArray = [];
const twoDArray = [];
let convertedData = [];
let columnsCount = 0;


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


const parseRowIntoColumns = row => {
    const columnsArray = [];
    let withinQuotes = false;
    let currentColumn = [];

    for (let i = 0; i < row.length; i ++) {
        const char = row[i];

        switch (char) {
            case '"':
                withinQuotes = !withinQuotes;
                break;
            case ';':
                if (!withinQuotes) {
                    const col = currentColumn.join('');
                    columnsArray.push(col);
                    currentColumn = [];
                } else {
                    currentColumn.push(char);
                }
                break;
            default:
                currentColumn.push(char);
        }
    }
    columnsArray.push(currentColumn); // Push the last column
    return columnsArray;
}


const processData = content => {
    rowsArray = content.split(/\r\n/);
    
    rowsArray.forEach(row => {
        const columnsArray = parseRowIntoColumns(row);
        twoDArray.push(columnsArray);
    });

    console.log(twoDArray);

    columnsCount = countHeaders();
    return convertData();   
}


const countHeaders = () => {
    let headersCount = twoDArray[0].reduce((accumulator, currentValue) => {
        return accumulator[currentValue] ? ++accumulator[currentValue] :
                                            accumulator[currentValue] = 1,
                                            accumulator
    }, {});
    return headersCount;
}


const convertData = () => {
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


const formatJsonString = jsonString => {
    const newJsonString = jsonString.replace(/""/g, '"');
    return newJsonString;
}


// Do not parse \n, \r and semicolons inside of a single cell
const doNotParse = string => {
    string = string.replace(/"/g, '""');
    return `"${string}"`;
}


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


const addManualTestSteps = () => {
    const headerInEntryFile = "Custom field (Manual Test Steps)";
    const colIndex = getColumnIndex(headerInEntryFile);

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
            convertedData[issueIndex][tcidIndex] = `"${i.toString()}"`;
        }

        // Add the test steps (Action, Data, Result)
        const firstSection = rowsArray[i].split('[{')[1];
        let secondSection;
        if (firstSection) {
            secondSection = firstSection.split('}]')[0];
            if (secondSection[secondSection.length - 1] === ':') secondSection += '""""';
        }
        let jsonString = secondSection ? `[{${formatJsonString(secondSection)}}]` : '[]';
        
        // Parse the JSON string
        let jsonObject;

        try {
            jsonObject = JSON.parse(jsonString);
        } catch (error) {
            console.log(error);
            console.log(`Cannot parse JSON data for issue ${issueKey}`);
            console.log(`Cannot read the test steps (action/data/result columns) for the issue ${issueKey}`);
            console.log(jsonString);
            jsonObject = [];
        }

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
                newLine[tcidIndex] = `"${i.toString()}"`; // Add the TCID in the new line
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


export default processData;