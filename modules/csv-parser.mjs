// Separate our columns by semicolon
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
                if (!withinQuotes) { // If the semicolons are within quotes then it's part of the text and not a column separator
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
    // Create an array where each item is a row in our table
    const rowsArray = content.split(/\r\n/);
    const twoDArray = [];
    
    // Parse our rows array more finely to make a two dimensions array where each item in the second level arrays are the columns
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