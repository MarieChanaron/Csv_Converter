const twoDArray = [];

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

    // const convertedData = twoDArray;
    const convertedData = []; 
    // TODO: convertir/transformer les données

    // Issue Key
    // const columnName = "Status";
    // const header = initialData[0];
    // const index = header.indexOf(columnName);
    // console.log("Index du status :" + index);
    const index = getColumnIndex("Issue key");
    console.log(`index: ${index}`);

    // const colIndexInNewTable = 0;
    for (let i = 0; i < twoDArray.length; i ++) {
        const value = twoDArray[i][index];
        console.log(value);
        
    }
    

    return convertedData;
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