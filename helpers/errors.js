const logColumnMissingError = columnName => {
    console.log(`La colonne ${columnName} n'existe pas dans le fichier d'origine.`);
    const p = document.createElement('p');
    p.innerHTML = `La colonne <i>${columnName}</i> n'existe pas dans le fichier d'origine.`;
    const errorsDivElement = document.getElementById('errors');
    errorsDivElement.appendChild(p);
}


// Show the logs of the json parsing errors to the interface
const logParsingError = (issueKey, error, jsonString, columnName) => {
    // Show errors in the console
    console.log(`Issue ${issueKey}: Cannot parse JSON data (${columnName})`);
    console.log(error);
    console.log(jsonString);
    
    // Create a div to contain the parsing error for a particular issue
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    
    // Add a small title to indicate which issue key is concerned
    const errorTitle = document.createElement('h3');
    errorTitle.innerHTML = `Erreur pour <span>${issueKey}</span> : `;
    
    // Add a small paragraph to inform that the json object cannot be parsed
    const firstParagraph = document.createElement('p');
    firstParagraph.innerText = `Impossible de parser les données JSON de la colonne ${columnName}`;
    // Add a small paragraph to log the exact error message returned by the browser
    const secondParagraph = document.createElement('p');
    secondParagraph.innerHTML = `Message : <span>${error}</span>`;
    
    // Add a textarea (with an inner scroll) to display the content of the json object that cannot be parsed
    const textarea = document.createElement('textarea');
    textarea.innerText = jsonString;
    
    // Add the error to the DOM
    errorDiv.appendChild(errorTitle);
    errorDiv.appendChild(firstParagraph);
    errorDiv.appendChild(secondParagraph);
    errorDiv.appendChild(textarea);
    const errorsDivElement = document.getElementById('errors');
    errorsDivElement.appendChild(errorDiv);
    
    // Show the logs
    const logsDiv = document.getElementById('logs');
    logsDiv.removeAttribute('hidden');
}