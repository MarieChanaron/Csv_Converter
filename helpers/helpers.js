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


