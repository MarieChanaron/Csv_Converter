// This function generates the output CSV file
const writeCsv = twoDArray => {

    // Transform the 2D array into a string 
    const lines = [];

    twoDArray.forEach(element => {
        const joinedColumns = element.join(';');
        lines.push(joinedColumns);
    });

    const csvContent = lines.join('\r\n');

    // Create a new CSV file
    const csvFile = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(csvFile);

    // Download the CSV file
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fichierFinal.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

export default writeCsv;