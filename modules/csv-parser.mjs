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


const parseData = content => {
    const rowsArray = content.split(/\r\n/);
    const twoDArray = [];
    
    rowsArray.forEach(row => {
        const columnsArray = parseRowIntoColumns(row);
        twoDArray.push(columnsArray);
    });

    return {
        rows: rowsArray,
        columns: twoDArray
    };   
}

export default parseData;