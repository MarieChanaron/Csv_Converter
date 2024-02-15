// Make the json string compatible with the json format to be able to read it as an object
const formatAsJsonString = jsonString => {
    const newJsonString = jsonString.replace(/""/g, '"');
    return newJsonString;
}


// Do not allow Excel to parse \n, \r and semicolons inside of a single cell
const formatAsCellContent = string => {
    string = string.replace(/"/g, '""');
    return `"${string}"`;
}