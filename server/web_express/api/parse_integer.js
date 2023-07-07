function parseInteger(value, defaultValue) {
    const parsedValue = parseInt(value, 10); // Parsing with radix 10 (decimal)
  
    if (isNaN(parsedValue)) {
      return defaultValue;
    }
  
    return parsedValue;
  }

// Export the parseInteger function
export default parseInteger;
