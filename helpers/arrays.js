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


// This function returns the index of the column in the table
// Returns -1 if the column has not been found
const getColumnIndex = (columnName, array) => {
    const header = Array.isArray(array[0]) ? array[0] : array; // Check if the array is an array with 2 dimensions and if so search the position only in the headers (index 0)
    return header.indexOf(columnName);
}