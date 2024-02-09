const twoDArray = [];
let convertedData = [];
let columnsCount = 0;


/*
Correspondance between the input file and the output file.
On the left: input file
On the right: output file
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
    "Components": undefined,
    "Test Repository Path": "Custom field (Test Repository Path)",
    "Link \"Tests\"": "Outward issue link (Tests)",
    "Link \"Defect\"": "Outward issue link (Defect)",
    "Link \"Cloners\"": "Outward issue link (Cloners)",
    "Reporter": "Reporter",
    "Assignee": "Assignee",
    "Label": "Labels",
    "Custom field (Test Level)": "Custom field (Test Level)",
    "Custom field (Steps Count)": "Custom field (Steps Count)",
    "Environment": "Environment",
    "Created": "Created"
}


const processData = content => {
    const rowsArray = content.split(/\r\n/);
    
    rowsArray.forEach(line => {
        const columnsArray = line.split(';');
        twoDArray.push(columnsArray);
    });

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
            const value = twoDArray[indexLine][indexCol];
            convertedData[indexLine][length] = value ? value : ''; // Add an empty string if there is no value (to avoid bugs later on when adding test steps)
        }
        indexCol ++;
    }
}


const formatJsonString = jsonString => {
    if (jsonString[0] === '"') {
        jsonString = jsonString.substring(1, jsonString.length - 1);
    }
    const newString = jsonString.replace(/""/g, '"');
    return newString;
}


const handleLineBreaks = string => {
    return string.replace(/[\r\n]/g, '');
}


const getIssueLineInNewTable = issueKey => {
    for (let i = 0; i < convertedData.length; i ++) {
        if (convertedData[i][0] === issueKey) {
            return i;
        }
    }
}


const addManualTestSteps = () => {
    const headerInEntryFile = "Custom field (Manual Test Steps)";
    const colIndex = getColumnIndex(headerInEntryFile);

    // Récupération de la position des colonnes Action, Data et Result dans le nouveau tableau
    const actionIndex = getColumnIndex("Action", convertedData);
    const dataIndex = getColumnIndex("Data", convertedData);
    const resultIndex = getColumnIndex("Result", convertedData);
    
    for (let i = 1; i < twoDArray.length; i ++) {
        
        const testStepsString = twoDArray[i][colIndex];
        let testStepsValue = '';
        if (testStepsString) testStepsValue = formatJsonString(twoDArray[i][colIndex]);
        let testStepsJsonObject;
        
        try {
            testStepsJsonObject = JSON.parse(testStepsValue);
        } catch (error) {
            testStepsJsonObject = [];
        }

        const newLines = [];
        let issueKey = twoDArray[i][0];
        let issueIndex = getIssueLineInNewTable(issueKey);

        testStepsJsonObject.forEach((testStep, pos) => {
            const fields = testStep.fields;
            const action = handleLineBreaks(fields['Action']);
            const data = handleLineBreaks(fields['Data']);
            const result = handleLineBreaks(fields['Expected Result']);
            if (pos === 0) { // First test step: add it directly in the issue line
                convertedData[issueIndex][actionIndex] = action;
                convertedData[issueIndex][dataIndex] = data;
                convertedData[issueIndex][resultIndex] = result;
            } 
            else { // For the additional test steps: make new lines
                const newLine = new Array(convertedData[0].length);
                newLine.fill('');
                newLine[actionIndex] = action;
                newLine[dataIndex] = data;
                newLine[resultIndex] = result;
                newLines.push(newLine);
            }
        });

        // Add the new lines to the convertedData array
        const firstPart = convertedData.slice(0, issueIndex + 1);
        const secondPart = convertedData.slice(issueIndex + 1);
        convertedData = firstPart.concat(newLines).concat(secondPart);
    }
}


const getColumnIndex = (columnName, tableName = twoDArray) => {
    const header = tableName[0];
    return header.indexOf(columnName);
}


export default processData;