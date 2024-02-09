const twoDArray = [];
const convertedData = [];
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

        for (let indexLine = 1; inputHeader && indexLine < twoDArray.length; indexLine ++) {
            const value = twoDArray[indexLine][indexCol];
            convertedData[indexLine][length] = value;
        }
        indexCol ++;
    }
}


const formatJsonString = jsonString => {
    jsonString = jsonString.substring(1, jsonString.length - 1);
    return jsonString.replace(/""/g, '"');
}


const addManualTestSteps = () => {
    const headerInEntryFile = "Custom field (Manual Test Steps)";
    const colIndex = getColumnIndex(headerInEntryFile);

    // Voir si on peut rajouter une boucle à ce niveau

    // Test avec une première issue
    const issueIndex = 25;
    const testStepsValue = formatJsonString(twoDArray[issueIndex][colIndex]);
    const testStepsJsonObject = JSON.parse(testStepsValue);
    console.log(testStepsJsonObject);
    testStepsJsonObject.forEach(testStep => {
        const fields = testStep.fields;
        console.log(fields);
        const dataIndex = getColumnIndex("");
    });
    // const nbOfLinesToAdd = testStepsJsonObject.length - 1;
    
    // Ajout des lignes
    // const arrayLength = convertedData.length;
    // for (let i = 0; i < nbOfLinesToAdd; i ++) {
    //     convertedData[arrayLength + i] = new Array(convertedData[0].length);
    // }
    // console.log(convertedData);

    // Décalage des lignes vers le bas

}


const getColumnIndex = (columnName, tableName = twoDArray) => {
    const header = twoDArray[0];
    return header.indexOf(columnName);
}


// const getTestSteps = jsonObject => {
//     const fields = jsonObject.fields;
//     const action = fields['Action'];
//     const data = fields['Data'];
//     const result = fields['Expected Result'];
//     return [[action], [data], [result]];
// }


export default processData;