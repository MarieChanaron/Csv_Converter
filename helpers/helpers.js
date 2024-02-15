// This function returns an object where:
// Each key is the name of each column in the first table (all the columns and not only the ones needed)
// Values are integers representing the number of times this column is found in the first table
const countHeaders = array => {
    let headersCount = array.reduce((accumulator, currentValue) => {
        return accumulator[currentValue] ? ++accumulator[currentValue] :
                                            accumulator[currentValue] = 1,
                                            accumulator
    }, {});
    return headersCount;
}


// Return the index of the column in the table
// Returns -1 if the column has not been found
const getColumnIndex = (columnName, tableName) => {
    const header = Array.isArray(tableName[0]) ? tableName[0] : tableName;
    return header.indexOf(columnName);
}