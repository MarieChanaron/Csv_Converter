const twoDArray = [];
const convertedData = [];

const processData = content => {

    const rowsArray = content.split(/\r\n/);
    
    rowsArray.forEach(line => {
        const columnsArray = line.split(';');
        twoDArray.push(columnsArray);
    });

    console.log(rowsArray);
    console.log(twoDArray);

    return convertData();    
}

const convertData = () => {

    for (let i = 0; i < twoDArray.length; i ++) {
        convertedData[i] = [];
    }

    copyPasteValues('Issue key', 'Issue Key');
    copyPasteValues('Issue Type', 'Type');
    
    console.log(convertedData);

    return convertedData;
}

const copyPasteValues = (inputHeader, outputHeader) => {
    const indexCol = getColumnIndex(inputHeader);
    const length = convertedData[0].length;
    convertedData[0][length] = outputHeader;

    for (let indexLine = 1; indexLine < twoDArray.length; indexLine ++) {
        const value = twoDArray[indexLine][indexCol];
        convertedData[indexLine][length] = value;
    }
}

const getColumnIndex = columnName => {
    const header = twoDArray[0];
    return header.indexOf(columnName);
}

const parseJson = jsonString => {
    const jsonObject = JSON.parse(jsonString);
    const fields = jsonObject[0].fields;
    const action = fields['Action'];
    const data = fields['Data'];
    const result = fields['Expected Result'];
    return [[action], [data], [result]];
}

export default processData;