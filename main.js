const readFile = () => {
    const [file] = document.getElementById('file-input').files;
    const reader = new FileReader();
  
    reader.addEventListener(
        'load',
        () => {
            // this will then display a text file
            const content = reader.result;
            document.querySelector('p').innerText = content;
            processData(content);
        },
        false,
    );
  
    if (file) {
      reader.readAsText(file);
    }
}

const processData = content => {
    console.log(content);
}

const downloadFile = () => {
    return null;
}