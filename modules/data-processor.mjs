const processData = content => {

    const rowsArray = content.split(/\r\n/);
    const twoDArray = [];

    rowsArray.forEach(line => {
        const columnsArray = line.split(';');
        twoDArray.push(columnsArray);
    });

    return convertData(twoDArray);    
}

const convertData = initialData => {

    const convertedData = initialData; 
    // TODO: convertir/transformer les données
   
    return convertedData;
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