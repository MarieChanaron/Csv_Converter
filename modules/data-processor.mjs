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

export default processData;