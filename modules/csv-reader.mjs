const readFile = file => {
    
    const reader = new FileReader();
  
    reader.addEventListener('load', () => {
        const content = reader.result;
        console.log(content);
        document.querySelector('p').innerText = content;
    }, false);
  
    if (file) {
      reader.readAsText(file);
    }
};

export default readFile;