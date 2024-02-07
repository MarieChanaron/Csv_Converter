const readFile = async(file) => {
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
    
      reader.onload = () => {
        resolve(reader.result);
      }
  
      reader.onerror = () => {
        reject("FileReader is not supported on this browser");
      }

      reader.readAsText(file);
    });

};

export default readFile;