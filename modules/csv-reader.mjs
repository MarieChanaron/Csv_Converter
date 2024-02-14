// This finction takes in the file and returns the content of the file as a string
const readFile = async(file) => {
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
    
      reader.onload = () => {
        resolve(reader.result);
      }
  
      reader.onerror = () => {
        reject("FileReader is not supported on this browser or the file has not been loaded properly.");
      }

      reader.readAsText(file); // Read the file as a string of characters
    });

};

export default readFile;